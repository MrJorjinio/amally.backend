using Amally.API.Extensions;
using Amally.Application.Interfaces;
using Amally.Core.Enums;
using Amally.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AmallyDbContext _db;
    private readonly ITokenService _tokenService;

    public AdminController(AmallyDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // POST /api/admin/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] AdminLoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Role == UserRole.Admin);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { error = "Noto'g'ri email yoki parol" });

        var token = _tokenService.GenerateAccessToken(user);
        return Ok(new { token, user = new { user.Id, user.FullName, user.Email } });
    }

    // GET /api/admin/stats
    [Authorize(Roles = "Admin")]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _db.Users.CountAsync(u => u.Role == UserRole.User);
        var totalPosts = await _db.Posts.CountAsync();
        var approvedPosts = await _db.Posts.CountAsync(p => p.Status == PostStatus.Approved);
        var pendingPosts = await _db.Posts.CountAsync(p => p.Status == PostStatus.Pending);

        var today = DateTime.UtcNow.Date.ToUniversalTime();
        var weekAgo = today.AddDays(-7);
        var yearStart = new DateTime(today.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var postsToday = await _db.Posts.CountAsync(p => p.CreatedAt >= today);
        var postsThisWeek = await _db.Posts.CountAsync(p => p.CreatedAt >= weekAgo);
        var postsThisYear = await _db.Posts.CountAsync(p => p.CreatedAt >= yearStart);

        return Ok(new
        {
            totalUsers,
            totalPosts,
            approvedPosts,
            pendingPosts,
            postsToday,
            postsThisWeek,
            postsThisYear,
        });
    }

    // GET /api/admin/user-growth?period=daily|monthly|yearly
    [Authorize(Roles = "Admin")]
    [HttpGet("user-growth")]
    public async Task<IActionResult> GetUserGrowth([FromQuery] string period = "daily")
    {
        var now = DateTime.UtcNow;
        List<object> data;

        if (period == "monthly")
        {
            var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
            var raw = await _db.Users
                .Where(u => u.CreatedAt >= start && u.Role == UserRole.User)
                .Select(u => u.CreatedAt)
                .ToListAsync();
            var grouped = raw.GroupBy(d => new { d.Year, d.Month }).ToDictionary(g => g.Key, g => g.Count());

            data = Enumerable.Range(0, 12).Select(i =>
            {
                var d = now.AddMonths(-11 + i);
                var key = new { d.Year, d.Month };
                return (object)new { label = d.ToString("MMM yy"), count = grouped.GetValueOrDefault(key, 0) };
            }).ToList();
        }
        else if (period == "yearly")
        {
            var start = new DateTime(now.Year - 4, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var raw = await _db.Users
                .Where(u => u.CreatedAt >= start && u.Role == UserRole.User)
                .Select(u => u.CreatedAt.Year)
                .ToListAsync();
            var grouped = raw.GroupBy(y => y).ToDictionary(g => g.Key, g => g.Count());

            data = Enumerable.Range(0, 5).Select(i =>
            {
                var year = now.Year - 4 + i;
                return (object)new { label = year.ToString(), count = grouped.GetValueOrDefault(year, 0) };
            }).ToList();
        }
        else // daily
        {
            var start = now.Date.ToUniversalTime().AddDays(-29);
            var raw = await _db.Users
                .Where(u => u.CreatedAt >= start && u.Role == UserRole.User)
                .Select(u => u.CreatedAt)
                .ToListAsync();
            var grouped = raw.GroupBy(d => d.Date).ToDictionary(g => g.Key, g => g.Count());

            data = Enumerable.Range(0, 30).Select(i =>
            {
                var d = now.Date.AddDays(-29 + i);
                return (object)new { label = d.ToString("dd/MM"), count = grouped.GetValueOrDefault(d, 0) };
            }).ToList();
        }

        return Ok(data);
    }

    // GET /api/admin/top-posts?period=all|week|today
    [Authorize(Roles = "Admin")]
    [HttpGet("top-posts")]
    public async Task<IActionResult> GetTopPosts([FromQuery] string period = "all", [FromQuery] int limit = 10)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Where(p => p.Status == PostStatus.Approved)
            .AsQueryable();

        if (period == "today")
            query = query.Where(p => p.CreatedAt >= DateTime.UtcNow.Date.ToUniversalTime());
        else if (period == "week")
            query = query.Where(p => p.CreatedAt >= DateTime.UtcNow.AddDays(-7));

        var posts = await query
            .OrderByDescending(p => p.LikesCount + p.CommentsCount + p.ViewsCount)
            .Take(limit)
            .Select(p => new
            {
                p.Id, p.Title, author = p.User.FullName,
                category = p.Category.Name,
                p.LikesCount, p.CommentsCount, p.ViewsCount,
                p.CreatedAt,
            })
            .ToListAsync();

        return Ok(posts);
    }

    // GET /api/admin/users?page=1&pageSize=20
    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Users.Where(u => u.Role == UserRole.User).OrderByDescending(u => u.CreatedAt);
        var total = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(u => new
            {
                u.Id, u.FullName, u.Username, u.Email,
                u.ProfilePictureUrl, u.FollowersCount, u.FollowingCount,
                u.CreatedAt,
                postsCount = u.Posts.Count,
            })
            .ToListAsync();

        return Ok(new { items = users, totalCount = total, page, pageSize });
    }

    // GET /api/admin/posts?page=1&pageSize=20&status=all|pending|approved|rejected
    [Authorize(Roles = "Admin")]
    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string status = "all")
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Category)
            .Include(p => p.Region)
            .AsQueryable();

        if (status == "pending") query = query.Where(p => p.Status == PostStatus.Pending);
        else if (status == "approved") query = query.Where(p => p.Status == PostStatus.Approved);
        else if (status == "rejected") query = query.Where(p => p.Status == PostStatus.Rejected);

        query = query.OrderByDescending(p => p.CreatedAt);
        var total = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new
            {
                p.Id, p.Title, p.Content, author = p.User.FullName, authorUsername = p.User.Username,
                category = p.Category.Name, region = p.Region.Name,
                educationLevel = p.EducationLevel.ToString(),
                status = p.Status.ToString(),
                p.LikesCount, p.CommentsCount, p.ViewsCount,
                p.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { items = posts, totalCount = total, page, pageSize });
    }

    // POST /api/admin/posts/{id}/approve
    [Authorize(Roles = "Admin")]
    [HttpPost("posts/{id:guid}/approve")]
    public async Task<IActionResult> ApprovePost(Guid id)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) return NotFound();
        post.Status = PostStatus.Approved;
        await _db.SaveChangesAsync();
        return Ok(new { status = "Approved" });
    }

    // POST /api/admin/posts/{id}/reject
    [Authorize(Roles = "Admin")]
    [HttpPost("posts/{id:guid}/reject")]
    public async Task<IActionResult> RejectPost(Guid id)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) return NotFound();
        post.Status = PostStatus.Rejected;
        await _db.SaveChangesAsync();
        return Ok(new { status = "Rejected" });
    }
}

public class AdminLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
