using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class CommentLikeRepository : ICommentLikeRepository
{
    private readonly AmallyDbContext _db;

    public CommentLikeRepository(AmallyDbContext db) => _db = db;

    public async Task<bool> ExistsAsync(Guid userId, Guid commentId) =>
        await _db.CommentLikes.AnyAsync(cl => cl.UserId == userId && cl.CommentId == commentId);

    public async Task CreateAsync(CommentLike like)
    {
        _db.CommentLikes.Add(like);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid userId, Guid commentId)
    {
        await _db.CommentLikes
            .Where(cl => cl.UserId == userId && cl.CommentId == commentId)
            .ExecuteDeleteAsync();
    }
}
