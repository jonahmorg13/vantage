using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Settings;

public class CreateCategoryTemplateRequest
{
    [Required, MaxLength(200)]
    public required string Name { get; set; }

    [Required, MaxLength(50)]
    public required string Color { get; set; }

    [Required]
    public decimal DefaultBudgetAmount { get; set; }

    [Required]
    public int SortOrder { get; set; }
}
