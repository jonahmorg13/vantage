using System.ComponentModel.DataAnnotations;

namespace Budget.Api.DTOs.Auth;

public class RegisterRequest
{
    [Required, EmailAddress]
    public required string Email { get; set; }

    [Required, MinLength(8)]
    public required string Password { get; set; }
}
