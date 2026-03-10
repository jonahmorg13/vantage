namespace Budget.Api.DTOs.Transactions;

public class TransactionResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Amount { get; set; }
    public required string Type { get; set; }
    public int? CategoryId { get; set; }
    public int? AccountId { get; set; }
    public int? ToAccountId { get; set; }
    public required string Date { get; set; }
    public required string MonthKey { get; set; }
    public int? RecurringId { get; set; }
    public required string Status { get; set; }
    public required string CreatedAt { get; set; }
    public required string UpdatedAt { get; set; }
}
