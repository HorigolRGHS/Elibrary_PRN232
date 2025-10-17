using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;

namespace Elib.Catalog.Service.Repositories
{
    public class DocumentRepository : BaseRepository<Document>, IDocumentRepository
    {
        public DocumentRepository(CatalogDb context) : base(context) { }

        public async Task<PersonalDocumentSumaryDTO?> GetDocumentSummaryAsync(int documentId)
        {
            var doc = await _dbSet
                .Include(d => d.Subject)
                .AsNoTracking()
                .Where(d => d.DocumentId == documentId)
                .Select(d => new PersonalDocumentSumaryDTO
                {
                    DocumentID = d.DocumentId,
                    DocumentTitle = d.Title,
                    SubjectName = d.Subject != null ? d.Subject.SubjectName : null,
                    FileURL = d.FileUrl
                })
                .FirstOrDefaultAsync();
            return doc;
        }

        public IQueryable<Document> GetAllQueryable()
        {
            return _dbSet
                .Include(d => d.Category)
                .Include(d => d.Subject)
                .Where(d => !d.DeletedBy.HasValue)
                .AsQueryable();
        }

        public IQueryable<Document> GetPublicDocumentsQueryable()
        {
            return _dbSet
                .Include(d => d.Category)
                .Include(d => d.Subject)
                .Where(d => d.Status == "Accepted" && !d.DeletedBy.HasValue)
                .AsNoTracking();
        }

        public async Task<bool> ApproveAsync(int documentId, int approvedBy)
        {
            var entity = await _dbSet.FirstOrDefaultAsync(d =>
                d.DocumentId == documentId && !d.DeletedBy.HasValue);

            if (entity == null) return false;
            if (entity.Status != "Pending") return false;

            entity.Status = "Accepted";
            entity.UpdatedDate = DateTime.UtcNow;
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectAsync(int documentId, int rejectedBy, string? reason = null)
        {
            var entity = await _dbSet.FirstOrDefaultAsync(d =>
                d.DocumentId == documentId && !d.DeletedBy.HasValue);

            if (entity == null) return false;
            if (entity.Status != "Pending") return false;

            entity.Status = "Rejected";
            entity.UpdatedDate = DateTime.UtcNow;
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IncreaseView(int documentId, CancellationToken ct = default)
        {
            var rows = await _dbSet
        .Where(d => d.DocumentId == documentId
                 && d.DeletedBy == null
                 && d.Status == "Accepted")
        .ExecuteUpdateAsync(s => s
            .SetProperty(d => d.ViewCount, d => d.ViewCount + 1)
            .SetProperty(d => d.UpdatedDate, _ => DateTime.UtcNow),
            ct);

            return rows > 0;
        }

        public async Task<bool> IncreaseDownload(int documentId, CancellationToken ct = default)
        {
            var rows = await _dbSet
                .Where(d => d.DocumentId == documentId
                         && d.DeletedBy == null
                         && d.Status == "Accepted")
                .ExecuteUpdateAsync(s => s
                    .SetProperty(d => d.DownloadCount, d => d.DownloadCount + 1)
                    .SetProperty(d => d.UpdatedDate, _ => DateTime.UtcNow),
                    ct);

            return rows > 0;
        }
    }
}
