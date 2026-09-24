namespace EssentialService.Api.Models;

public class Asset
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AssetType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "Healthy";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SensorReading> SensorReadings { get; set; } = [];
    public ICollection<FailurePrediction> FailurePredictions { get; set; } = [];
}
