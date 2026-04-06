using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class BookmarkRepository : IBookmarkRepository
{
    private readonly AmallyDbContext _db;

    public BookmarkRepository(AmallyDbContext db) => _db = db;

    public async Task<bool> ExistsAsync(Guid userId, Guid postId) =>
        await _db.Bookmarks.AnyAsync(b => b.UserId == userId && b.PostId == postId);

    public async Task CreateAsync(Guid userId, Guid postId)
    {
        _db.Bookmarks.Add(new Bookmark { UserId = userId, PostId = postId, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid userId, Guid postId)
    {
        await _db.Bookmarks
            .Where(b => b.UserId == userId && b.PostId == postId)
            .ExecuteDeleteAsync();
    }
}
