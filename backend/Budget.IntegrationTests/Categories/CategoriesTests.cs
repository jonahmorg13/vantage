using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Categories;
using Budget.Api.DTOs.Months;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Categories;

public class CategoriesTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public CategoriesTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<(HttpClient Client, string MonthKey)> CreateClientWithMonthAsync()
    {
        var email = $"cats-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        var client = AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
        var monthKey = $"2026-{Random.Shared.Next(1, 12):D2}";
        await client.PostAsync($"/months/{monthKey}/init", null);
        return (client, monthKey);
    }

    [Fact]
    public async Task GetAll_EmptyMonth_ReturnsEmpty()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var response = await client.GetAsync($"/months/{monthKey}/categories");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var categories = await response.Content.ReadFromJsonAsync<List<CategoryResponse>>();
        Assert.Empty(categories!);
    }

    [Fact]
    public async Task Create_Returns201()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var response = await client.PostAsJsonAsync($"/months/{monthKey}/categories", new CreateCategoryRequest
        {
            Name = "Groceries",
            Color = "#00AA00",
            BudgetAmount = 500,
            SpendLimit = 600,
            SortOrder = 1
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var category = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.Equal("Groceries", category!.Name);
        Assert.True(category.Id > 0);
    }

    [Fact]
    public async Task Create_NonexistentMonth_Returns404()
    {
        var email = $"cats-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        var client = AuthHelper.CreateAuthenticatedClient(_factory, userId, email);

        var response = await client.PostAsJsonAsync("/months/2099-01/categories", new CreateCategoryRequest
        {
            Name = "X", Color = "#000", BudgetAmount = 0, SpendLimit = 0, SortOrder = 0
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_ReturnsUpdated()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var createResponse = await client.PostAsJsonAsync($"/months/{monthKey}/categories", new CreateCategoryRequest
        {
            Name = "Old", Color = "#FF0000", BudgetAmount = 100, SpendLimit = 100, SortOrder = 0
        });
        var created = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();

        var response = await client.PutAsJsonAsync($"/months/{monthKey}/categories/{created!.Id}", new UpdateCategoryRequest
        {
            Name = "Updated",
            BudgetAmount = 200
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.Equal("Updated", updated!.Name);
        Assert.Equal(200, updated.BudgetAmount);
        Assert.Equal("#FF0000", updated.Color); // unchanged
    }

    [Fact]
    public async Task Update_Nonexistent_Returns404()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var response = await client.PutAsJsonAsync($"/months/{monthKey}/categories/99999", new UpdateCategoryRequest { Name = "X" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Returns204()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var createResponse = await client.PostAsJsonAsync($"/months/{monthKey}/categories", new CreateCategoryRequest
        {
            Name = "ToDelete", Color = "#000", BudgetAmount = 0, SpendLimit = 0, SortOrder = 0
        });
        var created = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();

        var response = await client.DeleteAsync($"/months/{monthKey}/categories/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_Nonexistent_Returns404()
    {
        var (client, monthKey) = await CreateClientWithMonthAsync();

        var response = await client.DeleteAsync($"/months/{monthKey}/categories/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
