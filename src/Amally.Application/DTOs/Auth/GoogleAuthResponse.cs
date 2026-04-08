namespace Amally.Application.DTOs.Auth;

public class GoogleAuthResponse
{
    public bool RequiresUsername { get; set; }
    public string? Email { get; set; }
    public string? GoogleId { get; set; }
    public AuthResponse? Auth { get; set; }
}
