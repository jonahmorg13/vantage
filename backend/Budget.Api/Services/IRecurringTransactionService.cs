using Budget.Api.DTOs.Recurring;

namespace Budget.Api.Services;

public interface IRecurringTransactionService
{
    Task<List<RecurringTransactionResponse>> GetAllAsync(string userId);
    Task<RecurringTransactionResponse> CreateAsync(string userId, CreateRecurringTransactionRequest request);
    Task<RecurringTransactionResponse?> UpdateAsync(string userId, int id, UpdateRecurringTransactionRequest request);
    Task<bool> DeleteAsync(string userId, int id);
}
