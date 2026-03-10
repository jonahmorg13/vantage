using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Accounts;

public class UpdateAccountRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    [MaxLength(50)]
    public string? AccountType { get; set; }

    public decimal? InitialBalance { get; set; }

    public bool? IsDefault { get; set; }
}
