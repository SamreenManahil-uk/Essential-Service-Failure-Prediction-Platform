namespace EssentialService.Api.Models;

public class FailurePrediction
{
    public int Id { get; set; }
    public int AssetId { get; set; }

    public double FailureProbability { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public int PredictionWindowHours { get; set; }
    public string Explanation { get; set; } = string.Empty;

    public DateTime PredictedAt { get; set; } = DateTime.UtcNow;

    public Asset? Asset { get; set; }
}
