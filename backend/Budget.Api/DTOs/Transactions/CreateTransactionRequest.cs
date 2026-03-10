using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Transactions;

public class CreateTransactionRequest
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

    [Required, MaxLength(10)]
    public required string Date { get; set; }

    [Required, MaxLength(7)]
    public required string MonthKey { get; set; }

    public int? RecurringId { get; set; }

    [Required, MaxLength(20)]
    public required string Status { get; set; }
}
