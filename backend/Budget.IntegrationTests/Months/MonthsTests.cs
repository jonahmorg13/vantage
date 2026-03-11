using System.Net;
using System.Net.Http.Json;
using Budget.Api.DTOs.Months;
using Budget.Api.DTOs.Settings;
using Budget.IntegrationTests.Infrastructure;

namespace Budget.IntegrationTests.Months;

public class MonthsTests : IClassFixture<BudgetApiFactory>
{
    private readonly BudgetApiFactory _factory;

    public MonthsTests(BudgetApiFactory factory)
    {
        _factory = factory;
    }

    private async Task<HttpClient> CreateClientAsync()
    {
        var email = $"months-{Guid.NewGuid()}@test.com";
        var userId = await AuthHelper.SeedUserAsync(_factory, email);
        return AuthHelper.CreateAuthenticatedClient(_factory, userId, email);
    }

    [Fact]
    public async Task GetAll_Empty_ReturnsEmptyArray()
    {
        var client = await CreateClientAsync();

        var response = await client.GetAsync("/api/months");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var months = await response.Content.ReadFromJsonAsync<List<MonthBudgetResponse>>();
        Assert.Empty(months!);
    }

    [Fact]
    public async Task Init_CreatesMonth_Returns201()
    {
        var client = await CreateClientAsync();

        var response = await client.PostAsync("/api/months/2026-03/init", null);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal("2026-03", month!.MonthKey);
        Assert.False(month.IsLocked);
    }

    [Fact]
    public async Task Init_UsesDefaultIncome()
    {
        var client = await CreateClientAsync();

        await client.PutAsJsonAsync("/api/settings/income", new UpdateIncomeRequest { DefaultTakeHomePay = 5000 });

        var response = await client.PostAsync("/api/months/2026-04/init", null);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal(5000, month!.TakeHomePay);
    }

    [Fact]
    public async Task Init_CopiesTemplatesAsCategories()
    {
        var client = await CreateClientAsync();

        await client.PostAsJsonAsync("/api/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Rent", Color = "#FF0000", DefaultBudgetAmount = 1500, SortOrder = 0
        });
        await client.PostAsJsonAsync("/api/settings/templates", new CreateCategoryTemplateRequest
        {
            Name = "Food", Color = "#00FF00", DefaultBudgetAmount = 400, SortOrder = 1
        });

        var response = await client.PostAsync("/api/months/2026-05/init", null);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal(2, month!.Categories.Count);
        Assert.Equal("Rent", month.Categories[0].Name);
        Assert.Equal(1500, month.Categories[0].BudgetAmount);
    }

    [Fact]
    public async Task Init_DuplicateMonth_ReturnsExisting()
    {
        var client = await CreateClientAsync();

        await client.PostAsync("/api/months/2026-06/init", null);
        var response = await client.PostAsync("/api/months/2026-06/init", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal("2026-06", month!.MonthKey);
    }

    [Fact]
    public async Task Get_ExistingMonth_ReturnsMonth()
    {
        var client = await CreateClientAsync();

        await client.PostAsync("/api/months/2026-07/init", null);
        var response = await client.GetAsync("/api/months/2026-07");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal("2026-07", month!.MonthKey);
    }

    [Fact]
    public async Task Get_NonexistentMonth_Returns404()
    {
        var client = await CreateClientAsync();

        var response = await client.GetAsync("/api/months/2099-01");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateIncome_ReturnsUpdated()
    {
        var client = await CreateClientAsync();

        await client.PostAsync("/api/months/2026-08/init", null);
        var response = await client.PutAsJsonAsync("/api/months/2026-08/income", new UpdateMonthIncomeRequest
        {
            TakeHomePay = 6000
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.Equal(6000, month!.TakeHomePay);
    }

    [Fact]
    public async Task Lock_LocksMonth()
    {
        var client = await CreateClientAsync();

        await client.PostAsync("/api/months/2026-09/init", null);
        var response = await client.PostAsync("/api/months/2026-09/lock", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var month = await response.Content.ReadFromJsonAsync<MonthBudgetResponse>();
        Assert.True(month!.IsLocked);
    }
}
