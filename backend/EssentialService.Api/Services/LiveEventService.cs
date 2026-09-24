using System.Collections.Concurrent;
using System.Threading.Channels;

namespace EssentialService.Api.Services;

public record LivePipelineEvent(
    string Source,
    string Message,
    string Type,
    DateTime Timestamp,
    int? AssetId = null,
    double? FailureProbability = null,
    string? RiskLevel = null
);

public class LiveEventService
{
    private readonly ConcurrentDictionary<Guid, Channel<LivePipelineEvent>>
        _subscribers = new();

    public (Guid Id, ChannelReader<LivePipelineEvent> Reader) Subscribe()
    {
        var id = Guid.NewGuid();

        var channel =
            Channel.CreateUnbounded<LivePipelineEvent>();

        _subscribers[id] = channel;

        return (id, channel.Reader);
    }

    public void Unsubscribe(Guid id)
    {
        if (_subscribers.TryRemove(id, out var channel))
        {
            channel.Writer.TryComplete();
        }
    }

    public void Publish(LivePipelineEvent pipelineEvent)
    {
        foreach (var subscriber in _subscribers.Values)
        {
            subscriber.Writer.TryWrite(pipelineEvent);
        }
    }
}
