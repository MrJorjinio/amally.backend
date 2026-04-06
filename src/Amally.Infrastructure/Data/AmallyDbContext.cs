using Amally.Core.Entities;
using Amally.Infrastructure.Data.Seed;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Data;

public class AmallyDbContext : DbContext
{
    public AmallyDbContext(DbContextOptions<AmallyDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<CommentLike> CommentLikes => Set<CommentLike>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AmallyDbContext).Assembly);
        DataSeeder.Seed(modelBuilder);
    }
}
