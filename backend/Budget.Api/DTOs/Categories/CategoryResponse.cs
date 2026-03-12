namespace Budget.Api.DTOs.Categories;

public class CategoryResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public decimal BudgetAmount { get; set; }
    public int SortOrder { get; set; }
    public int? TemplateId { get; set; }
}
