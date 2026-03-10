namespace Budget.Api.Models;

public class UserSettings
{
    public int Id { get; set; }
    public decimal DefaultTakeHomePay { get; set; }
    public required string CurrencySymbol { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
