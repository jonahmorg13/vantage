using System.Security.Claims;
using Budget.Api.DTOs.Auth;
using Budget.Api.DTOs.Months;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/months")]
[Authorize]
public class MonthsController : ControllerBase
{
    private readonly IMonthService _monthService;

    public MonthsController(IMonthService monthService)
    {
        _monthService = monthService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var months = await _monthService.GetAllAsync(UserId);
        return Ok(months);
    }

    [HttpGet("{monthKey}")]
    public async Task<IActionResult> Get(string monthKey)
    {
        var month = await _monthService.GetAsync(UserId, monthKey);
        if (month is null) return NotFound();
        return Ok(month);
    }

    [HttpPost("{monthKey}/init")]
    public async Task<IActionResult> Init(string monthKey)
    {
        var (month, error, statusCode) = await _monthService.InitAsync(UserId, monthKey);
        if (error is not null)
            return StatusCode(statusCode, new ErrorResponse { Message = error });
        return StatusCode(statusCode, month);
    }

    [HttpPut("{monthKey}/income")]
    public async Task<IActionResult> UpdateIncome(string monthKey, [FromBody] UpdateMonthIncomeRequest request)
    {
        var month = await _monthService.UpdateIncomeAsync(UserId, monthKey, request);
        if (month is null) return NotFound();
        return Ok(month);
    }

    [HttpPost("{monthKey}/lock")]
    public async Task<IActionResult> Lock(string monthKey)
    {
        var month = await _monthService.LockAsync(UserId, monthKey);
        if (month is null) return NotFound();
        return Ok(month);
    }
}
