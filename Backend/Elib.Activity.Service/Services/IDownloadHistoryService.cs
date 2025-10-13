using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;
using SharedLibrary.Commons;

namespace Elib.Activity.Service.Services
{
    public interface IDownloadHistoryService
    {
        Task<PagedResult<UserDownloadHistoryResponseDTO>> GetUserDownloadsAsync(
            int userId, int skip, int top, bool includeCount, CancellationToken ct = default);

        Task RecordUserDownloadAsync(int documentId, int? userId, DateTime when, CancellationToken ct = default);
    }

}
