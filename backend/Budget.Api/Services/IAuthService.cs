using Budget.Api.DTOs.Auth;

namespace Budget.Api.Services;

public interface IAuthService
{
    Task<(AuthTokensResponse? Tokens, ErrorResponse? Error, int StatusCode)> RegisterAsync(RegisterRequest request);
    Task<(AuthTokensResponse? Tokens, ErrorResponse? Error, int StatusCode)> LoginAsync(LoginRequest request);
    Task<bool> LogoutAsync(string refreshToken);
    Task<(AuthTokensResponse? Tokens, ErrorResponse? Error)> RefreshAsync(string refreshToken);
}
