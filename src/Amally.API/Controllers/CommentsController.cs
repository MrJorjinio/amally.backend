using Amally.API.Extensions;
using Amally.Application.DTOs.Comments;
using Amally.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService) => _commentService = commentService;

    [HttpGet("posts/{postId:guid}/comments")]
    public async Task<ActionResult<List<CommentDto>>> GetComments(Guid postId)
    {
        var currentUserId = User.GetUserIdOrNull();
        var result = await _commentService.GetByPostIdAsync(postId, currentUserId);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("posts/{postId:guid}/comments")]
    public async Task<ActionResult<CommentDto>> CreateComment(Guid postId, [FromBody] CreateCommentRequest request)
    {
        var userId = User.GetUserId();
        var result = await _commentService.CreateAsync(userId, postId, request);
        return Created($"/api/comments/{result.Id}", result);
    }

    [Authorize]
    [HttpPut("comments/{id:guid}")]
    public async Task<ActionResult<CommentDto>> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request)
    {
        var userId = User.GetUserId();
        var result = await _commentService.UpdateAsync(userId, id, request.Content);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("comments/{id:guid}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userId = User.GetUserId();
        await _commentService.DeleteAsync(userId, id);
        return NoContent();
    }

    [Authorize]
    [HttpPost("comments/{id:guid}/like")]
    public async Task<ActionResult<object>> ToggleLike(Guid id)
    {
        var userId = User.GetUserId();
        var isLiked = await _commentService.ToggleLikeAsync(userId, id);
        return Ok(new { isLiked });
    }
}

public class UpdateCommentRequest
{
    public string Content { get; set; } = string.Empty;
}
