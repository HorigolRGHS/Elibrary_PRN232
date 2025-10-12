using Elib.Activity.Service.Repositories;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Activity.Service.Consumers
{
    public class TopDownloadsRequestConsumer : IConsumer<TopDownloadsRequest>
    {
        private readonly IDownloadHistoryRepository _repo;

        public TopDownloadsRequestConsumer(IDownloadHistoryRepository repo)
        {
            _repo = repo;
        }

        public async Task Consume(ConsumeContext<TopDownloadsRequest> context)
        {
            var m = context.Message;

            var rows = await _repo.GetTopDownloadsAsync(
                take: m.Take <= 0 ? 5 : m.Take,
                from: m.From,
                to: m.To,
                context.CancellationToken);

            var items = rows.Select(x =>
                new TopDownloadsItem(x.DocumentId, x.Total, x.LastDownloadedDate)).ToList();

            await context.RespondAsync(new TopDownloadsResponse(m.RequestId, items));
        }
    }
}