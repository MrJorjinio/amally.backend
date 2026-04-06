using Amally.Application.DTOs;
using Amally.Application.DTOs.Users;

namespace Amally.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(Guid userId, Guid? currentUserId);
    Task<UserProfileDto> GetProfileByUsernameAsync(string username, Guid? currentUserId);
    Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<bool> ToggleFollowAsync(Guid followerId, Guid targetUserId);
    Task<PaginatedResult<UserSummaryDto>> GetFollowersAsync(Guid userId, int page, int pageSize);
    Task<PaginatedResult<UserSummaryDto>> GetFollowingAsync(Guid userId, int page, int pageSize);
}
