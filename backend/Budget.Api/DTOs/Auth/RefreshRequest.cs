using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Auth;

public class RefreshRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}
