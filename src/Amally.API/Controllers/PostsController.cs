using Amally.API.Extensions;
using Amally.Application.DTOs;
using Amally.Application.DTOs.Posts;
using Amally.Application.Interfaces;
using Amally.Core.Entities;
using Amally.Core.Enums;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly IPostRepository _postRepo;
    private readonly AmallyDbContext _db;

    public PostsController(IPostService postService, IPostRepository postRepo, AmallyDbContext db)
    {
        _postService = postService;
        _postRepo = postRepo;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResult<PostDto>>> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? categoryId = null,
        [FromQuery] int? regionId = null,
        [FromQuery] EducationLevel? educationLevel = null)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _postService.GetPostsAsync(page, pageSize, currentUserId, categoryId, regionId, educationLevel);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PostDto>> GetPost(Guid id)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _postService.GetByIdAsync(id, currentUserId);
        return Ok(result);
    }

    [HttpPost("{id:guid}/view")]
    public async Task<IActionResult> RecordView(Guid id)
    {
        var userId = User.GetUserIdOrNull();

        if (userId.HasValue)
        {
            // Authenticated user — deduplicate by (userId, postId)
            var alreadyViewed = await _db.PostViews
                .AnyAsync(v => v.UserId == userId.Value && v.PostId == id);

            if (alreadyViewed) return NoContent();

            _db.PostViews.Add(new PostView
            {
                UserId = userId.Value,
                PostId = id,
                CreatedAt = DateTime.UtcNow,
            });
            await _db.SaveChangesAsync();
        }

        // Increment the counter (for anonymous users, always increment; for auth users, only on first view)
        await _postRepo.IncrementViewCountAsync(id);
        return NoContent();
    }

    [HttpGet("hottest")]
    public async Task<ActionResult<List<PostDto>>> GetHottest([FromQuery] int limit = 6)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _postService.GetHottestAsync(limit, currentUserId);
        return Ok(result);
    }

    [HttpGet("top-authors")]
    public async Task<ActionResult<List<TopAuthorDto>>> GetTopAuthors([FromQuery] int limit = 50)
    {
        var result = await _postService.GetTopAuthorsAsync(limit);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<ActionResult<PaginatedResult<PostDto>>> Search(
        [FromQuery] string q = "",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new PaginatedResult<PostDto>());

        var currentUserId = User.GetUserIdOrNull();
        var result = await _postService.SearchAsync(q, page, pageSize, currentUserId);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("feed")]
    public async Task<ActionResult<PaginatedResult<PostDto>>> GetFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = User.GetUserId();
        var result = await _postService.GetFeedAsync(userId, page, pageSize);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost([FromBody] CreatePostRequest request)
    {
        var userId = User.GetUserId();
        var result = await _postService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetPost), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PostDto>> UpdatePost(Guid id, [FromBody] UpdatePostRequest request)
    {
        var userId = User.GetUserId();
        var result = await _postService.UpdateAsync(userId, id, request);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var userId = User.GetUserId();
        await _postService.DeleteAsync(userId, id);
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/like")]
    public async Task<ActionResult<object>> ToggleLike(Guid id)
    {
        var userId = User.GetUserId();
        var isLiked = await _postService.ToggleLikeAsync(userId, id);
        return Ok(new { isLiked });
    }

    [Authorize]
    [HttpPost("{id:guid}/bookmark")]
    public async Task<ActionResult<object>> ToggleBookmark(Guid id)
    {
        var userId = User.GetUserId();
        var isBookmarked = await _postService.ToggleBookmarkAsync(userId, id);
        return Ok(new { isBookmarked });
    }
}
