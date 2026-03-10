namespace Budget.Api.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public required string Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRevoked { get; set; }
    public required string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
