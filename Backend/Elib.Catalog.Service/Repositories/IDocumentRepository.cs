using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using SharedLibrary.Repositories;

namespace Elib.Catalog.Service.Repositories
{
    public interface IDocumentRepository : IBaseRepository<Document>
    {
        Task<PersonalDocumentSumaryDTO?> GetDocumentSummaryAsync(int documentId);
        IQueryable<Document> GetAllQueryable();
        IQueryable<Document> GetPublicDocumentsQueryable();
        Task<bool> ApproveAsync(int documentId, int approvedBy);
        Task<bool> RejectAsync(int documentId, int rejectedBy, string? reason = null);
    }
}
