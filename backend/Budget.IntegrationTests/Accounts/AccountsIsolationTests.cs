using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Accounts;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Accounts;

public class AccountsIsolationTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public AccountsIsolationTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<(HttpClient Client, string UserId)> CreateUserWithClientAsync()
    {
        var email = $"isolation-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        var client = AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
        return (client, userId);
    }

    private async Task<AccountResponse> CreateAccountAsync(HttpClient client, string name)
    {
        var response = await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = name,
            Color = "#000000",
            AccountType = "checking"
        });
        return (await response.Content.ReadFromJsonAsync<AccountResponse>())!;
    }

    [Fact]
    public async Task UserA_CannotSee_UserB_Accounts()
    {
        var (clientA, _) = await CreateUserWithClientAsync();
        var (clientB, _) = await CreateUserWithClientAsync();

        await CreateAccountAsync(clientA, "User A Account");

        var response = await clientB.GetAsync("/api/accounts");
        var accounts = await response.Content.ReadFromJsonAsync<List<AccountResponse>>();
        Assert.NotNull(accounts);
        Assert.DoesNotContain(accounts, a => a.Name == "User A Account");
    }

    [Fact]
    public async Task UserA_CannotUpdate_UserB_Account()
    {
        var (clientA, _) = await CreateUserWithClientAsync();
        var (clientB, _) = await CreateUserWithClientAsync();

        var account = await CreateAccountAsync(clientA, "User A Account");

        var response = await clientB.PutAsJsonAsync($"/api/accounts/{account.Id}", new UpdateAccountRequest
        {
            Name = "Hacked"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UserA_CannotDelete_UserB_Account()
    {
        var (clientA, _) = await CreateUserWithClientAsync();
        var (clientB, _) = await CreateUserWithClientAsync();

        var account = await CreateAccountAsync(clientA, "User A Account");

        var response = await clientB.DeleteAsync($"/api/accounts/{account.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
