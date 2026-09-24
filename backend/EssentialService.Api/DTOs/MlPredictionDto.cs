using System.Text.Json.Serialization;

namespace EssentialService.Api.DTOs;

public class MlPredictionRequest
{
    [JsonPropertyName("asset_id")]
    public int AssetId { get; set; }

    [JsonPropertyName("machine_type")]
    public string MachineType { get; set; } = "M";

    [JsonPropertyName("air_temperature")]
    public double AirTemperature { get; set; }

    [JsonPropertyName("process_temperature")]
    public double ProcessTemperature { get; set; }

    [JsonPropertyName("rotational_speed")]
    public double RotationalSpeed { get; set; }

    [JsonPropertyName("torque")]
    public double Torque { get; set; }

    [JsonPropertyName("tool_wear")]
    public double ToolWear { get; set; }
}


public class ShapContributionDto
{
    [JsonPropertyName("feature")]
    public string Feature { get; set; } = string.Empty;

    [JsonPropertyName("shap_value")]
    public double ShapValue { get; set; }

    [JsonPropertyName("impact")]
    public string Impact { get; set; } = string.Empty;
}


public class MlPredictionResponse
{
    [JsonPropertyName("asset_id")]
    public int AssetId { get; set; }

    [JsonPropertyName("predicted_failure")]
    public int PredictedFailure { get; set; }

    [JsonPropertyName("failure_probability")]
    public double FailureProbability { get; set; }

    [JsonPropertyName("risk_level")]
    public string RiskLevel { get; set; } = string.Empty;

    [JsonPropertyName("prediction_window_hours")]
    public int PredictionWindowHours { get; set; }

    [JsonPropertyName("model_type")]
    public string ModelType { get; set; } = string.Empty;

    [JsonPropertyName("top_contributing_factors")]
    public List<ShapContributionDto> TopContributingFactors { get; set; } = [];
}
