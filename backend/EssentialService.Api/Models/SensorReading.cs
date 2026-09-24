namespace EssentialService.Api.Models;

public class SensorReading
{
    public int Id { get; set; }

    public int AssetId { get; set; }

    public string MachineType { get; set; } = "M";

    public double AirTemperature { get; set; }

    public double ProcessTemperature { get; set; }

    public double RotationalSpeed { get; set; }

    public double Torque { get; set; }

    public double ToolWear { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public Asset? Asset { get; set; }
}
