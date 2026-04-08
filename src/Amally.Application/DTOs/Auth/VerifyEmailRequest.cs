using System.ComponentModel.DataAnnotations;

namespace Amally.Application.DTOs.Auth;

public class VerifyEmailRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string OtpCode { get; set; } = string.Empty;
}
