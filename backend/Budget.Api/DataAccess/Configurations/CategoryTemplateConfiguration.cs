using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budget.Api.DataAccess.Configurations;

public class CategoryTemplateConfiguration : IEntityTypeConfiguration<CategoryTemplate>
{
    public void Configure(EntityTypeBuilder<CategoryTemplate> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Color).HasMaxLength(50).IsRequired();
        builder.Property(t => t.DefaultBudgetAmount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.UserId).IsRequired();

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
