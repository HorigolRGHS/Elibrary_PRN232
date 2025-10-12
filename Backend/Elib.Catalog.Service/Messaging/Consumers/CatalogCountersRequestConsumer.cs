using Elib.Catalog.Service.Data;
using MassTransit;
using SharedLibrary.Messages;
using Microsoft.EntityFrameworkCore;

namespace Elib.Catalog.Service.Messaging.Consumers
{
    public class CatalogCountersRequestConsumer : IConsumer<CatalogCountersRequest>
    {
        private readonly CatalogDb _db;
        public CatalogCountersRequestConsumer(CatalogDb db) => _db = db;

        public async Task Consume(ConsumeContext<CatalogCountersRequest> context)
        {
            var totalDocs = await _db.Documents.AsNoTracking().CountAsync();
            var totalSubjects = await _db.Subjects.AsNoTracking().CountAsync();

            await context.RespondAsync(
                new CatalogCountersResponse(context.Message.RequestId, totalDocs, totalSubjects)
            );
        }
    }
}