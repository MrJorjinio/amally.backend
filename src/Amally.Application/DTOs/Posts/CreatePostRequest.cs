using System.ComponentModel.DataAnnotations;
using Amally.Core.Enums;

namespace Amally.Application.DTOs.Posts;

public class CreatePostRequest
{
    [Required, StringLength(200, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required, MinLength(20)]
    public string Content { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int RegionId { get; set; }

    [Required]
    public EducationLevel EducationLevel { get; set; }
}
