using Amally.Application.DTOs.Users;

namespace Amally.Application.DTOs.Posts;

public class TopAuthorDto
{
    public UserSummaryDto Author { get; set; } = null!;
    public TopAuthorPostDto TopPost { get; set; } = null!;
}

public class TopAuthorPostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
}
