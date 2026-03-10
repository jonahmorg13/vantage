using Budget.Api.DataAccess;
using Budget.Api.DTOs.Transactions;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly BudgetDbContext _db;

    public TransactionService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<List<TransactionResponse>> GetAllAsync(string userId, string? monthKey,
        int? categoryId, string? type, string? status, string? search, string? dateFrom, string? dateTo)
    {
        var query = _db.Transactions.Where(t => t.UserId == userId);

        if (monthKey is not null)
            query = query.Where(t => t.MonthKey == monthKey);
        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);
        if (type is not null)
            query = query.Where(t => t.Type == type);
        if (status is not null)
            query = query.Where(t => t.Status == status);
        if (search is not null)
            query = query.Where(t => t.Name.Contains(search));
        if (dateFrom is not null)
            query = query.Where(t => string.Compare(t.Date, dateFrom) >= 0);
        if (dateTo is not null)
            query = query.Where(t => string.Compare(t.Date, dateTo) <= 0);

        return await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync();
    }

    public async Task<TransactionResponse> CreateAsync(string userId, CreateTransactionRequest request)
    {
        var transaction = new Transaction
        {
            Name = request.Name,
            Amount = request.Amount,
            Type = request.Type,
            CategoryId = request.CategoryId,
            AccountId = request.AccountId,
            ToAccountId = request.ToAccountId,
            Date = request.Date,
            MonthKey = request.MonthKey,
            RecurringId = request.RecurringId,
            Status = request.Status,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        return ToResponse(transaction);
    }

    public async Task<TransactionResponse?> UpdateAsync(string userId, int id, UpdateTransactionRequest request)
    {
        var transaction = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction is null) return null;

        if (request.Name is not null) transaction.Name = request.Name;
        if (request.Amount.HasValue) transaction.Amount = request.Amount.Value;
        if (request.Type is not null) transaction.Type = request.Type;
        if (request.CategoryId.HasValue) transaction.CategoryId = request.CategoryId.Value;
        if (request.AccountId.HasValue) transaction.AccountId = request.AccountId.Value;
        if (request.ToAccountId.HasValue) transaction.ToAccountId = request.ToAccountId.Value;
        if (request.Date is not null) transaction.Date = request.Date;
        if (request.MonthKey is not null) transaction.MonthKey = request.MonthKey;
        if (request.Status is not null) transaction.Status = request.Status;
        transaction.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToResponse(transaction);
    }

    public async Task<bool> DeleteAsync(string userId, int id)
    {
        var transaction = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction is null) return false;

        _db.Transactions.Remove(transaction);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<TransactionResponse?> ConfirmAsync(string userId, int id)
    {
        var transaction = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (transaction is null) return null;

        transaction.Status = "confirmed";
        transaction.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return ToResponse(transaction);
    }

    public async Task<bool?> DismissAsync(string userId, int id)
    {
        var transaction = await _db.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId && t.Status == "pending");
        if (transaction is null) return null;

        _db.Transactions.Remove(transaction);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TransactionResponse ToResponse(Transaction t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Amount = t.Amount,
        Type = t.Type,
        CategoryId = t.CategoryId,
        AccountId = t.AccountId,
        ToAccountId = t.ToAccountId,
        Date = t.Date,
        MonthKey = t.MonthKey,
        RecurringId = t.RecurringId,
        Status = t.Status,
        CreatedAt = t.CreatedAt.ToString("o"),
        UpdatedAt = t.UpdatedAt.ToString("o")
    };
}
