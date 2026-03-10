using Budget.Api.DataAccess;
using Budget.Api.DTOs.Categories;
using Budget.Api.DTOs.Months;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class MonthService : IMonthService
{
    private readonly BudgetDbContext _db;

    public MonthService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<List<MonthBudgetResponse>> GetAllAsync(string userId)
    {
        return await _db.MonthBudgets
            .Include(m => m.Categories)
            .Where(m => m.UserId == userId)
            .OrderBy(m => m.MonthKey)
            .Select(m => ToResponse(m))
            .ToListAsync();
    }

    public async Task<MonthBudgetResponse?> GetAsync(string userId, string monthKey)
    {
        var month = await _db.MonthBudgets
            .Include(m => m.Categories)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        return month is null ? null : ToResponse(month);
    }

    public async Task<(MonthBudgetResponse? Month, string? Error, int StatusCode)> InitAsync(string userId, string monthKey)
    {
        var existing = await _db.MonthBudgets
            .AnyAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        if (existing)
            return (null, "Month already initialized", 409);

        // Get user settings for default income
        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        var takeHomePay = settings?.DefaultTakeHomePay ?? 0;

        // Get category templates to initialize categories
        var templates = await _db.CategoryTemplates
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        var month = new MonthBudget
        {
            MonthKey = monthKey,
            TakeHomePay = takeHomePay,
            IsLocked = false,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Categories = templates.Select(t => new Category
            {
                Name = t.Name,
                Color = t.Color,
                BudgetAmount = t.DefaultBudgetAmount,
                SpendLimit = t.DefaultSpendLimit,
                SortOrder = t.SortOrder
            }).ToList()
        };

        _db.MonthBudgets.Add(month);

        // Create pending transactions from active recurring transactions
        var recurring = await _db.RecurringTransactions
            .Where(r => r.UserId == userId && r.IsActive)
            .ToListAsync();

        foreach (var r in recurring)
        {
            var day = Math.Min(r.DayOfMonth, DateTime.DaysInMonth(
                int.Parse(monthKey[..4]), int.Parse(monthKey[5..])));
            var date = $"{monthKey}-{day:D2}";

            _db.Transactions.Add(new Transaction
            {
                Name = r.Name,
                Amount = r.Amount,
                Type = r.Type,
                CategoryId = r.CategoryId,
                AccountId = r.AccountId,
                Date = date,
                MonthKey = monthKey,
                RecurringId = r.Id,
                Status = "pending",
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return (ToResponse(month), null, 201);
    }

    public async Task<MonthBudgetResponse?> UpdateIncomeAsync(string userId, string monthKey, UpdateMonthIncomeRequest request)
    {
        var month = await _db.MonthBudgets
            .Include(m => m.Categories)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        if (month is null) return null;

        month.TakeHomePay = request.TakeHomePay;
        month.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ToResponse(month);
    }

    public async Task<MonthBudgetResponse?> LockAsync(string userId, string monthKey)
    {
        var month = await _db.MonthBudgets
            .Include(m => m.Categories)
            .FirstOrDefaultAsync(m => m.UserId == userId && m.MonthKey == monthKey);

        if (month is null) return null;

        month.IsLocked = true;
        month.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ToResponse(month);
    }

    private static MonthBudgetResponse ToResponse(MonthBudget m) => new()
    {
        MonthKey = m.MonthKey,
        TakeHomePay = m.TakeHomePay,
        Categories = m.Categories.OrderBy(c => c.SortOrder).Select(c => new CategoryResponse
        {
            Id = c.Id,
            Name = c.Name,
            Color = c.Color,
            BudgetAmount = c.BudgetAmount,
            SpendLimit = c.SpendLimit,
            SortOrder = c.SortOrder
        }).ToList(),
        IsLocked = m.IsLocked,
        CreatedAt = m.CreatedAt.ToString("o"),
        UpdatedAt = m.UpdatedAt.ToString("o")
    };
}
