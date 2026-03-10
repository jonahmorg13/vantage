using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budget.Api.DataAccess.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Amount).HasColumnType("decimal(18,2)");
        builder.Property(t => t.Type).HasMaxLength(20).IsRequired();
        builder.Property(t => t.Date).HasMaxLength(10).IsRequired();
        builder.Property(t => t.MonthKey).HasMaxLength(7).IsRequired();
        builder.Property(t => t.Status).HasMaxLength(20).IsRequired();
        builder.Property(t => t.UserId).IsRequired();

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
