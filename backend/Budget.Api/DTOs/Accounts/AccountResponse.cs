namespace Budget.Api.DTOs.Accounts;

public class AccountResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Color { get; set; }
    public required string AccountType { get; set; }
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public bool IsDefault { get; set; }
    public required string CreatedAt { get; set; }
    public required string UpdatedAt { get; set; }
}
