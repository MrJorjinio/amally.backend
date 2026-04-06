using Amally.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amally.Infrastructure.Data.Configurations;

public class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Content).IsRequired();
        builder.Property(p => p.CoverImageUrl).HasMaxLength(500);

        builder.HasOne(p => p.User).WithMany(u => u.Posts).HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(p => p.Category).WithMany(c => c.Posts).HasForeignKey(p => p.CategoryId);
        builder.HasOne(p => p.Region).WithMany(r => r.Posts).HasForeignKey(p => p.RegionId);

        builder.HasIndex(p => p.UserId);
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.RegionId);
        builder.HasIndex(p => p.CreatedAt);

        builder.HasGeneratedTsVectorColumn(
            p => p.SearchVector,
            "english",
            p => new { p.Title, p.Content })
            .HasIndex(p => p.SearchVector)
            .HasMethod("GIN");
    }
}
