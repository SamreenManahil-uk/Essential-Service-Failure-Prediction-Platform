namespace EssentialService.Api.Models;

public class Incident
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public int FailurePredictionId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Severity { get; set; } = string.Empty;

    public string Status { get; set; } = "Open";

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcknowledgedAt { get; set; }

    public string? AcknowledgedBy { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public string? ResolvedBy { get; set; }

    public Asset? Asset { get; set; }

    public FailurePrediction? FailurePrediction { get; set; }
}
