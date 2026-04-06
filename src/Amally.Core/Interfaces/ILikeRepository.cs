using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface ILikeRepository
{
    Task<bool> ExistsAsync(Guid userId, Guid postId);
    Task CreateAsync(Like like);
    Task DeleteAsync(Guid userId, Guid postId);
}
