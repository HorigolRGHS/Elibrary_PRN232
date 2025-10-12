using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;

namespace Elib.Activity.Service.Repositories
{
    public interface IDownloadHistoryRepository
    {
        IQueryable<DownloadHistory> QueryByUser(int userId);
        Task RecordUserDownload(DownloadHistory download, CancellationToken ct = default);

        Task<List<(int DocumentId, int Total, DateTime LastDownloadedDate)>> GetTopDownloadsAsync(
            int take,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken ct = default);
    }
}
