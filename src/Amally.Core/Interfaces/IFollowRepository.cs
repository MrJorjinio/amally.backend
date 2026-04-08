using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface IFollowRepository
{
    Task<bool> ExistsAsync(Guid followerId, Guid followingId);
    Task<HashSet<Guid>> GetFollowingIdsAsync(Guid userId);
    Task CreateAsync(UserFollow follow);
    Task DeleteAsync(Guid followerId, Guid followingId);
    Task<(List<User> Users, int TotalCount)> GetFollowersAsync(Guid userId, int page, int pageSize);
    Task<(List<User> Users, int TotalCount)> GetFollowingAsync(Guid userId, int page, int pageSize);
}
