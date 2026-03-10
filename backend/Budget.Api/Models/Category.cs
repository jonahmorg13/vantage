namespace Budget.Api.Models;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public decimal BudgetAmount { get; set; }
    public decimal SpendLimit { get; set; }
    public int SortOrder { get; set; }
    public int MonthBudgetId { get; set; }
    public MonthBudget MonthBudget { get; set; } = null!;
}
