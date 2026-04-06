using System.ComponentModel.DataAnnotations;
using Amally.Core.Enums;

namespace Amally.Application.DTOs.Posts;

public class UpdatePostRequest
{
    [StringLength(200, MinimumLength = 5)]
    public string? Title { get; set; }

    [MinLength(20)]
    public string? Content { get; set; }

    public string? CoverImageUrl { get; set; }
    public int? CategoryId { get; set; }
    public int? RegionId { get; set; }
    public EducationLevel? EducationLevel { get; set; }
}
