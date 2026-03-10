namespace Budget.Api.Models;

public class CategoryTemplate
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public decimal DefaultBudgetAmount { get; set; }
    public decimal DefaultSpendLimit { get; set; }
    public int SortOrder { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
