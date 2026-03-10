namespace Budget.Api.DTOs.Settings;

public class AppSettingsResponse
{
    public decimal DefaultTakeHomePay { get; set; }
    public required string CurrencySymbol { get; set; }
    public required List<CategoryTemplateResponse> CategoryTemplates { get; set; }
}

public class CategoryTemplateResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public decimal DefaultBudgetAmount { get; set; }
    public decimal DefaultSpendLimit { get; set; }
    public int SortOrder { get; set; }
}
