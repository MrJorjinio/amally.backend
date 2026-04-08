using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Auth;

public class GoogleAuthRequest
{
    [Required]
    public string IdToken { get; set; } = string.Empty;

    public string? Username { get; set; }
}
