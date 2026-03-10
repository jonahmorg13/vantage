using Budget.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Budget.Api.DataAccess.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Name).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Color).HasMaxLength(50).IsRequired();
        builder.Property(a => a.AccountType).HasMaxLength(50).IsRequired();
        builder.Property(a => a.InitialBalance).HasColumnType("decimal(18,2)");
        builder.Property(a => a.UserId).IsRequired();

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
