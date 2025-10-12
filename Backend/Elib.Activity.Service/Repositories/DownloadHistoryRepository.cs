using Elib.Activity.Service.Models;
using Microsoft.EntityFrameworkCore;

namespace Elib.Activity.Service.Repositories
{
    public class DownloadHistoryRepository : IDownloadHistoryRepository
    {
        private readonly ActivityDb _context;
        public DownloadHistoryRepository(ActivityDb context)
        {
            _context = context;
        }

        public IQueryable<DownloadHistory> QueryByUser(int userId)
        {
            return _context.DownloadHistories
                           .AsNoTracking()
                           .Where(x => x.DownloadedBy == userId)
                           .OrderByDescending(x => x.DownloadedDate);
        }

        public async Task RecordUserDownload(DownloadHistory download, CancellationToken ct = default)
        {
            await _context.DownloadHistories.AddAsync(download, ct);
            await _context.SaveChangesAsync(ct);
        }

                public async Task<List<(int DocumentId, int Total, DateTime LastDownloadedDate)>> GetTopDownloadsAsync(
            int take,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken ct = default)
        {
            if (take <= 0) take = 5;

            var q = _context.DownloadHistories.AsNoTracking().AsQueryable();

            if (from.HasValue) q = q.Where(d => d.DownloadedDate >= from.Value);
            if (to.HasValue)   q = q.Where(d => d.DownloadedDate <  to.Value);

            var rows = await q
                .GroupBy(d => d.DocumentId)
                .Select(g => new
                {
                    DocumentId = g.Key,
                    Total = g.Count(),
                    LastDownloadedDate = g.Max(x => x.DownloadedDate)
                })
                .OrderByDescending(x => x.Total)
                .ThenByDescending(x => x.LastDownloadedDate)
                .Take(take)
                .ToListAsync(ct);

            return rows.Select(x => (x.DocumentId, x.Total, x.LastDownloadedDate)).ToList();
        }
    }
}
