namespace Amally.Application.DTOs.Comments;

public class UserCommentDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int LikesCount { get; set; }
    public Guid PostId { get; set; }
    public string PostTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
