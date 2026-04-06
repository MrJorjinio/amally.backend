using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Users;

public class UpdateProfileRequest
{
    [StringLength(100)]
    public string? FullName { get; set; }

    [StringLength(500)]
    public string? Bio { get; set; }

    public string? ProfilePictureUrl { get; set; }
}
