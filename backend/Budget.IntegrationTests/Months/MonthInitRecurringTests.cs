using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Months;
using Budget.Api.DTOs.Recurring;
using Budget.Api.DTOs.Transactions;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Months;

public class MonthInitRecurringTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public MonthInitRecurringTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"init-recur-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task Init_CreatesPendingTransactionsFromRecurring()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Netflix", Amount = 15.99m, Type = "expense", CategoryId = 1, DayOfMonth = 15, IsActive = true
        });
        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Salary", Amount = 5000, Type = "income", CategoryId = 2, DayOfMonth = 1, IsActive = true
        });

        await client.PostAsync("/api/months/2026-03/init", null);

        var response = await client.GetAsync("/api/transactions?monthKey=2026-03&status=pending");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Equal(2, transactions!.Count);
        Assert.Contains(transactions, t => t.Name == "Netflix" && t.Date == "2026-03-15");
        Assert.Contains(transactions, t => t.Name == "Salary" && t.Date == "2026-03-01");
    }

    [Fact]
    public async Task Init_SkipsInactiveRecurring()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Active", Amount = 10, Type = "expense", CategoryId = 1, DayOfMonth = 1, IsActive = true
        });
        await client.PostAsJsonAsync("/api/recurring", new CreateRecurringTransactionRequest
        {
            Name = "Inactive", Amount = 20, Type = "expense", CategoryId = 1, DayOfMonth = 1, IsActive = false
        });

        await client.PostAsync("/api/months/2026-04/init", null);

        var response = await client.GetAsync("/api/transactions?monthKey=2026-04");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.Single(transactions!);
        Assert.Equal("Active", transactions[0].Name);
    }
}
