using System.Text.Json;
using EssentialService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EssentialService.Api.Controllers;

[ApiController]
[Route("api/live-events")]
[Authorize]
public class LiveEventsController : ControllerBase
{
    private readonly LiveEventService _events;

    public LiveEventsController(LiveEventService events)
    {
        _events = events;
    }

    [HttpGet("stream")]
    public async Task Stream(CancellationToken cancellationToken)
    {
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        Response.ContentType = "text/event-stream";

        var subscription = _events.Subscribe();

        try
        {
            await Response.WriteAsync(
                "event: connected\n" +
                "data: {\"status\":\"connected\"}\n\n",
                cancellationToken
            );

            await Response.Body.FlushAsync(cancellationToken);

            await foreach (
                var pipelineEvent in
                subscription.Reader.ReadAllAsync(cancellationToken)
            )
            {
                var json = JsonSerializer.Serialize(
                    pipelineEvent,
                    new JsonSerializerOptions
                    {
                        PropertyNamingPolicy =
                            JsonNamingPolicy.CamelCase
                    }
                );

                await Response.WriteAsync(
                    $"data: {json}\n\n",
                    cancellationToken
                );

                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Browser disconnected.
        }
        finally
        {
            _events.Unsubscribe(subscription.Id);
        }
    }
}
