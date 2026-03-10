using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Auth;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Auth;

public class RegisterTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;
    private readonly HttpClient _client;

    public RegisterTests(BudgetApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private string UniqueEmail() => $"register-{Guid.NewGuid()}@test.com";

    [Fact]
    public async Task Register_ValidCredentials_Returns201WithTokens()
    {
        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = UniqueEmail(),
            Password = "ValidPass123"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var tokens = await response.Content.ReadFromJsonAsync<AuthTokensResponse>();
        Assert.NotNull(tokens);
        Assert.False(string.IsNullOrEmpty(tokens.AccessToken));
        Assert.False(string.IsNullOrEmpty(tokens.RefreshToken));
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        var email = UniqueEmail();
        await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "ValidPass123"
        });

        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "ValidPass123"
        });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingEmail_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/auth/register", new { Password = "ValidPass123" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_PasswordTooShort_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = UniqueEmail(),
            Password = "short"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_InvalidEmailFormat_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = "not-an-email",
            Password = "ValidPass123"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_ReturnedTokens_WorkForAuthenticatedEndpoints()
    {
        var email = UniqueEmail();
        var registerResponse = await _client.PostAsJsonAsync("/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "ValidPass123"
        });

        var tokens = await registerResponse.Content.ReadFromJsonAsync<AuthTokensResponse>();

        var authenticatedClient = _factory.CreateClient();
        authenticatedClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        var accountsResponse = await authenticatedClient.GetAsync("/accounts");
        Assert.Equal(HttpStatusCode.OK, accountsResponse.StatusCode);
    }
}
