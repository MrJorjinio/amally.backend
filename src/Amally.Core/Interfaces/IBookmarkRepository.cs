namespace Amally.Core.Interfaces;

public interface IBookmarkRepository
{
    Task<bool> ExistsAsync(Guid userId, Guid postId);
    Task CreateAsync(Guid userId, Guid postId);
    Task DeleteAsync(Guid userId, Guid postId);
}
