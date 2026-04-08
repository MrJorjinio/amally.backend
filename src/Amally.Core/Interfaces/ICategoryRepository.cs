using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<List<(Category Category, int PostCount)>> GetTrendingAsync(int limit);
}
