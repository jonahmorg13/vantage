using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Auth;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Auth;

public class LoginTests : IClassFixture<BudgetApiFactory>
{
    private readonly HttpClient _client;

    public LoginTests(BudgetApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    private string UniqueEmail() => $"login-{Guid.NewGuid()}@test.com";

    private async Task RegisterUserAsync(string email, string password)
    {
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });
    }

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithTokens()
    {
        var email = UniqueEmail();
        await RegisterUserAsync(email, "ValidPass123");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = "ValidPass123"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        Assert.NotNull(tokens);
        Assert.False(string.IsNullOrEmpty(tokens.AccessToken));
        Assert.False(string.IsNullOrEmpty(tokens.RefreshToken));
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email = UniqueEmail();
        await RegisterUserAsync(email, "ValidPass123");

        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = "WrongPassword"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_NonexistentEmail_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "nonexistent@test.com",
            Password = "ValidPass123"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_MissingFields_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
