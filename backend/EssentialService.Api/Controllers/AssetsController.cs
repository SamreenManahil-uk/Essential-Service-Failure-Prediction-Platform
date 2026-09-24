using EssentialService.Api.Data;
using Microsoft.AspNetCore.Authorization;
using EssentialService.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssentialService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AssetsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAssets()
    {
        return await _context.Assets
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Asset>> GetAsset(int id)
    {
        var asset = await _context.Assets
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset == null)
            return NotFound();

        return asset;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Engineer")]
    public async Task<ActionResult<Asset>> CreateAsset(Asset asset)
    {
        asset.CreatedAt = DateTime.UtcNow;

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAsset),
            new { id = asset.Id },
            asset);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Engineer")]
    public async Task<IActionResult> UpdateAsset(int id, Asset asset)
    {
        if (id != asset.Id)
            return BadRequest();

        _context.Entry(asset).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Assets.AnyAsync(a => a.Id == id))
                return NotFound();

            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Engineer")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        var asset = await _context.Assets.FindAsync(id);

        if (asset == null)
            return NotFound();

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
