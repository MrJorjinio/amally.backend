using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(Guid id);
    Task<List<Comment>> GetByPostIdAsync(Guid postId);
    Task<(List<Comment> Items, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int pageSize);
    Task<Comment> CreateAsync(Comment comment);
    Task UpdateAsync(Comment comment);
    Task DeleteAsync(Comment comment);
}
