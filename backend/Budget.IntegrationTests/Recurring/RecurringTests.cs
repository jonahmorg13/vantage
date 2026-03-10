using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Recurring;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Recurring;

public class RecurringTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public RecurringTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"recur-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task GetAll_Empty_ReturnsEmptyArray()
    {
        var client = await CreateClientAsync();

        var response = await client.GetAsync("/api/recurring");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var recurring = await response.Content.ReadFromJsonAsync<List<RecurringTransactionResponse>>();
        Assert.Empty(recurring!);
    }

    [Fact]
    public async Task Create_Returns201()
    {
        var client = await CreateClientAsync();

        var response = await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Netflix",
            Amount = 15.99m,
            Type = "expense",
            CategoryId = 1,
            DayOfMonth = 15,
            IsActive = true
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var recurring = await response.Content.ReadFromJsonAsync<RecurringTransactionResponse>();
        Assert.Equal("Netflix", recurring!.Name);
        Assert.Equal(15.99m, recurring.Amount);
        Assert.Equal(15, recurring.DayOfMonth);
        Assert.True(recurring.IsActive);
    }

    [Fact]
    public async Task GetAll_AfterCreate_ReturnsList()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Rent", Amount = 1500, Type = "expense", CategoryId = 1, DayOfMonth = 1, IsActive = true
        });
        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Salary", Amount = 5000, Type = "income", CategoryId = 2, DayOfMonth = 15, IsActive = true
        });

        var response = await client.GetAsync("/api/recurring");
        var recurring = await response.Content.ReadFromJsonAsync<List<RecurringTransactionResponse>>();
        Assert.Equal(2, recurring!.Count);
    }

    [Fact]
    public async Task Update_ReturnsUpdated()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Old", Amount = 10, Type = "expense", CategoryId = 1, DayOfMonth = 1, IsActive = true
        });
        var created = await createResponse.Content.ReadFromJsonAsync<RecurringTransactionResponse>();

        var response = await client.PutAsJsonAsync($"/api/recurring/{created!.Id}", new UpdateRecurringTransactionRequest
        {
            Name = "Updated",
            Amount = 20
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<RecurringTransactionResponse>();
        Assert.Equal("Updated", updated!.Name);
        Assert.Equal(20, updated.Amount);
        Assert.Equal(1, updated.DayOfMonth); // unchanged
    }

    [Fact]
    public async Task Update_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.PutAsJsonAsync("/api/recurring/99999", new UpdateRecurringTransactionRequest { Name = "X" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Returns204()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "ToDelete", Amount = 10, Type = "expense", CategoryId = 1, DayOfMonth = 1, IsActive = true
        });
        var created = await createResponse.Content.ReadFromJsonAsync<RecurringTransactionResponse>();

        var response = await client.DeleteAsync($"/api/recurring/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.DeleteAsync("/api/recurring/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
