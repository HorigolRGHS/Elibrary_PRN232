using System;
using System.Linq;
using System.Threading.Tasks;
using Elib.Catalog.Service.Data;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SharedLibrary.Messages;

namespace Elib.Catalog.Service.Messaging.Consumers
{
    public class TopDownloadsRequestConsumer : IConsumer<TopDownloadsRequest>
    {
        private readonly CatalogDb _db;
        private readonly ILogger<TopDownloadsRequestConsumer> _logger;

        public TopDownloadsRequestConsumer(CatalogDb db, ILogger<TopDownloadsRequestConsumer> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<TopDownloadsRequest> context)
        {
            try
            {
                var msg = context.Message;
                _logger.LogInformation("[TopDownloadsRequestConsumer] Received request {RequestId}", msg.RequestId);

    
                var items = await _db.Documents
                    .Where(d => !d.DeletedBy.HasValue && d.Status == "Accepted")
                    .OrderByDescending(d => d.DownloadCount)
                    .Take(msg.Take)
                    .Select(d => new TopDownloadsItem(
                        d.DocumentId,
                        d.DownloadCount,
                        DateTime.UtcNow 
                    ))
                    .ToListAsync();

                var response = new TopDownloadsResponse(msg.RequestId, items);

                await context.RespondAsync(response);
                _logger.LogInformation("[TopDownloadsRequestConsumer] Responded {Count} items", items.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[TopDownloadsRequestConsumer] Error while handling request: {Message}", ex.Message);
                throw;
            }
        }
    }
}
