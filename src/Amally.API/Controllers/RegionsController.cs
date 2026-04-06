using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegionsController : ControllerBase
{
    private readonly IRegionRepository _regionRepo;

    public RegionsController(IRegionRepository regionRepo) => _regionRepo = regionRepo;

    [HttpGet]
    public async Task<ActionResult<List<Region>>> GetAll()
    {
        var regions = await _regionRepo.GetAllAsync();
        return Ok(regions);
    }
}
