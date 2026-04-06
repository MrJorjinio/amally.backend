using Amally.Application.DTOs.Comments;

namespace Amally.Application.Interfaces;

public interface ICommentService
{
    Task<List<CommentDto>> GetByPostIdAsync(Guid postId, Guid? currentUserId);
    Task<CommentDto> CreateAsync(Guid userId, Guid postId, CreateCommentRequest request);
    Task<CommentDto> UpdateAsync(Guid userId, Guid commentId, string content);
    Task DeleteAsync(Guid userId, Guid commentId);
    Task<bool> ToggleLikeAsync(Guid userId, Guid commentId);
}
