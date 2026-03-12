using System.Security.Claims;
using Budget.Api.DTOs.Transactions;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? monthKey,
        [FromQuery] int? categoryId,
        [FromQuery] string? type,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo)
    {
        var transactions = await _transactionService.GetAllAsync(UserId, monthKey, categoryId, type, status, search, dateFrom, dateTo);
        return Ok(transactions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
    {
        if (request.Type == "transfer" && (request.AccountId is null || request.ToAccountId is null))
            return BadRequest("Transfers require both AccountId and ToAccountId.");
        if (request.Type == "transfer" && request.AccountId == request.ToAccountId)
            return BadRequest("Transfer accounts must be different.");

        var transaction = await _transactionService.CreateAsync(UserId, request);
        return StatusCode(201, transaction);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTransactionRequest request)
    {
        if (request.Type == "transfer" && (request.AccountId is null || request.ToAccountId is null))
            return BadRequest("Transfers require both AccountId and ToAccountId.");
        if (request.Type == "transfer" && request.AccountId == request.ToAccountId)
            return BadRequest("Transfer accounts must be different.");

        var transaction = await _transactionService.UpdateAsync(UserId, id, request);
        if (transaction is null) return NotFound();
        return Ok(transaction);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _transactionService.DeleteAsync(UserId, id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:int}/confirm")]
    public async Task<IActionResult> Confirm(int id)
    {
        var transaction = await _transactionService.ConfirmAsync(UserId, id);
        if (transaction is null) return NotFound();
        return Ok(transaction);
    }

    [HttpDelete("{id:int}/dismiss")]
    public async Task<IActionResult> Dismiss(int id)
    {
        var result = await _transactionService.DismissAsync(UserId, id);
        if (result is null) return NotFound();
        return NoContent();
    }
}
