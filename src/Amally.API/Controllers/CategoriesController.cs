using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoriesController(ICategoryRepository categoryRepo) => _categoryRepo = categoryRepo;

    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] int limit = 8)
    {
        var trending = await _categoryRepo.GetTrendingAsync(limit);
        var result = trending.Select(t => new
        {
            id = t.Category.Id,
            name = t.Category.Name,
            slug = t.Category.Slug,
            postCount = t.PostCount
        });
        return Ok(result);
    }
}
