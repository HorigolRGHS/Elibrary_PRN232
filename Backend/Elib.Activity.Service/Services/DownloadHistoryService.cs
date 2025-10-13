    using Elib.Activity.Service.DTOs;
    using Elib.Activity.Service.Messaging.Clients;
    using Elib.Activity.Service.Repositories;
    using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;

    namespace Elib.Activity.Service.Services
    {
        public class DownloadHistoryService : IDownloadHistoryService
        {
            private readonly IDownloadHistoryRepository _repo;
            private readonly ICatalogClient _catalog;

            public DownloadHistoryService(IDownloadHistoryRepository repo, ICatalogClient catalog)
            {
                _repo = repo;
                _catalog = catalog;
            }
        public async Task<PagedResult<UserDownloadHistoryResponseDTO>> GetUserDownloadsAsync(
            int userId, int skip, int top, bool includeCount, CancellationToken ct = default)
        {
            if (top <= 0) top = 10;
            if (skip < 0) skip = 0;

            var pageSize = top;
            var page = (skip / pageSize) + 1;

            var baseQuery = _repo.QueryByUser(userId);

            var total = includeCount ? await baseQuery.CountAsync(ct) : 0;

            var pageRows = await baseQuery
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync(ct);

            var items = await Task.WhenAll(pageRows.Select(async r =>
            {
                var summary = await _catalog.GetDocumentSummaryAsync(r.DocumentId, ct);
                return new UserDownloadHistoryResponseDTO
                {
                    DocumentID = r.DocumentId,
                    DocumentTitle = summary?.DocumentTitle ?? "(unknown)",
                    SubjectName = summary?.SubjectName ?? string.Empty,
                    FileURL = summary?.FileURL ?? string.Empty,
                    DownloadedDate = r.DownloadedDate
                };
            }));

            return new PagedResult<UserDownloadHistoryResponseDTO>
            {
                Items = items,
                TotalCount = total,      
                Page = page,
                PageSize = pageSize
            };
        }


        public async Task RecordUserDownloadAsync(int documentId, int? userId, DateTime when, CancellationToken ct = default)
        {
            await _repo.RecordUserDownload(new Models.DownloadHistory
            {
                DocumentId = documentId,
                DownloadedBy = userId,
                DownloadedDate = when
            }, ct);
        }
    }
    }
