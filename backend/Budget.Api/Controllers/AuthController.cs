using Budget.Api.DTOs.Auth;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (tokens, error, statusCode) = await _authService.RegisterAsync(request);
        if (error is not null)
            return StatusCode(statusCode, error);

        return StatusCode(201, tokens);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (tokens, error, statusCode) = await _authService.LoginAsync(request);
        if (error is not null)
            return StatusCode(statusCode, error);

        return Ok(tokens);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        await _authService.LogoutAsync(request.RefreshToken);
        return NoContent();
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        var (tokens, error) = await _authService.RefreshAsync(request.RefreshToken);
        if (error is not null)
            return Unauthorized(error);

        return Ok(tokens);
    }
}
