using Budget.Api.DTOs.Categories;

namespace Budget.Api.Services;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllAsync(string userId, string monthKey);
    Task<(CategoryResponse? Category, bool MonthFound)> CreateAsync(string userId, string monthKey, CreateCategoryRequest request);
    Task<CategoryResponse?> UpdateAsync(string userId, string monthKey, int id, UpdateCategoryRequest request);
    Task<bool?> DeleteAsync(string userId, string monthKey, int id);
}
