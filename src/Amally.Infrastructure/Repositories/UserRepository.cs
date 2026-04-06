using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AmallyDbContext _db;

    public UserRepository(AmallyDbContext db) => _db = db;

    public async Task<User?> GetByIdAsync(Guid id) =>
        await _db.Users.FindAsync(id);

    public async Task<User?> GetByUsernameAsync(string username) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
    }

    public async Task<bool> ExistsByUsernameAsync(string username) =>
        await _db.Users.AnyAsync(u => u.Username == username.ToLower());

    public async Task<bool> ExistsByEmailAsync(string email) =>
        await _db.Users.AnyAsync(u => u.Email == email.ToLower());
}
