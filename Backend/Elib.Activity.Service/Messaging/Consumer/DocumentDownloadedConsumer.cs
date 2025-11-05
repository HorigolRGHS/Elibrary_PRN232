using Elib.Activity.Service.Services;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Activity.Service.Messaging.Consumer
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

            // Validate message
            if (m.DocumentId <= 0)
            {
                _logger.LogWarning(
                    "[DownloadSkipped] Invalid DocumentId={DocId}. Skipping.",
                    m.DocumentId);
                return;
            }

            // Skip if anonymous user
            if (m.UserId <= 0)
            {
                _logger.LogDebug(
                    "[DownloadSkipped] Anonymous download for DocId={DocId}. Not recording.",
                    m.DocumentId);
                return;
            }

            try
            {
                await _history.RecordUserDownloadAsync(
                    documentId: m.DocumentId,
                    userId: m.UserId,
                    when: m.DownloadedAt,
                    CancellationToken.None
                );

                _logger.LogInformation(
                    "[DownloadLogged] First download recorded: DocId={DocId} UserId={UserId} File={File} At={AtUtc}",
                    m.DocumentId, m.UserId, m.FileName, m.DownloadedAt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[DownloadLogFailed] DocId={DocId} UserId={UserId} File={File}. Will retry if configured.",
                    m.DocumentId, m.UserId, m.FileName);

                // Re-throw to trigger RabbitMQ retry/dead-letter queue
                throw;
            }
        }
    }
}
