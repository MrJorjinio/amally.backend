using Amally.Application.DTOs.Auth;
using Amally.Application.Interfaces;
using Amally.Core.Entities;
using Amally.Core.Interfaces;

namespace Amally.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepo, ITokenService tokenService)
    {
        _userRepo = userRepo;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
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
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.CreateAsync(user);

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var input = request.EmailOrUsername.ToLowerInvariant();
        var user = input.Contains('@')
            ? await _userRepo.GetByEmailAsync(input)
            : await _userRepo.GetByUsernameAsync(input);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

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
}
