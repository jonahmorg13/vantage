namespace Budget.Api.DTOs.Auth;

public class AuthTokensResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
}
