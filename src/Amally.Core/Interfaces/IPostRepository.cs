using Amally.Core.Entities;
using Amally.Core.Enums;

namespace Amally.Core.Interfaces;

public interface IPostRepository
{
    Task<Post?> GetByIdAsync(Guid id);
    Task<(List<Post> Posts, int TotalCount)> GetPaginatedAsync(
        int page, int pageSize,
        int? categoryId = null,
        int? regionId = null,
        EducationLevel? educationLevel = null);
    Task<(List<Post> Posts, int TotalCount)> GetByUserIdAsync(Guid userId, int page, int pageSize);
    Task<(List<Post> Posts, int TotalCount)> SearchAsync(string query, int page, int pageSize);
    Task<(List<Post> Posts, int TotalCount)> GetFeedAsync(Guid userId, int page, int pageSize);
    Task<List<Post>> GetBookmarkedAsync(Guid userId, int page, int pageSize);
    Task<Post> CreateAsync(Post post);
    Task UpdateAsync(Post post);
    Task DeleteAsync(Post post);
    Task IncrementViewCountAsync(Guid postId);
}
