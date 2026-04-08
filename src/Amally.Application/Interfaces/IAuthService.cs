using Amally.Application.DTOs.Auth;

namespace Amally.Application.Interfaces;

public interface IAuthService
{
    Task<MessageResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> VerifyEmailAsync(VerifyEmailRequest request);
    Task<MessageResponse> ResendOtpAsync(ResendOtpRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task<GoogleAuthResponse> GoogleAuthAsync(GoogleAuthRequest request);
}
