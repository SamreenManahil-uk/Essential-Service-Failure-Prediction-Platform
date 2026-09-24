using EssentialService.Api.Data;
using EssentialService.Api.DTOs;
using EssentialService.Api.Models;
using EssentialService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace EssentialService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PredictionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly MlPredictionService _mlService;
    private readonly IConnectionMultiplexer _redis;

    public PredictionsController(
        AppDbContext context,
        MlPredictionService mlService,
        IConnectionMultiplexer redis)
    {
        _context = context;
        _mlService = mlService;
        _redis = redis;
    }

    [HttpPost]
    public async Task<IActionResult> Predict(
        MlPredictionRequest request)
    {
        var assetExists = await _context.Assets
            .AnyAsync(a => a.Id == request.AssetId);

        if (!assetExists)
        {
            return NotFound(
                $"Asset {request.AssetId} does not exist."
            );
        }

        var mlResult = await _mlService.PredictAsync(request);

        if (mlResult == null)
        {
            return StatusCode(
                500,
                "ML service returned no prediction."
            );
        }

        var prediction = new FailurePrediction
        {
            AssetId = request.AssetId,
            FailureProbability = mlResult.FailureProbability,
            RiskLevel = mlResult.RiskLevel,
            PredictionWindowHours = mlResult.PredictionWindowHours,
            Explanation =
                $"Model: {mlResult.ModelType}; " +
                $"Predicted failure: {mlResult.PredictedFailure}",
            PredictedAt = DateTime.UtcNow
        };

        _context.FailurePredictions.Add(prediction);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            prediction.Id,
            prediction.AssetId,
            mlResult.PredictedFailure,
            prediction.FailureProbability,
            prediction.RiskLevel,
            prediction.PredictionWindowHours,
            mlResult.ModelType,
            prediction.PredictedAt
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetPredictions()
    {
        var predictions = await _context.FailurePredictions
            .AsNoTracking()
            .OrderByDescending(p => p.PredictedAt)
            .ToListAsync();

        return Ok(predictions);
    }

    [HttpGet("latest/{assetId}")]
    public async Task<IActionResult> GetLatestPrediction(int assetId)
    {
        var cache = _redis.GetDatabase();

        var cacheKey = $"asset:{assetId}:latest-prediction";

        var cachedPrediction =
            await cache.StringGetAsync(cacheKey);

        if (cachedPrediction.HasValue)
        {
            return Content(
                cachedPrediction.ToString(),
                "application/json"
            );
        }

        var prediction = await _context.FailurePredictions
            .AsNoTracking()
            .Where(p => p.AssetId == assetId)
            .OrderByDescending(p => p.PredictedAt)
            .FirstOrDefaultAsync();

        if (prediction == null)
        {
            return NotFound(
                $"No prediction found for Asset {assetId}."
            );
        }

        return Ok(new
        {
            prediction.Id,
            prediction.AssetId,
            prediction.FailureProbability,
            prediction.RiskLevel,
            prediction.PredictionWindowHours,
            prediction.Explanation,
            prediction.PredictedAt,
            Source = "PostgreSQL"
        });
    }

}
