using Amally.Application.DTOs;
using Amally.Application.DTOs.Posts;
using Amally.Application.DTOs.Users;
using Amally.Application.Interfaces;
using Amally.Core.Entities;
using Amally.Core.Enums;
using Amally.Core.Interfaces;

namespace Amally.Application.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepo;
    private readonly ILikeRepository _likeRepo;
    private readonly IBookmarkRepository _bookmarkRepo;

    public PostService(IPostRepository postRepo, ILikeRepository likeRepo, IBookmarkRepository bookmarkRepo)
    {
        _postRepo = postRepo;
        _likeRepo = likeRepo;
        _bookmarkRepo = bookmarkRepo;
    }

    public async Task<PostDto> GetByIdAsync(Guid postId, Guid? currentUserId)
    {
        var post = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        await _postRepo.IncrementViewCountAsync(postId);

        return await MapToDto(post, currentUserId);
    }

    public async Task<PaginatedResult<PostDto>> GetPostsAsync(int page, int pageSize, Guid? currentUserId,
        int? categoryId = null, int? regionId = null, EducationLevel? educationLevel = null)
    {
        var (posts, totalCount) = await _postRepo.GetPaginatedAsync(page, pageSize, categoryId, regionId, educationLevel);
        var items = new List<PostDto>();
        foreach (var post in posts)
            items.Add(await MapToDto(post, currentUserId));

        return new PaginatedResult<PostDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<PostDto>> GetUserPostsAsync(Guid userId, int page, int pageSize, Guid? currentUserId)
    {
        var (posts, totalCount) = await _postRepo.GetByUserIdAsync(userId, page, pageSize);
        var items = new List<PostDto>();
        foreach (var post in posts)
            items.Add(await MapToDto(post, currentUserId));

        return new PaginatedResult<PostDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<PostDto>> SearchAsync(string query, int page, int pageSize, Guid? currentUserId)
    {
        var (posts, totalCount) = await _postRepo.SearchAsync(query, page, pageSize);
        var items = new List<PostDto>();
        foreach (var post in posts)
            items.Add(await MapToDto(post, currentUserId));

        return new PaginatedResult<PostDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<PostDto>> GetFeedAsync(Guid userId, int page, int pageSize)
    {
        var (posts, totalCount) = await _postRepo.GetFeedAsync(userId, page, pageSize);
        var items = new List<PostDto>();
        foreach (var post in posts)
            items.Add(await MapToDto(post, userId));

        return new PaginatedResult<PostDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PostDto> CreateAsync(Guid userId, CreatePostRequest request)
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CoverImageUrl = request.CoverImageUrl,
            UserId = userId,
            CategoryId = request.CategoryId,
            RegionId = request.RegionId,
            EducationLevel = request.EducationLevel,
            CreatedAt = DateTime.UtcNow
        };

        await _postRepo.CreateAsync(post);

        var created = await _postRepo.GetByIdAsync(post.Id);
        return await MapToDto(created!, userId);
    }

    public async Task<PostDto> UpdateAsync(Guid userId, Guid postId, UpdatePostRequest request)
    {
        var post = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("You can only edit your own posts.");

        if (request.Title is not null) post.Title = request.Title;
        if (request.Content is not null) post.Content = request.Content;
        if (request.CoverImageUrl is not null) post.CoverImageUrl = request.CoverImageUrl;
        if (request.CategoryId.HasValue) post.CategoryId = request.CategoryId.Value;
        if (request.RegionId.HasValue) post.RegionId = request.RegionId.Value;
        if (request.EducationLevel.HasValue) post.EducationLevel = request.EducationLevel.Value;
        post.UpdatedAt = DateTime.UtcNow;

        await _postRepo.UpdateAsync(post);

        var updated = await _postRepo.GetByIdAsync(post.Id);
        return await MapToDto(updated!, userId);
    }

    public async Task DeleteAsync(Guid userId, Guid postId)
    {
        var post = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        if (post.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own posts.");

        await _postRepo.DeleteAsync(post);
    }

    public async Task<bool> ToggleLikeAsync(Guid userId, Guid postId)
    {
        var post = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        if (await _likeRepo.ExistsAsync(userId, postId))
        {
            await _likeRepo.DeleteAsync(userId, postId);
            post.LikesCount = Math.Max(0, post.LikesCount - 1);
            await _postRepo.UpdateAsync(post);
            return false;
        }

        await _likeRepo.CreateAsync(new Like { UserId = userId, PostId = postId, CreatedAt = DateTime.UtcNow });
        post.LikesCount++;
        await _postRepo.UpdateAsync(post);
        return true;
    }

    public async Task<bool> ToggleBookmarkAsync(Guid userId, Guid postId)
    {
        _ = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        if (await _bookmarkRepo.ExistsAsync(userId, postId))
        {
            await _bookmarkRepo.DeleteAsync(userId, postId);
            return false;
        }

        await _bookmarkRepo.CreateAsync(userId, postId);
        return true;
    }

    private async Task<PostDto> MapToDto(Post post, Guid? currentUserId)
    {
        var dto = new PostDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            CoverImageUrl = post.CoverImageUrl,
            Author = new UserSummaryDto
            {
                Id = post.User.Id,
                Username = post.User.Username,
                FullName = post.User.FullName,
                ProfilePictureUrl = post.User.ProfilePictureUrl
            },
            CategoryName = post.Category.Name,
            CategorySlug = post.Category.Slug,
            RegionName = post.Region.Name,
            EducationLevel = post.EducationLevel,
            LikesCount = post.LikesCount,
            CommentsCount = post.CommentsCount,
            ViewsCount = post.ViewsCount,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };

        if (currentUserId.HasValue)
        {
            dto.IsLiked = await _likeRepo.ExistsAsync(currentUserId.Value, post.Id);
            dto.IsBookmarked = await _bookmarkRepo.ExistsAsync(currentUserId.Value, post.Id);
        }

        return dto;
    }
}
