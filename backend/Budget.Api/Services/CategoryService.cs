using Budget.Api.DataAccess;
using Budget.Api.DTOs.Categories;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly BudgetDbContext _db;

    public CategoryService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryResponse>> GetAllAsync(string userId, string monthKey)
    {
        var month = await _db.MonthBudgets
            .Include(m => m.Categories)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        if (month is null) return [];

        return month.Categories.OrderBy(c => c.SortOrder).Select(ToResponse).ToList();
    }

    public async Task<(CategoryResponse? Category, bool MonthFound)> CreateAsync(string userId, string monthKey, CreateCategoryRequest request)
    {
        var month = await _db.MonthBudgets
            .FirstOrDefaultAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        if (month is null) return (null, false);

        var category = new Category
        {
            Name = request.Name,
            Color = request.Color,
            BudgetAmount = request.BudgetAmount,
            SpendLimit = request.SpendLimit,
            SortOrder = request.SortOrder,
            MonthBudgetId = month.Id
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return (ToResponse(category), true);
    }

    public async Task<CategoryResponse?> UpdateAsync(string userId, string monthKey, int id, UpdateCategoryRequest request)
    {
        var category = await _db.Categories
            .Include(c => c.MonthBudget)
            .FirstOrDefaultAsync(c => c.Id == id
                && c.MonthBudget.UserId == userId
                && c.MonthBudget.MonthKey == monthKey);

        if (category is null) return null;

        if (request.Name is not null) category.Name = request.Name;
        if (request.Color is not null) category.Color = request.Color;
        if (request.BudgetAmount.HasValue) category.BudgetAmount = request.BudgetAmount.Value;
        if (request.SpendLimit.HasValue) category.SpendLimit = request.SpendLimit.Value;
        if (request.SortOrder.HasValue) category.SortOrder = request.SortOrder.Value;

        await _db.SaveChangesAsync();
        return ToResponse(category);
    }

    public async Task<bool?> DeleteAsync(string userId, string monthKey, int id)
    {
        var category = await _db.Categories
            .Include(c => c.MonthBudget)
            .FirstOrDefaultAsync(c => c.Id == id
                && c.MonthBudget.UserId == userId
                && c.MonthBudget.MonthKey == monthKey);

        if (category is null) return null;

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CategoryResponse ToResponse(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Color = c.Color,
        BudgetAmount = c.BudgetAmount,
        SpendLimit = c.SpendLimit,
        SortOrder = c.SortOrder
    };
}
