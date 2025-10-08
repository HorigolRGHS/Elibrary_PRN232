using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Activity.Service.Messaging.Clients
{
    public class CatalogClient : ICatalogClient
    {
        private readonly IRequestClient<GetDocumentSummary> _client;
        public CatalogClient(IRequestClient<GetDocumentSummary> client) => _client = client;
        public async Task<DocumentSummaryResult?> GetDocumentSummaryAsync(int documentId, CancellationToken ct = default)
        {
            var response = await _client.GetResponse<DocumentSummaryResult, DocumentSummaryNotFound>(
            new GetDocumentSummary(documentId), ct);

            if (response.Is(out Response<DocumentSummaryResult> ok))
                return ok.Message;

            return null; 
        }
    }
}
