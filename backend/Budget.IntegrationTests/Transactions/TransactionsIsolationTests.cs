using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Transactions;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Transactions;

public class TransactionsIsolationTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public TransactionsIsolationTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"txn-iso-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    private async Task<TransactionResponse> CreateTransactionAsync(HttpClient client, string name)
    {
        var response = await client.PostAsJsonAsync("/api/transactions", new CreateTransactionRequest
        {
            Name = name, Amount = 10, Type = "expense", Date = "2026-03-01", MonthKey = "2026-03", Status = "confirmed"
        });
        return (await response.Content.ReadFromJsonAsync<TransactionResponse>())!;
    }

    [Fact]
    public async Task UserA_CannotSee_UserB_Transactions()
    {
        var clientA = await CreateClientAsync();
        var clientB = await CreateClientAsync();

        await CreateTransactionAsync(clientA, "A's Transaction");

        var response = await clientB.GetAsync("/api/transactions");
        var transactions = await response.Content.ReadFromJsonAsync<List<TransactionResponse>>();
        Assert.DoesNotContain(transactions!, t => t.Name == "A's Transaction");
    }

    [Fact]
    public async Task UserA_CannotUpdate_UserB_Transaction()
    {
        var clientA = await CreateClientAsync();
        var clientB = await CreateClientAsync();

        var txn = await CreateTransactionAsync(clientA, "A's Transaction");

        var response = await clientB.PutAsJsonAsync($"/api/transactions/{txn.Id}", new UpdateTransactionRequest { Name = "Hacked" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UserA_CannotDelete_UserB_Transaction()
    {
        var clientA = await CreateClientAsync();
        var clientB = await CreateClientAsync();

        var txn = await CreateTransactionAsync(clientA, "A's Transaction");

        var response = await clientB.DeleteAsync($"/api/transactions/{txn.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
