using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Settings;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Settings;

public class SettingsTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public SettingsTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"settings-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task Get_NewUser_ReturnsDefaults()
    {
        var client = await CreateClientAsync();

        var response = await client.GetAsync("/settings");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var settings = await response.Content.ReadFromJsonAsync<AppSettingsResponse>();
        Assert.NotNull(settings);
        Assert.Equal(0, settings.DefaultTakeHomePay);
        Assert.Equal("$", settings.CurrencySymbol);
        Assert.Empty(settings.CategoryTemplates);
    }

    [Fact]
    public async Task UpdateIncome_ReturnsUpdatedSettings()
    {
        var client = await CreateClientAsync();

        var response = await client.PutAsJsonAsync("/settings/income", new UpdateIncomeRequest
        {
            DefaultTakeHomePay = 5000
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var settings = await response.Content.ReadFromJsonAsync<AppSettingsResponse>();
        Assert.Equal(5000, settings!.DefaultTakeHomePay);
    }

    [Fact]
    public async Task UpdateCurrency_ReturnsUpdatedSettings()
    {
        var client = await CreateClientAsync();

        var response = await client.PutAsJsonAsync("/settings/currency", new UpdateCurrencyRequest
        {
            CurrencySymbol = "€"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var settings = await response.Content.ReadFromJsonAsync<AppSettingsResponse>();
        Assert.Equal("€", settings!.CurrencySymbol);
    }

    [Fact]
    public async Task CreateTemplate_Returns201()
    {
        var client = await CreateClientAsync();

        var response = await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Groceries",
            Color = "#00AA00",
            DefaultBudgetAmount = 500,
            DefaultSpendLimit = 600,
            SortOrder = 1
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var template = await response.Content.ReadFromJsonAsync<CategoryTemplateResponse>();
        Assert.Equal("Groceries", template!.Name);
        Assert.True(template.Id > 0);
    }

    [Fact]
    public async Task GetTemplates_AfterCreate_ReturnsList()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Rent", Color = "#FF0000", DefaultBudgetAmount = 1500, DefaultSpendLimit = 1500, SortOrder = 0
        });
        await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Food", Color = "#00FF00", DefaultBudgetAmount = 400, DefaultSpendLimit = 500, SortOrder = 1
        });

        var response = await client.GetAsync("/settings/templates");
        var templates = await response.Content.ReadFromJsonAsync<List<CategoryTemplateResponse>>();
        Assert.Equal(2, templates!.Count);
    }

    [Fact]
    public async Task BulkReplaceTemplates_ReplacesAll()
    {
        var client = await CreateClientAsync();

        // Create initial
        await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Old", Color = "#000", DefaultBudgetAmount = 100, DefaultSpendLimit = 100, SortOrder = 0
        });

        // Bulk replace
        var response = await client.PutAsJsonAsync("/settings/templates", new List<CreateCategoryTemplateRequest>
        {
            new() { Name = "New1", Color = "#111", DefaultBudgetAmount = 200, DefaultSpendLimit = 200, SortOrder = 0 },
            new() { Name = "New2", Color = "#222", DefaultBudgetAmount = 300, DefaultSpendLimit = 300, SortOrder = 1 }
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var templates = await response.Content.ReadFromJsonAsync<List<CategoryTemplateResponse>>();
        Assert.Equal(2, templates!.Count);
        Assert.DoesNotContain(templates, t => t.Name == "Old");
    }

    [Fact]
    public async Task UpdateTemplate_ReturnsUpdated()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Utilities", Color = "#0000FF", DefaultBudgetAmount = 200, DefaultSpendLimit = 250, SortOrder = 0
        });
        var created = await createResponse.Content.ReadFromJsonAsync<CategoryTemplateResponse>();

        var response = await client.PutAsJsonAsync($"/settings/templates/{created!.Id}", new UpdateCategoryTemplateRequest
        {
            Name = "Bills"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<CategoryTemplateResponse>();
        Assert.Equal("Bills", updated!.Name);
        Assert.Equal("#0000FF", updated.Color); // unchanged
    }

    [Fact]
    public async Task UpdateTemplate_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.PutAsJsonAsync("/settings/templates/99999", new UpdateCategoryTemplateRequest { Name = "X" });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTemplate_Returns204()
    {
        var client = await CreateClientAsync();

        var createResponse = await client.PostAsJsonAsync("/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "ToDelete", Color = "#000", DefaultBudgetAmount = 0, DefaultSpendLimit = 0, SortOrder = 0
        });
        var created = await createResponse.Content.ReadFromJsonAsync<CategoryTemplateResponse>();

        var response = await client.DeleteAsync($"/settings/templates/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTemplate_Nonexistent_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.DeleteAsync("/settings/templates/99999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
