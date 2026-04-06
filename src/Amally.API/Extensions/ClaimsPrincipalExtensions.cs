using System.Security.Claims;

namespace Amally.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }

    public static Guid? GetUserIdOrNull(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return id is not null ? Guid.Parse(id) : null;
    }
}
