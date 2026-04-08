using Amally.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Amally.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IStorageService _storage;

    public UploadController(IStorageService storage) => _storage = storage;

    [Authorize]
    [HttpPost("image")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5MB
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Fayl tanlanmagan" });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".gif"))
            return BadRequest(new { error = "Faqat rasm fayllari qabul qilinadi" });

        var fileName = $"{Guid.NewGuid()}{ext}";

        using var stream = file.OpenReadStream();
        var url = await _storage.UploadAsync(stream, fileName, file.ContentType);

        return Ok(new { url });
    }
}
