using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Transactions;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Transactions;

public class TransactionsTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public TransactionsTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"txn-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task GetAll_Empty_ReturnsEmptyArray()
    {
        var client = await CreateClientAsync();

        var response = await client.GetAsync("/transactions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Empty(transactions!);
    }

    [Fact]
    public async Task Create_Returns201()
    {
        var client = await CreateClientAsync();

        var response = await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Grocery Store",
            Amount = 85.50m,
            Type = "expense",
            Date = "2026-03-09",
            MonthKey = "2026-03",
            Status = "confirmed"
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var txn = await response.Content.ReadFromJsonAsync<TransactionResponse>();
        Assert.Equal("Grocery Store", txn!.Name);
        Assert.Equal(85.50m, txn.Amount);
        Assert.Equal("expense", txn.Type);
        Assert.Equal("confirmed", txn.Status);
    }

    [Fact]
    public async Task GetAll_WithMonthKeyFilter_FiltersCorrectly()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "March", Amount = 10, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "April", Amount = 20, Type = "expense", Date = "2026-04-01", MonthKey = "2026-04", Status = "confirmed"
        });

        var response = await client.GetAsync("/transactions?monthKey=2026-03");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Single(transactions!);
        Assert.Equal("March", transactions[0].Name);
    }

    [Fact]
    public async Task GetAll_WithTypeFilter_FiltersCorrectly()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Salary", Amount = 5000, Type = "income", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Rent", Amount = 1500, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });

        var response = await client.GetAsync("/transactions?type=income");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Single(transactions!);
        Assert.Equal("Salary", transactions[0].Name);
    }

    [Fact]
    public async Task GetAll_WithSearchFilter_FiltersCorrectly()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Coffee Shop", Amount = 5, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Grocery Store", Amount = 80, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });

        var response = await client.GetAsync("/transactions?search=Coffee");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Single(transactions!);
        Assert.Equal("Coffee Shop", transactions[0].Name);
    }

    [Fact]
    public async Task Update_ReturnsUpdated()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Old", Amount = 10, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<TransactionResponse>();

        var response = await client.PutAsJsonAsync($"/transactions/{created!.Id}", new UpdateTransactionRequest
        {
            Name = "Updated",
            Amount = 25
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<TransactionResponse>();
        Assert.Equal("Updated", updated!.Name);
        Assert.Equal(25, updated.Amount);
    }

    [Fact]
    public async Task Update_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.PutAsJsonAsync("/transactions/99999", new UpdateTransactionRequest { Name = "X" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Returns204()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "ToDelete", Amount = 10, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<TransactionResponse>();

        var response = await client.DeleteAsync($"/transactions/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.DeleteAsync("/transactions/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Confirm_PendingTransaction_ReturnsConfirmed()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "Pending Bill", Amount = 100, Type = "expense", Date = "2026-03-15", MonthKey = "2026-03", Status = "pending"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<TransactionResponse>();

        var response = await client.PostAsync($"/transactions/{created!.Id}/confirm", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var confirmed = await response.Content.ReadFromJsonAsync<TransactionResponse>();
        Assert.Equal("confirmed", confirmed!.Status);
    }

    [Fact]
    public async Task Dismiss_PendingTransaction_Returns204()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/transactions", new CreateTransactionRequest
        {
            Name = "To Dismiss", Amount = 50, Type = "expense", Date = "2026-03-15", MonthKey = "2026-03", Status = "pending"
        });
        var created = await createResponse.Content.ReadFromJsonAsync<TransactionResponse>();

        var response = await client.DeleteAsync($"/transactions/{created!.Id}/dismiss");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        // Verify it's gone
        var getResponse = await client.GetAsync("/transactions");
        var transactions = await getResponse.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.DoesNotContain(transactions!, t => t.Id == created.Id);
    }

    [Fact]
    public async Task Dismiss_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.DeleteAsync("/transactions/99999/dismiss");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
