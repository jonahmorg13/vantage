using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Months;

public class UpdateMonthIncomeRequest
{
    [Required]
    public decimal TakeHomePay { get; set; }
}
