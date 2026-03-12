using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Recurring;

public class UpdateRecurringTransactionRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    public decimal? Amount { get; set; }

    [MaxLength(20)]
    public string? Type { get; set; }

    public int? CategoryId { get; set; }
    public int? AccountId { get; set; }
    public int? ToAccountId { get; set; }

    [Range(1, 31)]
    public int? DayOfMonth { get; set; }

    public bool? IsActive { get; set; }
}
