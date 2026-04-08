using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class FollowRepository : IFollowRepository
{
    private readonly AmallyDbContext _db;

    public FollowRepository(AmallyDbContext db) => _db = db;

    public async Task<bool> ExistsAsync(Guid followerId, Guid followingId) =>
        await _db.UserFollows.AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

    public async Task<HashSet<Guid>> GetFollowingIdsAsync(Guid userId)
    {
        var ids = await _db.UserFollows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowingId)
            .ToListAsync();
        return ids.ToHashSet();
    }

    public async Task CreateAsync(UserFollow follow)
    {
        _db.UserFollows.Add(follow);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid followerId, Guid followingId)
    {
        await _db.UserFollows
            .Where(f => f.FollowerId == followerId && f.FollowingId == followingId)
            .ExecuteDeleteAsync();
    }

    public async Task<(List<User> Users, int TotalCount)> GetFollowersAsync(Guid userId, int page, int pageSize)
    {
        var query = _db.UserFollows
            .Where(f => f.FollowingId == userId)
            .Select(f => f.Follower);

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    public async Task<(List<User> Users, int TotalCount)> GetFollowingAsync(Guid userId, int page, int pageSize)
    {
        var query = _db.UserFollows
            .Where(f => f.FollowerId == userId)
            .Select(f => f.Following);

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (users, totalCount);
    }
}
