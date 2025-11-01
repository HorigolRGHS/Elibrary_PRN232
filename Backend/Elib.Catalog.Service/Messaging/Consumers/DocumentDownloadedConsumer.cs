using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.Services;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Catalog.Service.Messaging.Consumers
{
    public class DocumentDownloadedConsumer : IConsumer<DocumentDownloaded>
    {
        private readonly IDocumentService _ser;
        private readonly ILogger<DocumentDownloadedConsumer> _logger;

        public DocumentDownloadedConsumer(IDocumentService ser, ILogger<DocumentDownloadedConsumer> logger)
        {
            _ser = ser;
            _logger = logger;
        }
        public async Task Consume(ConsumeContext<DocumentDownloaded> context)
        {
            var msg = context.Message;

            try
            {
                var result = await _ser.IncreaseDownload(msg.DocumentId);

                if (result.Success)
                {
                    _logger.LogInformation(
                        "[Catalog] Increased download for DocId={DocId} by UserId={UserId} (File={File}, At={AtUtc})",
                        msg.DocumentId, msg.UserId, msg.FileName, msg.DownloadedAt);
                }
                else
                {
                    _logger.LogWarning(
                        "[Catalog] Failed to increase download for DocId={DocId}. Reason={Reason}",
                        msg.DocumentId, result.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[Catalog] Error while increasing download for DocId={DocId}",
                    msg.DocumentId);
                // (tuỳ bạn) có thể ném lại để MassTransit retry theo policy
                throw;
            }
        }
    }
}
