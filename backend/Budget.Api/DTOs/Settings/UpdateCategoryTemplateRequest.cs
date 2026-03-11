using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Settings;

public class UpdateCategoryTemplateRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    public decimal? DefaultBudgetAmount { get; set; }
    public int? SortOrder { get; set; }
}
