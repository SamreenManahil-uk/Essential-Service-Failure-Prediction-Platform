using System.Net.Http.Json;
using EssentialService.Api.DTOs;

namespace EssentialService.Api.Services;

public class MlPredictionService
{
    private readonly HttpClient _httpClient;

    public MlPredictionService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<MlPredictionResponse?> PredictAsync(
        MlPredictionRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "predict",
            request
        );

        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<MlPredictionResponse>();
    }
}
