using System.Text.Json;
using Confluent.Kafka;
using EssentialService.Api.Data;
using EssentialService.Api.DTOs;
using EssentialService.Api.Models;
using EssentialService.Api.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace EssentialService.Api.BackgroundServices;

public class KafkaSensorConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<KafkaSensorConsumer> _logger;
    private readonly IConfiguration _configuration;
    private readonly LiveEventService _liveEvents;

    public KafkaSensorConsumer(
        IServiceScopeFactory scopeFactory,
        ILogger<KafkaSensorConsumer> logger,
        IConfiguration configuration,
        LiveEventService liveEvents)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _configuration = configuration;
        _liveEvents = liveEvents;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers =
                _configuration["Kafka:BootstrapServers"]
                ?? "localhost:9092",
            GroupId = "essential-service-consumer",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        using var consumer = new ConsumerBuilder<Ignore, string>(config).Build();

        consumer.Subscribe("sensor-readings");

        _logger.LogInformation(
            "Kafka consumer started. Listening to sensor-readings..."
        );

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(stoppingToken);

                var reading = JsonSerializer.Deserialize<SensorReading>(
                    result.Message.Value,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                if (reading == null)
                    continue;

                _liveEvents.Publish(new LivePipelineEvent(
                    "KAFKA",
                    "Sensor telemetry consumed from sensor-readings",
                    "QUEUE",
                    DateTime.UtcNow,
                    reading.AssetId
                ));

                _liveEvents.Publish(new LivePipelineEvent(
                    ".NET",
                    "Sensor event processing started",
                    "PROCESS",
                    DateTime.UtcNow,
                    reading.AssetId
                ));

                using var scope = _scopeFactory.CreateScope();

                var db = scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();

                var mlService = scope.ServiceProvider
                    .GetRequiredService<MlPredictionService>();

                var asset = await db.Assets
                    .FirstOrDefaultAsync(
                        a => a.Id == reading.AssetId,
                        stoppingToken
                    );

                if (asset == null)
                {
                    _logger.LogWarning(
                        "Kafka event ignored. Asset {AssetId} does not exist.",
                        reading.AssetId
                    );

                    continue;
                }

                reading.Id = 0;
                reading.RecordedAt = DateTime.UtcNow;

                db.SensorReadings.Add(reading);
                await db.SaveChangesAsync(stoppingToken);

                var request = new MlPredictionRequest
                {
                    AssetId = reading.AssetId,
                    MachineType = reading.MachineType,
                    AirTemperature = reading.AirTemperature,
                    ProcessTemperature = reading.ProcessTemperature,
                    RotationalSpeed = reading.RotationalSpeed,
                    Torque = reading.Torque,
                    ToolWear = reading.ToolWear
                };

                _liveEvents.Publish(new LivePipelineEvent(
                    "ML",
                    "XGBoost inference requested",
                    "AI",
                    DateTime.UtcNow,
                    reading.AssetId
                ));

                var mlResult = await mlService.PredictAsync(request);

                if (mlResult == null)
                {
                    _logger.LogWarning(
                        "ML service returned no result for Asset {AssetId}.",
                        reading.AssetId
                    );

                    continue;
                }

                var prediction = new FailurePrediction
                {
                    AssetId = reading.AssetId,
                    FailureProbability = mlResult.FailureProbability,
                    RiskLevel = mlResult.RiskLevel,
                    PredictionWindowHours = mlResult.PredictionWindowHours,
                    Explanation = JsonSerializer.Serialize(
                        mlResult.TopContributingFactors
                    ),
                    PredictedAt = DateTime.UtcNow
                };

                _liveEvents.Publish(new LivePipelineEvent(
                    "SHAP",
                    "Feature contributions generated",
                    "AI",
                    DateTime.UtcNow,
                    reading.AssetId,
                    mlResult.FailureProbability,
                    mlResult.RiskLevel
                ));

                _liveEvents.Publish(new LivePipelineEvent(
                    "RISK",
                    $"{mlResult.RiskLevel} failure probability detected",
                    mlResult.RiskLevel == "Critical"
                        ? "CRITICAL"
                        : "PREDICTION",
                    DateTime.UtcNow,
                    reading.AssetId,
                    mlResult.FailureProbability,
                    mlResult.RiskLevel
                ));

                db.FailurePredictions.Add(prediction);

                asset.Status = mlResult.RiskLevel;

                await db.SaveChangesAsync(stoppingToken);

                _liveEvents.Publish(new LivePipelineEvent(
                    "DB",
                    "Prediction persisted to PostgreSQL",
                    "STORE",
                    DateTime.UtcNow,
                    reading.AssetId,
                    mlResult.FailureProbability,
                    mlResult.RiskLevel
                ));

                if (
                    mlResult.RiskLevel == "High" ||
                    mlResult.RiskLevel == "Critical"
                )
                {
                    var activeIncident = await db.Incidents
                        .Where(i =>
                            i.AssetId == reading.AssetId &&
                            (i.Status == "Open" ||
                             i.Status == "Under Review") &&
                            (i.Severity == "High" ||
                             i.Severity == "Critical"))
                        .OrderByDescending(i => i.CreatedAt)
                        .FirstOrDefaultAsync(stoppingToken);

                    if (activeIncident is null)
                    {
                        var incident = new Incident
                        {
                            AssetId = reading.AssetId,
                            FailurePredictionId = prediction.Id,
                            Title =
                                $"{mlResult.RiskLevel} failure risk detected",
                            Severity = mlResult.RiskLevel,
                            Status = "Open",
                            Description =
                                $"XGBoost detected a " +
                                $"{mlResult.FailureProbability:P2} " +
                                $"failure probability for asset " +
                                $"{reading.AssetId}.",
                            CreatedAt = DateTime.UtcNow
                        };

                        db.Incidents.Add(incident);
                        await db.SaveChangesAsync(stoppingToken);

                        _logger.LogWarning(
                            "Automatic incident created. " +
                            "Incident={IncidentId}, Asset={AssetId}, Severity={Severity}",
                            incident.Id,
                            reading.AssetId,
                            incident.Severity
                        );

                        _liveEvents.Publish(new LivePipelineEvent(
                            "INCIDENT",
                            $"{incident.Severity} incident #{incident.Id} generated",
                            incident.Severity == "Critical"
                                ? "CRITICAL"
                                : "INCIDENT",
                            DateTime.UtcNow,
                            reading.AssetId,
                            mlResult.FailureProbability,
                            mlResult.RiskLevel
                        ));
                    }
                    else
                    {
                        _logger.LogInformation(
                            "Duplicate incident suppressed. " +
                            "Asset={AssetId}, ExistingIncident={IncidentId}, " +
                            "Status={Status}, Severity={Severity}",
                            reading.AssetId,
                            activeIncident.Id,
                            activeIncident.Status,
                            activeIncident.Severity
                        );

                        _liveEvents.Publish(new LivePipelineEvent(
                            "INCIDENT",
                            $"Existing incident #{activeIncident.Id} retained — duplicate suppressed",
                            "INCIDENT",
                            DateTime.UtcNow,
                            reading.AssetId,
                            mlResult.FailureProbability,
                            mlResult.RiskLevel
                        ));
                    }
                }

                var redis = scope.ServiceProvider
                    .GetRequiredService<IConnectionMultiplexer>();

                var cache = redis.GetDatabase();

                var cacheValue = JsonSerializer.Serialize(new
                {
                    assetId = reading.AssetId,
                    sensorReadingId = reading.Id,
                    predictedFailure = mlResult.PredictedFailure,
                    failureProbability = mlResult.FailureProbability,
                    riskLevel = mlResult.RiskLevel,
                    predictionWindowHours = mlResult.PredictionWindowHours,
                    modelType = mlResult.ModelType,
                    topContributingFactors =
                        mlResult.TopContributingFactors,
                    predictedAt = prediction.PredictedAt
                });

                await cache.StringSetAsync(
                    $"asset:{reading.AssetId}:latest-prediction",
                    cacheValue,
                    TimeSpan.FromMinutes(30)
                );

                _logger.LogInformation(
                    "Redis cache updated for Asset={AssetId}.",
                    reading.AssetId
                );

                _logger.LogInformation(
                    "Kafka event processed. Asset={AssetId}, SensorReading={ReadingId}, Risk={RiskLevel}, Probability={Probability}",
                    reading.AssetId,
                    reading.Id,
                    mlResult.RiskLevel,
                    mlResult.FailureProbability
                );
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while processing Kafka sensor event."
                );

                await Task.Delay(2000, stoppingToken);
            }
        }

        consumer.Close();
    }
}
