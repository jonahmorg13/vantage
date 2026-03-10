using System.Security.Claims;
using Budget.Api.DTOs.Categories;
using Budget.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Budget.Api.Controllers;

[ApiController]
[Route("api/months/{monthKey}/categories")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll(string monthKey)
    {
        var categories = await _categoryService.GetAllAsync(UserId, monthKey);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string monthKey, [FromBody] CreateCategoryRequest request)
    {
        var (category, monthFound) = await _categoryService.CreateAsync(UserId, monthKey, request);
        if (!monthFound) return NotFound();
        return StatusCode(201, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(string monthKey, int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _categoryService.UpdateAsync(UserId, monthKey, id, request);
        if (category is null) return NotFound();
        return Ok(category);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(string monthKey, int id)
    {
        var deleted = await _categoryService.DeleteAsync(UserId, monthKey, id);
        if (deleted is null) return NotFound();
        return NoContent();
    }
}
