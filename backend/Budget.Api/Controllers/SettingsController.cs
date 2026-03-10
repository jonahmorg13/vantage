using System.Security.Claims;
using Budget.Api.DTOs.Settings;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var settings = await _settingsService.GetAsync(UserId);
        return Ok(settings);
    }

    [HttpPut("income")]
    public async Task<IActionResult> UpdateIncome([FromBody] UpdateIncomeRequest request)
    {
        var settings = await _settingsService.UpdateIncomeAsync(UserId, request);
        return Ok(settings);
    }

    [HttpPut("currency")]
    public async Task<IActionResult> UpdateCurrency([FromBody] UpdateCurrencyRequest request)
    {
        var settings = await _settingsService.UpdateCurrencyAsync(UserId, request);
        return Ok(settings);
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var templates = await _settingsService.GetTemplatesAsync(UserId);
        return Ok(templates);
    }

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateCategoryTemplateRequest request)
    {
        var template = await _settingsService.CreateTemplateAsync(UserId, request);
        return StatusCode(201, template);
    }

    [HttpPut("templates")]
    public async Task<IActionResult> BulkReplaceTemplates([FromBody] List<CreateCategoryTemplateRequest> requests)
    {
        var templates = await _settingsService.BulkReplaceTemplatesAsync(UserId, requests);
        return Ok(templates);
    }

    [HttpPut("templates/{id:int}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateCategoryTemplateRequest request)
    {
        var template = await _settingsService.UpdateTemplateAsync(UserId, id, request);
        if (template is null) return NotFound();
        return Ok(template);
    }

    [HttpDelete("templates/{id:int}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var deleted = await _settingsService.DeleteTemplateAsync(UserId, id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
