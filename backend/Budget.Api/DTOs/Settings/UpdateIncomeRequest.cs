using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Settings;

public class UpdateIncomeRequest
{
    [Required]
    public decimal DefaultTakeHomePay { get; set; }
}
