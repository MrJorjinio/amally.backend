using Amally.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amally.Infrastructure.Data.Configurations;

public class UserFollowConfiguration : IEntityTypeConfiguration<UserFollow>
{
    public void Configure(EntityTypeBuilder<UserFollow> builder)
    {
        builder.HasKey(uf => new { uf.FollowerId, uf.FollowingId });
        builder.HasOne(uf => uf.Follower).WithMany(u => u.Following).HasForeignKey(uf => uf.FollowerId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(uf => uf.Following).WithMany(u => u.Followers).HasForeignKey(uf => uf.FollowingId).OnDelete(DeleteBehavior.Cascade);
    }
}
