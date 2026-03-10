using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Accounts;

public class CreateAccountRequest
{
    [Required, MaxLength(200)]
    public required string Name { get; set; }

    [Required, MaxLength(50)]
    public required string Color { get; set; }

    [Required, MaxLength(50)]
    public required string AccountType { get; set; }

    public decimal InitialBalance { get; set; }

    public bool IsDefault { get; set; }
}
