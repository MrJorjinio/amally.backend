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
}
