using Amally.Application.DTOs.Users;

namespace Amally.Application.DTOs.Comments;

public class CommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public UserSummaryDto Author { get; set; } = null!;
    public Guid? ParentCommentId { get; set; }
    public int LikesCount { get; set; }
    public bool IsLiked { get; set; }
    public List<CommentDto> Replies { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
