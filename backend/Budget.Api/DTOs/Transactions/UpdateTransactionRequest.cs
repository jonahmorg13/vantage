using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Transactions;

public class UpdateTransactionRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    public decimal? Amount { get; set; }

    [MaxLength(20)]
    public string? Type { get; set; }

    public int? CategoryId { get; set; }
    public int? AccountId { get; set; }
    public int? ToAccountId { get; set; }

    [MaxLength(10)]
    public string? Date { get; set; }

    [MaxLength(7)]
    public string? MonthKey { get; set; }

    [MaxLength(20)]
    public string? Status { get; set; }
}
