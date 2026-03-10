using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budget.Api.DataAccess.Configurations;

public class MonthBudgetConfiguration : IEntityTypeConfiguration<MonthBudget>
{
    public void Configure(EntityTypeBuilder<MonthBudget> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.MonthKey).HasMaxLength(7).IsRequired();
        builder.Property(m => m.TakeHomePay).HasColumnType("decimal(18,2)");
        builder.Property(m => m.UserId).IsRequired();

        builder.HasIndex(m => new { m.UserId, m.MonthKey }).IsUnique();

        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(m => m.Categories)
            .WithOne(c => c.MonthBudget)
            .HasForeignKey(c => c.MonthBudgetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
