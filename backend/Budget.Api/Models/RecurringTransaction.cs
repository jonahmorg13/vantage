namespace Budget.Api.Models;

public class RecurringTransaction
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Amount { get; set; }
    public required string Type { get; set; }
    public int? CategoryId { get; set; }
    public int? AccountId { get; set; }
    public int? ToAccountId { get; set; }
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
