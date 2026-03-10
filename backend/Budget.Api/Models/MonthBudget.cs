namespace Budget.Api.Models;

public class MonthBudget
{
    public int Id { get; set; }
    public required string MonthKey { get; set; }
    public decimal TakeHomePay { get; set; }
    public bool IsLocked { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public List<Category> Categories { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
