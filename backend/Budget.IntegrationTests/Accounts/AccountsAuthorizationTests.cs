using System.Net;
using System.Net.Http.Headers;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Accounts;

public class AccountsAuthorizationTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public AccountsAuthorizationTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetAll_NoAuthHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/accounts");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_InvalidJwt_Returns401()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", "not-a-valid-jwt");

        var response = await client.GetAsync("/api/accounts");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_ExpiredJwt_Returns401()
    {
        var email = $"expired-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);

        var expiredToken = AuthHelper.GenerateTestJwt(userId, email, TimeSpan.FromMinutes(-1));
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", expiredToken);

        var response = await client.GetAsync("/api/accounts");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
