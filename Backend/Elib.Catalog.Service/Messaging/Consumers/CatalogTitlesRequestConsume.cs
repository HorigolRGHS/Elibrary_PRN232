using Elib.Catalog.Service.Data;
using MassTransit;
using SharedLibrary.Messages;
using Microsoft.EntityFrameworkCore;

namespace Elib.Catalog.Service.Messaging.Consumers
{
    public class CatalogTitlesRequestConsumer : IConsumer<CatalogTitlesRequest>
    {
        private readonly CatalogDb _db;
        public CatalogTitlesRequestConsumer(CatalogDb db) => _db = db;

        public async Task Consume(ConsumeContext<CatalogTitlesRequest> context)
        {
            var ids = context.Message.DocumentIds?.Distinct().ToList() ?? new List<int>();

            var items = await _db.Documents.AsNoTracking()
                .Where(d => ids.Contains(d.DocumentId))
                .Select(d => new TitlePair(d.DocumentId, d.Title))
                .ToListAsync();

            await context.RespondAsync(new CatalogTitlesResponse(context.Message.RequestId, items));
        }
    }
}