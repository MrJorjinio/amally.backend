using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly AmallyDbContext _db;

    public CommentRepository(AmallyDbContext db) => _db = db;

    public async Task<Comment?> GetByIdAsync(Guid id) =>
        await _db.Comments
            .Include(c => c.User)
            .Include(c => c.Replies).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<(List<Comment> Items, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int pageSize)
    {
        var query = _db.Comments
            .Include(c => c.User)
            .Include(c => c.Post)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<List<Comment>> GetByPostIdAsync(Guid postId) =>
        await _db.Comments
            .Include(c => c.User)
            .Include(c => c.Replies).ThenInclude(r => r.User)
            .Include(c => c.Replies).ThenInclude(r => r.Replies).ThenInclude(r => r.User)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

    public async Task<Comment> CreateAsync(Comment comment)
    {
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        return comment;
    }

    public async Task UpdateAsync(Comment comment)
    {
        _db.Comments.Update(comment);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Comment comment)
    {
        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
    }
}
