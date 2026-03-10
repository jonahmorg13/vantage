using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Auth;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Auth;

public class RefreshTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;
    private readonly HttpClient _client;

    public RefreshTests(BudgetApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Refresh_ValidToken_Returns200WithNewTokenPair()
    {
        var email = $"refresh-{Guid.NewGuid()}@test.com";
        var (_, refreshToken) = await AuthHelper.RegisterAndAuthenticateAsync(_factory, email, "ValidPass123");

        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = refreshToken
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        Assert.NotNull(tokens);
        Assert.False(string.IsNullOrEmpty(tokens.AccessToken));
        Assert.False(string.IsNullOrEmpty(tokens.RefreshToken));
        Assert.NotEqual(refreshToken, tokens.RefreshToken);
    }

    [Fact]
    public async Task Refresh_RevokedToken_Returns401()
    {
        var email = $"refresh-{Guid.NewGuid()}@test.com";
        var (_, refreshToken) = await AuthHelper.RegisterAndAuthenticateAsync(_factory, email, "ValidPass123");

        // Revoke via logout
        await _client.PostAsJsonAsync("/api/auth/logout", new LogoutRequest { RefreshToken = refreshToken });

        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = refreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_NonexistentToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = "nonexistent-token"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_OldTokenRevokedAfterRotation()
    {
        var email = $"refresh-{Guid.NewGuid()}@test.com";
        var (_, refreshToken) = await AuthHelper.RegisterAndAuthenticateAsync(_factory, email, "ValidPass123");

        // Use the refresh token to get a new pair
        await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = refreshToken
        });

        // Try to use the old token again - should be revoked
        var response = await _client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest
        {
            RefreshToken = refreshToken
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
