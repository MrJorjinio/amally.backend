using Amally.Core.Entities;
using Amally.Core.Enums;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class PostRepository : IPostRepository
{
    private readonly AmallyDbContext _db;

    public PostRepository(AmallyDbContext db) => _db = db;

    public async Task<Post?> GetByIdAsync(Guid id) =>
        await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<(List<Post> Posts, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        int? categoryId = null,
        int? regionId = null,
        EducationLevel? educationLevel = null)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (regionId.HasValue)
            query = query.Where(p => p.RegionId == regionId.Value);
        if (educationLevel.HasValue)
            query = query.Where(p => p.EducationLevel == educationLevel.Value);

        var totalCount = await query.CountAsync();
        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }

    public async Task<(List<Post> Posts, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int pageSize)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .Where(p => p.UserId == userId);

        var totalCount = await query.CountAsync();
        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }

    public async Task<(List<Post> Posts, int TotalCount)> SearchAsync(string searchQuery, int page, int pageSize)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .Where(p => p.SearchVector.Matches(EF.Functions.WebSearchToTsQuery("english", searchQuery)))
            .OrderByDescending(p => p.SearchVector.Rank(EF.Functions.WebSearchToTsQuery("english", searchQuery)));

        var totalCount = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }

    public async Task<(List<Post> Posts, int TotalCount)> GetFeedAsync(Guid userId, int page, int pageSize)
    {
        var followingIds = await _db.UserFollows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .Where(p => followingIds.Contains(p.UserId));

        var totalCount = await query.CountAsync();
        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (posts, totalCount);
    }

    public async Task<List<Post>> GetBookmarkedAsync(Guid userId, int page, int pageSize)
    {
        return await _db.Bookmarks
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => b.Post)
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .ToListAsync();
    }

    public async Task<Post> CreateAsync(Post post)
    {
        _db.Posts.Add(post);
        await _db.SaveChangesAsync();
        return post;
    }

    public async Task UpdateAsync(Post post)
    {
        _db.Posts.Update(post);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Post post)
    {
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
    }

    public async Task IncrementViewCountAsync(Guid postId)
    {
        await _db.Posts
            .Where(p => p.Id == postId)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.ViewsCount, p => p.ViewsCount + 1));
    }
}
