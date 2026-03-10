using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Accounts;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Accounts;

public class AccountsCrudTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public AccountsCrudTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var email = $"crud-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task GetAll_Empty_ReturnsEmptyArray()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/accounts");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var accounts = await response.Content.ReadFromJsonAsync<List<AccountResponse>>();
        Assert.NotNull(accounts);
        Assert.Empty(accounts);
    }

    [Fact]
    public async Task Create_ValidAccount_Returns201()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = "Checking",
            Color = "#4A90D9",
            AccountType = "checking",
            InitialBalance = 1000.50m,
            IsDefault = true
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var account = await response.Content.ReadFromJsonAsync<AccountResponse>();
        Assert.NotNull(account);
        Assert.Equal("Checking", account.Name);
        Assert.Equal("#4A90D9", account.Color);
        Assert.Equal("checking", account.AccountType);
        Assert.Equal(1000.50m, account.InitialBalance);
        Assert.True(account.IsDefault);
        Assert.True(account.Id > 0);
    }

    [Fact]
    public async Task GetAll_AfterCreate_ReturnsAccounts()
    {
        var client = await CreateAuthenticatedClientAsync();

        await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = "Savings",
            Color = "#00AA00",
            AccountType = "savings"
        });

        var response = await client.GetAsync("/api/accounts");
        var accounts = await response.Content.ReadFromJsonAsync<List<AccountResponse>>();
        Assert.NotNull(accounts);
        Assert.Single(accounts);
        Assert.Equal("Savings", accounts[0].Name);
    }

    [Fact]
    public async Task Update_ExistingAccount_ReturnsUpdatedFields()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = "Old Name",
            Color = "#FF0000",
            AccountType = "checking"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<AccountResponse>();

        var response = await client.PutAsJsonAsync($"/api/accounts/{created!.Id}", new UpdateAccountRequest
        {
            Name = "New Name",
            Color = "#00FF00"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<AccountResponse>();
        Assert.NotNull(updated);
        Assert.Equal("New Name", updated.Name);
        Assert.Equal("#00FF00", updated.Color);
        Assert.Equal("checking", updated.AccountType); // unchanged
    }

    [Fact]
    public async Task Update_PartialUpdate_OnlyChangesProvidedFields()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = "Account",
            Color = "#FF0000",
            AccountType = "savings",
            InitialBalance = 500m,
            IsDefault = false
        });
        var created = await createResponse.Content.ReadFromJsonAsync<AccountResponse>();

        var response = await client.PutAsJsonAsync($"/api/accounts/{created!.Id}", new UpdateAccountRequest
        {
            Name = "Updated Account"
        });

        var updated = await response.Content.ReadFromJsonAsync<AccountResponse>();
        Assert.NotNull(updated);
        Assert.Equal("Updated Account", updated.Name);
        Assert.Equal("#FF0000", updated.Color);
        Assert.Equal("savings", updated.AccountType);
        Assert.Equal(500m, updated.InitialBalance);
        Assert.False(updated.IsDefault);
    }

    [Fact]
    public async Task Update_NonexistentAccount_Returns404()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/accounts/99999", new UpdateAccountRequest
        {
            Name = "Nope"
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_ExistingAccount_Returns204()
    {
        var client = await CreateAuthenticatedClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/accounts", new CreateAccountRequest
        {
            Name = "To Delete",
            Color = "#000000",
            AccountType = "checking"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<AccountResponse>();

        var response = await client.DeleteAsync($"/api/accounts/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify it's gone
        var getResponse = await client.GetAsync("/api/accounts");
        var accounts = await getResponse.Content.ReadFromJsonAsync<List<AccountResponse>>();
        Assert.NotNull(accounts);
        Assert.DoesNotContain(accounts, a => a.Id == created.Id);
    }

    [Fact]
    public async Task Delete_NonexistentAccount_Returns404()
    {
        var client = await CreateAuthenticatedClientAsync();

        var response = await client.DeleteAsync("/api/accounts/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
