using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Budget.Api.DTOs.Auth;
using Budget.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Budget.IntegrationTests.Infrastructure;

public static class AuthHelper
{
    private const string TestSigningKey = "TestSigningKey-SuperSecretKey-AtLeast32Bytes!!";
    private const string TestIssuer = "TestIssuer";
    private const string TestAudience = "TestAudience";

    public static string GenerateTestJwt(string userId, string email, TimeSpan? expiry = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestSigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: TestIssuer,
            audience: TestAudience,
            claims: claims,
            expires: DateTime.UtcNow.Add(expiry ?? TimeSpan.FromMinutes(15)),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static HttpClient CreateAuthenticatedClient(BudgetApiFactory factory, string userId, string email)
    {
        var client = factory.CreateClient();
        var token = GenerateTestJwt(userId, email);
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public static async Task<string> SeedUserAsync(BudgetApiFactory factory, string email)
    {
        using var scope = factory.Services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email
        };

        var result = await userManager.CreateAsync(user, "TestPassword123");
        if (!result.Succeeded)
            throw new Exception($"Failed to seed user: {string.Join(", ", result.Errors.Select(e => e.Description))}");

        return user.Id;
    }

    public static async Task<(string AccessToken, string RefreshToken)> RegisterAndAuthenticateAsync(
        BudgetApiFactory factory, string email, string password)
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });
        response.EnsureSuccessStatusCode();

        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        return (tokens!.AccessToken, tokens.RefreshToken);
    }
}
