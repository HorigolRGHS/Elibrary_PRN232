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
    }
}
