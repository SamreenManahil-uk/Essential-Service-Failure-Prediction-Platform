using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using EssentialService.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssentialService.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncidentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/incidents
    [HttpGet]
    public async Task<IActionResult> GetIncidents()
    {
        var incidents = await _context.Incidents
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(incidents);
    }

    // GET /api/incidents/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetIncident(int id)
    {
        var incident = await _context.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident == null)
            return NotFound($"Incident {id} not found.");

        return Ok(incident);
    }

    // GET /api/incidents/asset/1
    [HttpGet("asset/{assetId:int}")]
    public async Task<IActionResult> GetAssetIncidents(int assetId)
    {
        var incidents = await _context.Incidents
            .AsNoTracking()
            .Where(i => i.AssetId == assetId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        return Ok(incidents);
    }

    // PATCH /api/incidents/1/acknowledge
    [Authorize(Roles = "Admin,Engineer")]
    [HttpPatch("{id:int}/acknowledge")]
    public async Task<IActionResult> AcknowledgeIncident(int id)
    {
        var incident = await _context.Incidents
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident == null)
            return NotFound($"Incident {id} not found.");

        if (incident.Status == "Resolved")
            return BadRequest(
                "Resolved incidents cannot be acknowledged."
            );

        if (incident.Status == "Under Review")
            return BadRequest(
                "Incident is already under review."
            );

        var operatorName =
            User.FindFirstValue(ClaimTypes.Name)
            ?? User.Identity?.Name
            ?? "Authorised Operator";

        incident.Status = "Under Review";
        incident.AcknowledgedAt = DateTime.UtcNow;
        incident.AcknowledgedBy = operatorName;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            incident.Id,
            incident.AssetId,
            incident.Severity,
            incident.Status,
            incident.AcknowledgedAt,
            incident.AcknowledgedBy
        });
    }

    // PATCH /api/incidents/1/resolve
    [Authorize(Roles = "Admin,Engineer")]
    [HttpPatch("{id:int}/resolve")]
    public async Task<IActionResult> ResolveIncident(int id)
    {
        var incident = await _context.Incidents
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident == null)
            return NotFound($"Incident {id} not found.");

        if (incident.Status == "Resolved")
            return BadRequest("Incident is already resolved.");

        if (incident.Status != "Under Review")
            return BadRequest(
                "Incident must be acknowledged and placed Under Review before it can be resolved."
            );

        var operatorName =
            User.FindFirstValue(ClaimTypes.Name)
            ?? User.Identity?.Name
            ?? "Authorised Operator";

        incident.Status = "Resolved";
        incident.ResolvedAt = DateTime.UtcNow;
        incident.ResolvedBy = operatorName;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            incident.Id,
            incident.AssetId,
            incident.Severity,
            incident.Status,
            incident.AcknowledgedAt,
            incident.AcknowledgedBy,
            incident.ResolvedAt,
            incident.ResolvedBy
        });
    }
}
