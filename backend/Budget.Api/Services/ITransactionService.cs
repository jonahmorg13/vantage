using Budget.Api.DTOs.Transactions;

namespace Budget.Api.Services;

public interface ITransactionService
{
    Task<List<TransactionResponse>> GetAllAsync(string userId, string? monthKey, int? categoryId,
        string? type, string? status, string? search, string? dateFrom, string? dateTo);
    Task<TransactionResponse> CreateAsync(string userId, CreateTransactionRequest request);
    Task<TransactionResponse?> UpdateAsync(string userId, int id, UpdateTransactionRequest request);
    Task<bool> DeleteAsync(string userId, int id);
    Task<TransactionResponse?> ConfirmAsync(string userId, int id);
    Task<bool?> DismissAsync(string userId, int id);
}
