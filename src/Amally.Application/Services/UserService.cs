using Amally.Application.DTOs;
using Amally.Application.DTOs.Users;
using Amally.Application.Interfaces;
using Amally.Core.Interfaces;

namespace Amally.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;
    private readonly IFollowRepository _followRepo;
    private readonly IPostRepository _postRepo;

    public UserService(IUserRepository userRepo, IFollowRepository followRepo, IPostRepository postRepo)
    {
        _userRepo = userRepo;
        _followRepo = followRepo;
        _postRepo = postRepo;
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId, Guid? currentUserId)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var (_, postsCount) = await _postRepo.GetByUserIdAsync(userId, 1, 1);

        var dto = new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            FollowersCount = user.FollowersCount,
            FollowingCount = user.FollowingCount,
            PostsCount = postsCount,
            CreatedAt = user.CreatedAt
        };

        if (currentUserId.HasValue && currentUserId.Value != userId)
            dto.IsFollowing = await _followRepo.ExistsAsync(currentUserId.Value, userId);

        return dto;
    }

    public async Task<UserProfileDto> GetProfileByUsernameAsync(string username, Guid? currentUserId)
    {
        var user = await _userRepo.GetByUsernameAsync(username.ToLowerInvariant())
            ?? throw new KeyNotFoundException("User not found.");

        return await GetProfileAsync(user.Id, currentUserId);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _userRepo.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (request.FullName is not null) user.FullName = request.FullName;
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.ProfilePictureUrl is not null) user.ProfilePictureUrl = request.ProfilePictureUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepo.UpdateAsync(user);

        return await GetProfileAsync(userId, userId);
    }

    public async Task<bool> ToggleFollowAsync(Guid followerId, Guid targetUserId)
    {
        if (followerId == targetUserId)
            throw new InvalidOperationException("You cannot follow yourself.");

        var target = await _userRepo.GetByIdAsync(targetUserId)
            ?? throw new KeyNotFoundException("User not found.");

        var follower = await _userRepo.GetByIdAsync(followerId)
            ?? throw new KeyNotFoundException("User not found.");

        if (await _followRepo.ExistsAsync(followerId, targetUserId))
        {
            await _followRepo.DeleteAsync(followerId, targetUserId);
            target.FollowersCount = Math.Max(0, target.FollowersCount - 1);
            follower.FollowingCount = Math.Max(0, follower.FollowingCount - 1);
            await _userRepo.UpdateAsync(target);
            await _userRepo.UpdateAsync(follower);
            return false;
        }

        await _followRepo.CreateAsync(new Core.Entities.UserFollow
        {
            FollowerId = followerId,
            FollowingId = targetUserId,
            CreatedAt = DateTime.UtcNow
        });
        target.FollowersCount++;
        follower.FollowingCount++;
        await _userRepo.UpdateAsync(target);
        await _userRepo.UpdateAsync(follower);
        return true;
    }

    public async Task<PaginatedResult<UserSummaryDto>> GetFollowersAsync(Guid userId, int page, int pageSize)
    {
        var (users, totalCount) = await _followRepo.GetFollowersAsync(userId, page, pageSize);
        return new PaginatedResult<UserSummaryDto>
        {
            Items = users.Select(u => new UserSummaryDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                ProfilePictureUrl = u.ProfilePictureUrl
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PaginatedResult<UserSummaryDto>> GetFollowingAsync(Guid userId, int page, int pageSize)
    {
        var (users, totalCount) = await _followRepo.GetFollowingAsync(userId, page, pageSize);
        return new PaginatedResult<UserSummaryDto>
        {
            Items = users.Select(u => new UserSummaryDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                ProfilePictureUrl = u.ProfilePictureUrl
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
