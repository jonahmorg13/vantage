using Budget.Api.DTOs.Accounts;

namespace Budget.Api.Services;

public interface IAccountService
{
    Task<List<AccountResponse>> GetAllAsync(string userId);
    Task<AccountResponse> CreateAsync(string userId, CreateAccountRequest request);
    Task<AccountResponse?> UpdateAsync(string userId, int id, UpdateAccountRequest request);
    Task<bool> DeleteAsync(string userId, int id);
}
