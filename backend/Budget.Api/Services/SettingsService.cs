using Budget.Api.DataAccess;
using Budget.Api.DTOs.Settings;
using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.Services;

public class SettingsService : ISettingsService
{
    private readonly BudgetDbContext _db;

    public SettingsService(BudgetDbContext db)
    {
        _db = db;
    }

    public async Task<AppSettingsResponse> GetAsync(string userId)
    {
        var settings = await GetOrCreateSettingsAsync(userId);
        var templates = await _db.CategoryTemplates
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return ToResponse(settings, templates);
    }

    public async Task<AppSettingsResponse> UpdateIncomeAsync(string userId, UpdateIncomeRequest request)
    {
        var settings = await GetOrCreateSettingsAsync(userId);
        settings.DefaultTakeHomePay = request.DefaultTakeHomePay;
        await _db.SaveChangesAsync();
        return await GetAsync(userId);
    }

    public async Task<AppSettingsResponse> UpdateCurrencyAsync(string userId, UpdateCurrencyRequest request)
    {
        var settings = await GetOrCreateSettingsAsync(userId);
        settings.CurrencySymbol = request.CurrencySymbol;
        await _db.SaveChangesAsync();
        return await GetAsync(userId);
    }

    public async Task<List<CategoryTemplateResponse>> GetTemplatesAsync(string userId)
    {
        return await _db.CategoryTemplates
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.SortOrder)
            .Select(t => ToTemplateResponse(t))
            .ToListAsync();
    }

    public async Task<CategoryTemplateResponse> CreateTemplateAsync(string userId, CreateCategoryTemplateRequest request)
    {
        var template = new CategoryTemplate
        {
            Name = request.Name,
            Color = request.Color,
            DefaultBudgetAmount = request.DefaultBudgetAmount,
            DefaultSpendLimit = request.DefaultSpendLimit,
            SortOrder = request.SortOrder,
            UserId = userId
        };

        _db.CategoryTemplates.Add(template);
        await _db.SaveChangesAsync();
        return ToTemplateResponse(template);
    }

    public async Task<List<CategoryTemplateResponse>> BulkReplaceTemplatesAsync(string userId, List<CreateCategoryTemplateRequest> requests)
    {
        var existing = await _db.CategoryTemplates.Where(t => t.UserId == userId).ToListAsync();
        _db.CategoryTemplates.RemoveRange(existing);

        var templates = requests.Select(r => new CategoryTemplate
        {
            Name = r.Name,
            Color = r.Color,
            DefaultBudgetAmount = r.DefaultBudgetAmount,
            DefaultSpendLimit = r.DefaultSpendLimit,
            SortOrder = r.SortOrder,
            UserId = userId
        }).ToList();

        _db.CategoryTemplates.AddRange(templates);
        await _db.SaveChangesAsync();

        return templates.Select(ToTemplateResponse).ToList();
    }

    public async Task<CategoryTemplateResponse?> UpdateTemplateAsync(string userId, int id, UpdateCategoryTemplateRequest request)
    {
        var template = await _db.CategoryTemplates.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (template is null) return null;

        if (request.Name is not null) template.Name = request.Name;
        if (request.Color is not null) template.Color = request.Color;
        if (request.DefaultBudgetAmount.HasValue) template.DefaultBudgetAmount = request.DefaultBudgetAmount.Value;
        if (request.DefaultSpendLimit.HasValue) template.DefaultSpendLimit = request.DefaultSpendLimit.Value;
        if (request.SortOrder.HasValue) template.SortOrder = request.SortOrder.Value;

        await _db.SaveChangesAsync();
        return ToTemplateResponse(template);
    }

    public async Task<bool> DeleteTemplateAsync(string userId, int id)
    {
        var template = await _db.CategoryTemplates.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (template is null) return false;

        _db.CategoryTemplates.Remove(template);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task<UserSettings> GetOrCreateSettingsAsync(string userId)
    {
        var settings = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        if (settings is not null) return settings;

        settings = new UserSettings
        {
            DefaultTakeHomePay = 0,
            CurrencySymbol = "$",
            UserId = userId
        };
        _db.UserSettings.Add(settings);
        await _db.SaveChangesAsync();
        return settings;
    }

    private static AppSettingsResponse ToResponse(UserSettings s, List<CategoryTemplate> templates) => new()
    {
        DefaultTakeHomePay = s.DefaultTakeHomePay,
        CurrencySymbol = s.CurrencySymbol,
        CategoryTemplates = templates.Select(ToTemplateResponse).ToList()
    };

    private static CategoryTemplateResponse ToTemplateResponse(CategoryTemplate t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Color = t.Color,
        DefaultBudgetAmount = t.DefaultBudgetAmount,
        DefaultSpendLimit = t.DefaultSpendLimit,
        SortOrder = t.SortOrder
    };
}
