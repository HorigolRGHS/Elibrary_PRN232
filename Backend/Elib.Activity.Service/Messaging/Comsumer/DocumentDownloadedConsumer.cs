using Elib.Activity.Service.Services;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Activity.Service.Messaging.Comsumer
{
    public class DocumentDownloadedConsumer : IConsumer<DocumentDownloaded>
    {
        private readonly IDownloadHistoryService _history;
        private readonly ILogger<DocumentDownloadedConsumer> _logger;

        public DocumentDownloadedConsumer(
            IDownloadHistoryService history,
            ILogger<DocumentDownloadedConsumer> logger)
        {
            _history = history;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<DocumentDownloaded> context)
        {
            var m = context.Message;

            var userId = m.UserId;

            try
            {
                await _history.RecordUserDownloadAsync(
                    documentId: m.DocumentId,
                    userId: userId,
                    when: m.DownloadedAt,
                    CancellationToken.None
                );

                _logger.LogInformation(
                    "[DownloadLogged] DocId={DocId} UserId={UserId} File={File} At={AtUtc}",
                    m.DocumentId, userId, m.FileName, m.DownloadedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to record download. DocId={DocId} UserId={UserId} File={File}",
                    m.DocumentId, userId, m.FileName);

                throw;
            }
        }
    }
}
