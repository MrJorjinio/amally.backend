using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AmallyDbContext _db;

    public CategoryRepository(AmallyDbContext db) => _db = db;

    public async Task<List<Category>> GetAllAsync() =>
        await _db.Categories.OrderBy(c => c.Name).ToListAsync();

    public async Task<Category?> GetByIdAsync(int id) =>
        await _db.Categories.FindAsync(id);

    public async Task<List<(Category Category, int PostCount)>> GetTrendingAsync(int limit) =>
        await _db.Categories
            .Select(c => new { Category = c, PostCount = c.Posts.Count })
            .OrderByDescending(x => x.PostCount)
            .Take(limit)
            .Select(x => ValueTuple.Create(x.Category, x.PostCount))
            .ToListAsync();
}
