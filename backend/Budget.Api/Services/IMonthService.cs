using Budget.Api.DTOs.Months;

namespace Budget.Api.Services;

public interface IMonthService
{
    Task<List<MonthBudgetResponse>> GetAllAsync(string userId);
    Task<MonthBudgetResponse?> GetAsync(string userId, string monthKey);
    Task<(MonthBudgetResponse? Month, string? Error, int StatusCode)> InitAsync(string userId, string monthKey);
    Task<MonthBudgetResponse?> UpdateIncomeAsync(string userId, string monthKey, UpdateMonthIncomeRequest request);
    Task<MonthBudgetResponse?> LockAsync(string userId, string monthKey);
}
