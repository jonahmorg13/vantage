using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Auth;

public class LogoutRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}
