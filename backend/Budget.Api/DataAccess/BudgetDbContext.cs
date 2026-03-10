using Budget.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Budget.Api.DataAccess;

public class BudgetDbContext : IdentityDbContext<ApplicationUser>
{
    public BudgetDbContext(DbContextOptions<BudgetDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<CategoryTemplate> CategoryTemplates => Set<CategoryTemplate>();
    public DbSet<MonthBudget> MonthBudgets => Set<MonthBudget>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<RecurringTransaction> RecurringTransactions => Set<RecurringTransaction>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(BudgetDbContext).Assembly);
    }
}
