using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Auth;

public class LoginRequest
{
    [Required]
    public string EmailOrUsername { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
