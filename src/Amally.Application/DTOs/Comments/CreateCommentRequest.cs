using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Comments;

public class CreateCommentRequest
{
    [Required, StringLength(2000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; }
}
