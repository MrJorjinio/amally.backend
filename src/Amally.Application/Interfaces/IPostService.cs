using Amally.Application.DTOs;
using Amally.Application.DTOs.Posts;
using Amally.Core.Enums;

namespace Amally.Application.Interfaces;

public interface IPostService
{
    Task<PostDto> GetByIdAsync(Guid postId, Guid? currentUserId);
    Task<PaginatedResult<PostDto>> GetPostsAsync(int page, int pageSize, Guid? currentUserId,
        int? categoryId = null, int? regionId = null, EducationLevel? educationLevel = null);
    Task<PaginatedResult<PostDto>> GetUserPostsAsync(Guid userId, int page, int pageSize, Guid? currentUserId);
    Task<PaginatedResult<PostDto>> SearchAsync(string query, int page, int pageSize, Guid? currentUserId);
    Task<PaginatedResult<PostDto>> GetFeedAsync(Guid userId, int page, int pageSize);
    Task<PostDto> CreateAsync(Guid userId, CreatePostRequest request);
    Task<PostDto> UpdateAsync(Guid userId, Guid postId, UpdatePostRequest request);
    Task DeleteAsync(Guid userId, Guid postId);
    Task<bool> ToggleLikeAsync(Guid userId, Guid postId);
    Task<bool> ToggleBookmarkAsync(Guid userId, Guid postId);
    Task<PaginatedResult<PostDto>> GetBookmarkedAsync(Guid userId, int page, int pageSize);
    Task<List<PostDto>> GetHottestAsync(int limit, Guid? currentUserId);
    Task<List<TopAuthorDto>> GetTopAuthorsAsync(int limit);
}
