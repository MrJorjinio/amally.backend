using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Auth;

public class RegisterRequest
{
    [Required, StringLength(30, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}
