using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface ICommentLikeRepository
{
    Task<bool> ExistsAsync(Guid userId, Guid commentId);
    Task<HashSet<Guid>> GetLikedCommentIdsAsync(Guid userId, IEnumerable<Guid> commentIds);
    Task CreateAsync(CommentLike like);
    Task DeleteAsync(Guid userId, Guid commentId);
}
