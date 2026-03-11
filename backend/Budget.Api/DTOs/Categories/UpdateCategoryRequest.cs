using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Categories;

public class UpdateCategoryRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    public decimal? BudgetAmount { get; set; }
    public int? SortOrder { get; set; }
}
