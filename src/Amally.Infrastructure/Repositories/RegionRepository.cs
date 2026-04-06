using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class RegionRepository : IRegionRepository
{
    private readonly AmallyDbContext _db;

    public RegionRepository(AmallyDbContext db) => _db = db;

    public async Task<List<Region>> GetAllAsync() =>
        await _db.Regions.OrderBy(r => r.Name).ToListAsync();

    public async Task<Region?> GetByIdAsync(int id) =>
        await _db.Regions.FindAsync(id);
}
