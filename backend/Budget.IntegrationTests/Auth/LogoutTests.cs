using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Auth;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Auth;

public class LogoutTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;
    private readonly HttpClient _client;

    public LogoutTests(BudgetApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Logout_ValidRefreshToken_Returns204()
    {
        var email = $"logout-{Guid.NewGuid()}@test.com";
        var (_, refreshToken) = await AuthHelper.RegisterAndAuthenticateAsync(_factory, email, "ValidPass123");

        var response = await _client.PostAsJsonAsync("/auth/logout", new LogoutRequest
        {
            RefreshToken = refreshToken
        });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Logout_InvalidRefreshToken_Returns204()
    {
        var response = await _client.PostAsJsonAsync("/auth/logout", new LogoutRequest
        {
            RefreshToken = "invalid-token"
        });

        // Logout is idempotent - always returns 204
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
