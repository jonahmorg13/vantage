using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Recurring;

public class CreateRecurringTransactionRequest
{
    [Required, MaxLength(200)]
    public required string Name { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [Required, MaxLength(20)]
    public required string Type { get; set; }

    public int? CategoryId { get; set; }

    public int? AccountId { get; set; }
    public int? ToAccountId { get; set; }

    [Required, Range(1, 31)]
    public int DayOfMonth { get; set; }

    [Required]
    public bool IsActive { get; set; }
}
