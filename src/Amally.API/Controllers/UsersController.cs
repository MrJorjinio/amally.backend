using Amally.API.Extensions;
using Amally.Application.DTOs;
using Amally.Application.DTOs.Comments;
using Amally.Application.DTOs.Posts;
using Amally.Application.DTOs.Users;
using Amally.Application.Interfaces;
using Amally.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPostService _postService;
    private readonly ICommentService _commentService;
    private readonly IFollowRepository _followRepo;

    public UsersController(IUserService userService, IPostService postService, ICommentService commentService, IFollowRepository followRepo)
    {
        _userService = userService;
        _postService = postService;
        _commentService = commentService;
        _followRepo = followRepo;
    }

    [HttpGet("suggestions")]
    public async Task<ActionResult<List<UserSummaryDto>>> GetSuggestions([FromQuery] int limit = 5)
    {
        var currentUserId = User.GetUserIdOrNull();
        var followingIds = currentUserId.HasValue
            ? await _followRepo.GetFollowingIdsAsync(currentUserId.Value)
            : new HashSet<Guid>();

        var topAuthors = await _postService.GetTopAuthorsAsync(limit + 20);
        var suggestions = topAuthors
            .Where(a => currentUserId == null || a.Author.Id != currentUserId)
            .Where(a => !followingIds.Contains(a.Author.Id))
            .Select(a => a.Author)
            .Take(limit)
            .ToList();
        return Ok(suggestions);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid id)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _userService.GetProfileAsync(id, currentUserId);
        return Ok(result);
    }

    [HttpGet("by-username/{username}")]
    public async Task<ActionResult<UserProfileDto>> GetProfileByUsername(string username)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _userService.GetProfileByUsernameAsync(username, currentUserId);
        return Ok(result);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.GetUserId();
        var result = await _userService.UpdateProfileAsync(userId, request);
        return Ok(result);
    }

    [HttpGet("{id:guid}/posts")]
    public async Task<ActionResult<PaginatedResult<PostDto>>> GetUserPosts(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _postService.GetUserPostsAsync(id, page, pageSize, currentUserId);
        return Ok(result);
    }

    [HttpGet("{id:guid}/comments")]
    public async Task<ActionResult<PaginatedResult<UserCommentDto>>> GetUserComments(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _commentService.GetByUserIdAsync(id, page, pageSize);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me/bookmarks")]
    public async Task<ActionResult<PaginatedResult<PostDto>>> GetBookmarkedPosts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = User.GetUserId();
        var result = await _postService.GetBookmarkedAsync(userId, page, pageSize);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("{id:guid}/follow")]
    public async Task<ActionResult<object>> ToggleFollow(Guid id)
    {
        var userId = User.GetUserId();
        var isFollowing = await _userService.ToggleFollowAsync(userId, id);
        return Ok(new { isFollowing });
    }

    [HttpGet("{id:guid}/followers")]
    public async Task<ActionResult<PaginatedResult<UserSummaryDto>>> GetFollowers(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _userService.GetFollowersAsync(id, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}/following")]
    public async Task<ActionResult<PaginatedResult<UserSummaryDto>>> GetFollowing(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _userService.GetFollowingAsync(id, page, pageSize);
        return Ok(result);
    }
}
