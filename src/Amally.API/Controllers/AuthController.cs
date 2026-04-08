using Amally.Application.DTOs.Auth;
using Amally.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<ActionResult<MessageResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<AuthResponse>> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var result = await _authService.VerifyEmailAsync(request);
        return Ok(result);
    }

    [HttpPost("resend-otp")]
    public async Task<ActionResult<MessageResponse>> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var result = await _authService.ResendOtpAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(result);
    }

    [HttpPost("google")]
    public async Task<ActionResult<GoogleAuthResponse>> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        var result = await _authService.GoogleAuthAsync(request);
        return Ok(result);
    }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
