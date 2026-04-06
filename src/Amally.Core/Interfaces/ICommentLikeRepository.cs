using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface ICommentLikeRepository
{
    Task<bool> ExistsAsync(Guid userId, Guid commentId);
    Task CreateAsync(CommentLike like);
    Task DeleteAsync(Guid userId, Guid commentId);
}
