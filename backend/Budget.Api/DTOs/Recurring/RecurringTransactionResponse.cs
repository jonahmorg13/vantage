namespace Budget.Api.DTOs.Recurring;

public class RecurringTransactionResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Amount { get; set; }
    public required string Type { get; set; }
    public int CategoryId { get; set; }
    public int? AccountId { get; set; }
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; }
    public required string CreatedAt { get; set; }
    public required string UpdatedAt { get; set; }
}
