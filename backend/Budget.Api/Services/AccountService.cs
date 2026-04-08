using Budget.Api.DataAccess;
using Budget.Api.DTOs.Accounts;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class AccountService : IAccountService
{
    private readonly BudgetDbContext _db;

    public AccountService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<List<AccountResponse>> GetAllAsync(string userId)
    {
        var accounts = await _db.Accounts
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Name)
            .ToListAsync();

        var balances = await ComputeBalancesAsync(userId);
        return accounts.Select(a => ToResponse(a, balances.GetValueOrDefault(a.Id, a.InitialBalance))).ToList();
    }

    public async Task<AccountResponse> CreateAsync(string userId, CreateAccountRequest request)
    {
        var account = new Account
        {
            Name = request.Name,
            Color = request.Color,
            AccountType = request.AccountType,
            InitialBalance = request.InitialBalance,
            IsDefault = request.IsDefault,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Accounts.Add(account);
        await _db.SaveChangesAsync();

        return ToResponse(account, await ComputeBalanceAsync(userId, account));
    }

    public async Task<AccountResponse?> UpdateAsync(string userId, int id, UpdateAccountRequest request)
    {
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (account is null) return null;

        if (request.Name is not null) account.Name = request.Name;
        if (request.Color is not null) account.Color = request.Color;
        if (request.AccountType is not null) account.AccountType = request.AccountType;
        if (request.InitialBalance.HasValue) account.InitialBalance = request.InitialBalance.Value;
        if (request.IsDefault.HasValue) account.IsDefault = request.IsDefault.Value;
        account.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToResponse(account, await ComputeBalanceAsync(userId, account));
    }

    private async Task<Dictionary<int, decimal>> ComputeBalancesAsync(string userId)
    {
        var accounts = await _db.Accounts
            .Where(a => a.UserId == userId)
            .Select(a => new { a.Id, a.InitialBalance })
            .ToListAsync();

        var balances = accounts.ToDictionary(a => a.Id, a => a.InitialBalance);

        var txs = await _db.Transactions
            .Where(t => t.UserId == userId && t.Status == "confirmed")
            .Select(t => new { t.Type, t.Amount, t.AccountId, t.ToAccountId })
            .ToListAsync();

        foreach (var t in txs)
        {
            if (t.AccountId.HasValue && balances.ContainsKey(t.AccountId.Value))
            {
                if (t.Type == "income") balances[t.AccountId.Value] += t.Amount;
                else if (t.Type == "expense") balances[t.AccountId.Value] -= t.Amount;
                else if (t.Type == "transfer") balances[t.AccountId.Value] -= t.Amount;
            }
            if (t.Type == "transfer" && t.ToAccountId.HasValue && balances.ContainsKey(t.ToAccountId.Value))
            {
                balances[t.ToAccountId.Value] += t.Amount;
            }
        }

        return balances;
    }

    private async Task<decimal> ComputeBalanceAsync(string userId, Account account)
    {
        var balances = await ComputeBalancesAsync(userId);
        return balances.GetValueOrDefault(account.Id, account.InitialBalance);
    }

    public async Task<bool> DeleteAsync(string userId, int id)
    {
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (account is null) return false;

        _db.Accounts.Remove(account);
        await _db.SaveChangesAsync();
        return true;
    }

    private static AccountResponse ToResponse(Account a, decimal currentBalance) => new()
    {
        Id = a.Id,
        Name = a.Name,
        Color = a.Color,
        AccountType = a.AccountType,
        InitialBalance = a.InitialBalance,
        CurrentBalance = currentBalance,
        IsDefault = a.IsDefault,
        CreatedAt = a.CreatedAt.ToString("o"),
        UpdatedAt = a.UpdatedAt.ToString("o")
    };
}
