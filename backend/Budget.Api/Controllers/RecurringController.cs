using System.Security.Claims;
using Budget.Api.DTOs.Recurring;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("recurring")]
[Authorize]
public class RecurringController : ControllerBase
{
    private readonly IRecurringTransactionService _recurringService;

    public RecurringController(IRecurringTransactionService recurringService)
    {
        _recurringService = recurringService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var recurring = await _recurringService.GetAllAsync(UserId);
        return Ok(recurring);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRecurringTransactionRequest request)
    {
        var recurring = await _recurringService.CreateAsync(UserId, request);
        return StatusCode(201, recurring);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRecurringTransactionRequest request)
    {
        var recurring = await _recurringService.UpdateAsync(UserId, id, request);
        if (recurring is null) return NotFound();
        return Ok(recurring);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _recurringService.DeleteAsync(UserId, id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
