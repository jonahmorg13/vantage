using Budget.Api.DataAccess;
using Budget.Api.DTOs.Recurring;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class RecurringTransactionService : IRecurringTransactionService
{
    private readonly BudgetDbContext _db;

    public RecurringTransactionService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<List<RecurringTransactionResponse>> GetAllAsync(string userId)
    {
        return await _db.RecurringTransactions
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.DayOfMonth)
            .ThenBy(r => r.Name)
            .Select(r => ToResponse(r))
            .ToListAsync();
    }

    public async Task<RecurringTransactionResponse> CreateAsync(string userId, CreateRecurringTransactionRequest request)
    {
        var recurring = new RecurringTransaction
        {
            Name = request.Name,
            Amount = request.Amount,
            Type = request.Type,
            CategoryId = request.CategoryId,
            AccountId = request.AccountId,
            ToAccountId = request.ToAccountId,
            DayOfMonth = request.DayOfMonth,
            IsActive = request.IsActive,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.RecurringTransactions.Add(recurring);
        await _db.SaveChangesAsync();

        // If the recurring is active, create a pending transaction for the current month
        if (recurring.IsActive)
        {
            var currentMonthKey = DateTime.UtcNow.ToString("yyyy-MM");
            var monthExists = await _db.MonthBudgets
                .AnyAsync(m => m.UserId == userId && m.MonthKey == currentMonthKey);

            if (monthExists)
            {
                var day = Math.Min(recurring.DayOfMonth, DateTime.DaysInMonth(
                    DateTime.UtcNow.Year, DateTime.UtcNow.Month));
                var date = $"{currentMonthKey}-{day:D2}";

                int? resolvedCategoryId = null;
                if (recurring.CategoryId.HasValue)
                {
                    var monthCategories = await _db.MonthBudgets
                        .Where(m => m.UserId == userId && m.MonthKey == currentMonthKey)
                        .SelectMany(m => m.Categories)
                        .ToListAsync();

                    // Try templateId match first, then fall back to name match
                    resolvedCategoryId = monthCategories
                        .FirstOrDefault(c => c.TemplateId == recurring.CategoryId)?.Id;

                    if (resolvedCategoryId is null)
                    {
                        var templateName = await _db.CategoryTemplates
                            .Where(t => t.Id == recurring.CategoryId.Value && t.UserId == userId)
                            .Select(t => t.Name)
                            .FirstOrDefaultAsync();

                        if (templateName is not null)
                            resolvedCategoryId = monthCategories
                                .FirstOrDefault(c => c.Name == templateName)?.Id;
                    }
                }

                _db.Transactions.Add(new Transaction
                {
                    Name = recurring.Name,
                    Amount = recurring.Amount,
                    Type = recurring.Type,
                    CategoryId = resolvedCategoryId,
                    AccountId = recurring.AccountId,
                    ToAccountId = recurring.ToAccountId,
                    Date = date,
                    MonthKey = currentMonthKey,
                    RecurringId = recurring.Id,
                    Status = "pending",
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
        }

        return ToResponse(recurring);
    }

    public async Task<RecurringTransactionResponse?> UpdateAsync(string userId, int id, UpdateRecurringTransactionRequest request)
    {
        var recurring = await _db.RecurringTransactions.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (recurring is null) return null;

        if (request.Name is not null) recurring.Name = request.Name;
        if (request.Amount.HasValue) recurring.Amount = request.Amount.Value;
        if (request.Type is not null) recurring.Type = request.Type;
        if (request.CategoryId.HasValue) recurring.CategoryId = request.CategoryId.Value;
        if (request.AccountId.HasValue) recurring.AccountId = request.AccountId.Value;
        if (request.ToAccountId.HasValue) recurring.ToAccountId = request.ToAccountId.Value;
        if (request.DayOfMonth.HasValue) recurring.DayOfMonth = request.DayOfMonth.Value;
        if (request.IsActive.HasValue) recurring.IsActive = request.IsActive.Value;
        recurring.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToResponse(recurring);
    }

    public async Task<bool> DeleteAsync(string userId, int id)
    {
        var recurring = await _db.RecurringTransactions.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (recurring is null) return false;

        _db.RecurringTransactions.Remove(recurring);
        await _db.SaveChangesAsync();
        return true;
    }

    private static RecurringTransactionResponse ToResponse(RecurringTransaction r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Amount = r.Amount,
        Type = r.Type,
        CategoryId = r.CategoryId,
        AccountId = r.AccountId,
        ToAccountId = r.ToAccountId,
        DayOfMonth = r.DayOfMonth,
        IsActive = r.IsActive,
        CreatedAt = r.CreatedAt.ToString("o"),
        UpdatedAt = r.UpdatedAt.ToString("o")
    };
}
