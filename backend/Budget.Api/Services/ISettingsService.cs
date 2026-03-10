using Budget.Api.DTOs.Settings;

namespace Budget.Api.Services;

public interface ISettingsService
{
    Task<AppSettingsResponse> GetAsync(string userId);
    Task<AppSettingsResponse> UpdateIncomeAsync(string userId, UpdateIncomeRequest request);
    Task<AppSettingsResponse> UpdateCurrencyAsync(string userId, UpdateCurrencyRequest request);
    Task<List<CategoryTemplateResponse>> GetTemplatesAsync(string userId);
    Task<CategoryTemplateResponse> CreateTemplateAsync(string userId, CreateCategoryTemplateRequest request);
    Task<List<CategoryTemplateResponse>> BulkReplaceTemplatesAsync(string userId, List<CreateCategoryTemplateRequest> requests);
    Task<CategoryTemplateResponse?> UpdateTemplateAsync(string userId, int id, UpdateCategoryTemplateRequest request);
    Task<bool> DeleteTemplateAsync(string userId, int id);
}
