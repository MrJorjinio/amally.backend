using Amally.API.Extensions;
using Amally.API.Middleware;
using Amally.Core.Entities;
using Amally.Core.Enums;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRepositories();
builder.Services.AddApplicationServices();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:3000", "http://localhost:3001"])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AmallyDbContext>();
    await db.Database.MigrateAsync();

    // Mark existing posts as Approved (one-time migration)
    var pendingOldPosts = await db.Posts.Where(p => p.Status == PostStatus.Pending && p.CreatedAt < DateTime.UtcNow.AddMinutes(-1)).CountAsync();
    if (pendingOldPosts > 0)
    {
        await db.Posts.Where(p => p.Status == PostStatus.Pending && p.CreatedAt < DateTime.UtcNow.AddMinutes(-1))
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.Status, PostStatus.Approved));
        Log.Information("Approved {Count} existing posts", pendingOldPosts);
    }

    // Seed admin account if not exists
    if (!await db.Users.AnyAsync(u => u.Role == UserRole.Admin))
    {
        db.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Username = "admin",
            FullName = "Admin",
            Email = "admin@amally.uz",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        Log.Information("Admin account seeded: admin@amally.uz / Admin123!");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("Amally API started on {Urls}", string.Join(", ", app.Urls));
app.Run();
