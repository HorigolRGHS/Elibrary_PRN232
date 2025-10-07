using Elib.Interaction.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;
using SharedLibrary.Repositories;

namespace Elib.Interaction.Service.Repositories
{
    public class ReportRepository : BaseRepository<Report>, IReportRepository
    {
        public ReportRepository(DbContext context) : base(context) { }

/*        public async Task<PagedResult<Report>> GetPagedAsync(string? status, int? documentId, int page, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            if (documentId.HasValue)
                query = query.Where(r => r.DocumentId == documentId.Value);

            query = query.OrderByDescending(r => r.CreatedDate);

            return await query.ToPagedResultAsync(page, pageSize);
        }*/

        public IQueryable<Report> AsQueryable()
        {
            return _dbSet.AsQueryable();
        }
    }
}