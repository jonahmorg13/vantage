using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Budget.Api.DataAccess;
using Budget.Api.DTOs.Auth;
using Budget.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Budget.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly BudgetDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(UserManager<ApplicationUser> userManager, BudgetDbContext db, IConfiguration config)
    {
        _userManager = userManager;
        _db = db;
        _config = config;
    }

    public async Task<(AuthTokensResponse? Tokens, ErrorResponse? Error, int StatusCode)> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            return (null, new ErrorResponse { Message = "Email already registered" }, 409);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return (null, new ErrorResponse
            {
                Message = "Registration failed",
                Errors = result.Errors.Select(e => e.Description)
            }, 400);
        }

        var tokens = await GenerateTokensAsync(user);
        return (tokens, null, 201);
    }

    public async Task<(AuthTokensResponse? Tokens, ErrorResponse? Error, int StatusCode)> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return (null, new ErrorResponse { Message = "Invalid email or password" }, 401);
        }

        var tokens = await GenerateTokensAsync(user);
        return (tokens, null, 200);
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        var token = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (token is null) return false;

        token.IsRevoked = true;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(AuthTokensResponse? Tokens, ErrorResponse? Error)> RefreshAsync(string refreshToken)
    {
        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken is null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
        {
            return (null, new ErrorResponse { Message = "Invalid or expired refresh token" });
        }

        // Revoke old token
        storedToken.IsRevoked = true;
        await _db.SaveChangesAsync();

        // Issue new pair
        var tokens = await GenerateTokensAsync(storedToken.User);
        return (tokens, null);
    }

    private async Task<AuthTokensResponse> GenerateTokensAsync(ApplicationUser user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return new AuthTokensResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    private string GenerateAccessToken(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SigningKey"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expirationMinutes = int.Parse(_config["Jwt:AccessTokenExpirationMinutes"] ?? "15");

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> CreateRefreshTokenAsync(string userId)
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(64);
        var tokenString = Convert.ToBase64String(tokenBytes);

        var expirationDays = int.Parse(_config["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var refreshToken = new RefreshToken
        {
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return tokenString;
    }
}
