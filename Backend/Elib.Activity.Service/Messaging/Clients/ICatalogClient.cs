using SharedLibrary.Messages;

namespace Elib.Activity.Service.Messaging.Clients
{
    public interface ICatalogClient
    {
        Task<DocumentSummaryResult?> GetDocumentSummaryAsync(int documentId, CancellationToken ct = default);
    }
}
