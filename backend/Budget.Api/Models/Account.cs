namespace Budget.Api.Models;

public class Account
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public required string AccountType { get; set; }
    public decimal InitialBalance { get; set; }
    public bool IsDefault { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
