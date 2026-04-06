using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface IRegionRepository
{
    Task<List<Region>> GetAllAsync();
    Task<Region?> GetByIdAsync(int id);
}
