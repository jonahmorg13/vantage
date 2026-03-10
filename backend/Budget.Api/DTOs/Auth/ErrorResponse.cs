namespace Budget.Api.DTOs.Auth;

public class ErrorResponse
{
    public required string Message { get; set; }
    public IEnumerable<string>? Errors { get; set; }
}
