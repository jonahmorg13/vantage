using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Settings;

public class UpdateCurrencyRequest
{
    [Required, MaxLength(10)]
    public required string CurrencySymbol { get; set; }
}
