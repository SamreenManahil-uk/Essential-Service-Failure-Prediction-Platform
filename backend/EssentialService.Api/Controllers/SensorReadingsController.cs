using EssentialService.Api.Data;
using EssentialService.Api.DTOs;
using EssentialService.Api.Models;
using EssentialService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssentialService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorReadingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly MlPredictionService _mlService;

    public SensorReadingsController(
        AppDbContext context,
        MlPredictionService mlService)
    {
        _context = context;
        _mlService = mlService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SensorReading>>> GetReadings()
    {
        return await _context.SensorReadings
            .AsNoTracking()
            .OrderByDescending(r => r.RecordedAt)
            .ToListAsync();
    }

    [HttpGet("asset/{assetId}")]
    public async Task<ActionResult<IEnumerable<SensorReading>>> GetByAsset(int assetId)
    {
        return await _context.SensorReadings
            .AsNoTracking()
            .Where(r => r.AssetId == assetId)
            .OrderByDescending(r => r.RecordedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> CreateReading(SensorReading reading)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == reading.AssetId);

        if (asset == null)
            return BadRequest("Asset does not exist.");

        if (!new[] { "L", "M", "H" }.Contains(reading.MachineType))
            return BadRequest("MachineType must be L, M, or H.");

        reading.RecordedAt = DateTime.UtcNow;

        _context.SensorReadings.Add(reading);
        await _context.SaveChangesAsync();

        var mlRequest = new MlPredictionRequest
        {
            AssetId = reading.AssetId,
            MachineType = reading.MachineType,
            AirTemperature = reading.AirTemperature,
            ProcessTemperature = reading.ProcessTemperature,
            RotationalSpeed = reading.RotationalSpeed,
            Torque = reading.Torque,
            ToolWear = reading.ToolWear
        };

        var mlResult = await _mlService.PredictAsync(mlRequest);

        if (mlResult == null)
            return StatusCode(500, "ML service returned no prediction.");

        var prediction = new FailurePrediction
        {
            AssetId = reading.AssetId,
            FailureProbability = mlResult.FailureProbability,
            RiskLevel = mlResult.RiskLevel,
            PredictionWindowHours = mlResult.PredictionWindowHours,
            Explanation =
                $"Model: {mlResult.ModelType}; " +
                $"Predicted failure: {mlResult.PredictedFailure}",
            PredictedAt = DateTime.UtcNow
        };

        _context.FailurePredictions.Add(prediction);

        asset.Status = mlResult.RiskLevel;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            sensorReading = new
            {
                reading.Id,
                reading.AssetId,
                reading.MachineType,
                reading.AirTemperature,
                reading.ProcessTemperature,
                reading.RotationalSpeed,
                reading.Torque,
                reading.ToolWear,
                reading.RecordedAt
            },

            prediction = new
            {
                prediction.Id,
                mlResult.PredictedFailure,
                prediction.FailureProbability,
                prediction.RiskLevel,
                prediction.PredictionWindowHours,
                mlResult.ModelType,
                prediction.PredictedAt
            },

            assetStatus = asset.Status
        });
    }
}
