using System.Security.Cryptography;
using Amally.Application.DTOs.Auth;
using Amally.Application.Interfaces;
using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;

namespace Amally.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IOtpRepository _otpRepo;
    private readonly IConfiguration _config;

    public AuthService(
        IUserRepository userRepo,
        ITokenService tokenService,
        IEmailService emailService,
        IOtpRepository otpRepo,
        IConfiguration config)
    {
        _userRepo = userRepo;
        _tokenService = tokenService;
        _emailService = emailService;
        _otpRepo = otpRepo;
        _config = config;
    }

    public async Task<MessageResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepo.ExistsByEmailAsync(request.Email))
            throw new InvalidOperationException("Email already in use.");

        if (await _userRepo.ExistsByUsernameAsync(request.Username))
            throw new InvalidOperationException("Username already taken.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.ToLowerInvariant(),
            FullName = request.FullName,
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.CreateAsync(user);

        var otp = GenerateOtp();
        await SaveAndSendOtpAsync(user.Email, otp);

        return new MessageResponse { Message = "Registration successful. Please verify your email with the OTP code sent." };
    }

    public async Task<AuthResponse> VerifyEmailAsync(VerifyEmailRequest request)
    {
        var email = request.Email.ToLowerInvariant();
        var otpEntity = await _otpRepo.GetValidOtpAsync(email, request.OtpCode)
            ?? throw new InvalidOperationException("Invalid or expired OTP code.");

        var user = await _userRepo.GetByEmailAsync(email)
            ?? throw new InvalidOperationException("User not found.");

        user.IsEmailVerified = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepo.UpdateAsync(user);

        await _otpRepo.MarkAsUsedAsync(otpEntity.Id);

        _ = Task.Run(async () =>
        {
            try { await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName.Split(' ')[0]); }
            catch { /* logged inside EmailService */ }
        });

        return BuildAuthResponse(user);
    }

    public async Task<MessageResponse> ResendOtpAsync(ResendOtpRequest request)
    {
        var email = request.Email.ToLowerInvariant();
        var user = await _userRepo.GetByEmailAsync(email)
            ?? throw new InvalidOperationException("User not found.");

        if (user.IsEmailVerified)
            throw new InvalidOperationException("Email is already verified.");

        var otp = GenerateOtp();
        await SaveAndSendOtpAsync(email, otp);

        return new MessageResponse { Message = "A new OTP code has been sent to your email." };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var input = request.EmailOrUsername.ToLowerInvariant();
        var user = input.Contains('@')
            ? await _userRepo.GetByEmailAsync(input)
            : await _userRepo.GetByUsernameAsync(input);

        if (user is null || user.PasswordHash is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsEmailVerified)
        {
            var otp = GenerateOtp();
            await SaveAndSendOtpAsync(user.Email, otp);
            throw new InvalidOperationException("Email not verified. A new OTP code has been sent to your email.");
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var userId = _tokenService.ValidateRefreshToken(refreshToken);
        if (userId is null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var user = await _userRepo.GetByIdAsync(userId.Value)
            ?? throw new UnauthorizedAccessException("User not found.");

        return BuildAuthResponse(user);
    }

    public async Task<GoogleAuthResponse> GoogleAuthAsync(GoogleAuthRequest request)
    {
        var googleClientId = _config["Google:ClientId"]
            ?? throw new InvalidOperationException("Google Client ID is not configured.");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [googleClientId]
                });
        }
        catch (InvalidJwtException)
        {
            throw new UnauthorizedAccessException("Invalid Google ID token.");
        }

        var googleId = payload.Subject;
        var email = payload.Email.ToLowerInvariant();

        // Check if user with this GoogleId already exists
        var existingUser = await _userRepo.GetByEmailAsync(email);

        if (existingUser is not null)
        {
            // User exists with this email
            if (existingUser.GoogleId is null)
            {
                // Link Google account to existing user
                existingUser.GoogleId = googleId;
                existingUser.IsEmailVerified = true;
                existingUser.UpdatedAt = DateTime.UtcNow;
                if (existingUser.ProfilePictureUrl is null && payload.Picture is not null)
                    existingUser.ProfilePictureUrl = payload.Picture;
                await _userRepo.UpdateAsync(existingUser);
            }

            return new GoogleAuthResponse
            {
                RequiresUsername = false,
                Auth = BuildAuthResponse(existingUser)
            };
        }

        // New user - need username
        if (string.IsNullOrWhiteSpace(request.Username))
        {
            return new GoogleAuthResponse
            {
                RequiresUsername = true,
                Email = email,
                GoogleId = googleId
            };
        }

        // Create new user with provided username
        var username = request.Username.ToLowerInvariant();
        if (await _userRepo.ExistsByUsernameAsync(username))
            throw new InvalidOperationException("Username already taken.");

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            FullName = payload.Name ?? username,
            Email = email,
            GoogleId = googleId,
            IsEmailVerified = true,
            ProfilePictureUrl = payload.Picture,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.CreateAsync(newUser);

        _ = Task.Run(async () =>
        {
            try { await _emailService.SendWelcomeEmailAsync(newUser.Email, newUser.FullName.Split(' ')[0]); }
            catch { /* logged inside EmailService */ }
        });

        return new GoogleAuthResponse
        {
            RequiresUsername = false,
            Auth = BuildAuthResponse(newUser)
        };
    }

    private AuthResponse BuildAuthResponse(User user) => new()
    {
        Token = _tokenService.GenerateAccessToken(user),
        RefreshToken = _tokenService.GenerateRefreshToken(),
        User = new UserMinimalDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePictureUrl
        }
    };

    private static string GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(100000, 999999).ToString();
    }

    private async Task SaveAndSendOtpAsync(string email, string otp)
    {
        var otpEntity = new EmailVerificationOtp
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            OtpCode = otp,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        await _otpRepo.CreateAsync(otpEntity);
        await _emailService.SendEmailVerificationOtpAsync(email, otp);
    }
}
