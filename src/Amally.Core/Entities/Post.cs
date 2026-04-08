using Amally.Core.Enums;
using NpgsqlTypes;

namespace Amally.Core.Entities;

public class Post
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public Guid UserId { get; set; }
    public int CategoryId { get; set; }
    public int RegionId { get; set; }
    public EducationLevel EducationLevel { get; set; }
    public PostStatus Status { get; set; } = PostStatus.Pending;
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public int ViewsCount { get; set; }
    public NpgsqlTsVector SearchVector { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Region Region { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Like> Likes { get; set; } = [];
    public ICollection<Bookmark> Bookmarks { get; set; } = [];
}
