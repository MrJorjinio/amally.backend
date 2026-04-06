using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class LikeRepository : ILikeRepository
{
    private readonly AmallyDbContext _db;

    public LikeRepository(AmallyDbContext db) => _db = db;

    public async Task<bool> ExistsAsync(Guid userId, Guid postId) =>
        await _db.Likes.AnyAsync(l => l.UserId == userId && l.PostId == postId);

    public async Task CreateAsync(Like like)
    {
        _db.Likes.Add(like);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid userId, Guid postId)
    {
        await _db.Likes
            .Where(l => l.UserId == userId && l.PostId == postId)
            .ExecuteDeleteAsync();
    }
}
