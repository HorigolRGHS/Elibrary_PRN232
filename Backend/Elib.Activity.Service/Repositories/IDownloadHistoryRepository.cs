using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;

namespace Elib.Activity.Service.Repositories
{
    public interface IDownloadHistoryRepository
    {
        IQueryable<DownloadHistory> QueryByUser(int userId);
        Task RecordUserDownload(DownloadHistory download, CancellationToken ct = default);
    }
}
