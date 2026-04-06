using Amally.Application.DTOs.Users;
using Amally.Core.Enums;

namespace Amally.Application.DTOs.Posts;

public class PostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public UserSummaryDto Author { get; set; } = null!;
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string RegionName { get; set; } = string.Empty;
    public EducationLevel EducationLevel { get; set; }
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public int ViewsCount { get; set; }
    public bool IsLiked { get; set; }
    public bool IsBookmarked { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
