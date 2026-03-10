using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budget.Api.DataAccess.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Color).HasMaxLength(50).IsRequired();
        builder.Property(c => c.BudgetAmount).HasColumnType("decimal(18,2)");
        builder.Property(c => c.SpendLimit).HasColumnType("decimal(18,2)");
    }
}
