using Budget.Api.DTOs.Categories;

namespace Budget.Api.DTOs.Months;

public class MonthBudgetResponse
{
    public required string MonthKey { get; set; }
    public decimal TakeHomePay { get; set; }
    public required List<CategoryResponse> Categories { get; set; }
    public bool IsLocked { get; set; }
    public required string CreatedAt { get; set; }
    public required string UpdatedAt { get; set; }
}
