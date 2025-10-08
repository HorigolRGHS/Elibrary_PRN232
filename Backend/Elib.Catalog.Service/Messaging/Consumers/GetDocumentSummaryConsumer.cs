using Elib.Catalog.Service.Repositories;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Catalog.Service.Messaging.Consumers
{
    public class GetDocumentSummaryConsumer : IConsumer<GetDocumentSummary>
    {
        private readonly IDocumentRepository _docs;
        public GetDocumentSummaryConsumer(IDocumentRepository docs) => _docs = docs;
        public async Task Consume(ConsumeContext<GetDocumentSummary> context)
        {
            var dto = await _docs.GetDocumentSummaryAsync(context.Message.DocumentId);
            if (dto is null)
            {
                await context.RespondAsync(new DocumentSummaryNotFound(context.Message.DocumentId));
                return;
            }

            await context.RespondAsync(new DocumentSummaryResult(
                dto.DocumentID,
                dto.DocumentTitle,
                dto.SubjectName,
                dto.FileURL
            ));
        }
    }
}
