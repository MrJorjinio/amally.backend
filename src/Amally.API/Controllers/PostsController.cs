using Amally.API.Extensions;
using Amally.Application.DTOs;
using Amally.Application.DTOs.Posts;
using Amally.Application.Interfaces;
using Amally.Core.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService) => _postService = postService;

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
