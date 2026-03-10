using Budget.Api.DataAccess;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Budget.IntegrationTests.Infrastructure;

public class BudgetApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private SqliteConnection _connection = null!;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove all EF/DbContext registrations so we can replace with SQLite
            var descriptorsToRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<BudgetDbContext>)
                          || d.ServiceType == typeof(DbContextOptions)
                          || d.ServiceType == typeof(BudgetDbContext)
                          || (d.ServiceType.IsGenericType &&
                              d.ServiceType.GetGenericTypeDefinition() == typeof(DbContextOptions<>))
                          || d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true
                          || d.ImplementationType?.FullName?.Contains("SqlServer") == true)
                .ToList();
            foreach (var d in descriptorsToRemove)
                services.Remove(d);

            // Add SQLite in-memory
            services.AddDbContext<BudgetDbContext>(options =>
                options.UseSqlite(_connection));
        });

        // Override JWT config with deterministic test values
        builder.UseSetting("Jwt:SigningKey", "TestSigningKey-SuperSecretKey-AtLeast32Bytes!!");
        builder.UseSetting("Jwt:Issuer", "TestIssuer");
        builder.UseSetting("Jwt:Audience", "TestAudience");
        builder.UseSetting("Jwt:AccessTokenExpirationMinutes", "15");
        builder.UseSetting("Jwt:RefreshTokenExpirationDays", "7");
    }

    public async Task InitializeAsync()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        await _connection.OpenAsync();

        // Create schema from EF model
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BudgetDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _connection.DisposeAsync();
    }
}
