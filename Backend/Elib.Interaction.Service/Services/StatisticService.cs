using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Repositories;
using MassTransit;
using SharedLibrary.Messages;
using SharedLibrary.Commons;

namespace Elib.Interaction.Service.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IStatisticRepository _repo;
        private readonly IRequestClient<CatalogTitlesRequest> _titlesClient;
        private readonly IRequestClient<CatalogCountersRequest> _countersClient;
        private readonly IRequestClient<UserCountersRequest> _userCountersClient;
        private readonly IRequestClient<TopDownloadsRequest> _topDownloadsClient;

        public StatisticService(
            IStatisticRepository repo,
            IRequestClient<CatalogTitlesRequest> titlesClient,
            IRequestClient<CatalogCountersRequest> countersClient,
            IRequestClient<UserCountersRequest> userCountersClient,
            IRequestClient<TopDownloadsRequest> topDownloadsClient)
        {
            _repo = repo;
            _titlesClient = titlesClient;
            _countersClient = countersClient;
            _userCountersClient = userCountersClient;
            _topDownloadsClient = topDownloadsClient;
        }

        public async Task<ApiResponse<int>> GetReportCountAsync(string? status = null, CancellationToken ct = default)
            => ApiResponse<int>.Ok(await _repo.GetReportCountAsync(status, ct));

        public async Task<ApiResponse<List<TopRatingItemDTO>>> GetTopRatingsAsync(int take = 5, CancellationToken ct = default)
        {
            var items = await _repo.GetTopRatingsAsync(take, ct);

            // MQ: map DocumentId -> Title 
            var ids = items.Select(x => x.DocumentId).Distinct().ToList();
            if (ids.Count > 0)
            {
                var reqId = Guid.NewGuid();
                var response = await _titlesClient.GetResponse<CatalogTitlesResponse>(
                    new CatalogTitlesRequest(reqId, ids), ct);

                var dict = response.Message.Items.ToDictionary(x => x.DocumentId, x => x.Title);
                foreach (var it in items)
                    if (dict.TryGetValue(it.DocumentId, out var title))
                        it.DocumentTitle = title;
            }

            return ApiResponse<List<TopRatingItemDTO>>.Ok(items);
        }

        public async Task<ApiResponse<StatisticDTO>> GetSummaryAsync(int top = 5, string? reportStatus = null, CancellationToken ct = default)
        {
            var reportCountTask = _repo.GetReportCountAsync(reportStatus, ct);
            var topRatingsTask = _repo.GetTopRatingsAsync(top, ct);

            var countersTask = _countersClient.GetResponse<CatalogCountersResponse>(
                                      new CatalogCountersRequest(Guid.NewGuid()), ct);

            var usersTask = _userCountersClient.GetResponse<UserCountersResponse>(
                                      new UserCountersRequest(Guid.NewGuid()), ct);

            var topDownloadsTask = _topDownloadsClient.GetResponse<TopDownloadsResponse>(
                                      new TopDownloadsRequest(Guid.NewGuid(), top, null, null), ct);

          
            await Task.WhenAll(reportCountTask, topRatingsTask, countersTask, usersTask, topDownloadsTask);

            // Map TopRatings
            var ratings = topRatingsTask.Result;

            // Map TopDownloads 
            var downloadsMsg = topDownloadsTask.Result.Message;
            var downloads = (downloadsMsg?.Items ?? new List<TopDownloadsItem>())
                .Select(x => new TopDownloadedItemDTO
                {
                    DocumentId = x.DocumentId,
                    TotalDownloads = x.TotalDownloads,
                    LastDownloadedDate = x.LastDownloadedDate
                })
                .ToList();

 
            var idsNeedTitle = ratings.Select(r => r.DocumentId)
                                      .Concat(downloads.Select(d => d.DocumentId))
                                      .Distinct()
                                      .ToList();

            if (idsNeedTitle.Count > 0)
            {
                var titlesResp = await _titlesClient.GetResponse<CatalogTitlesResponse>(
                    new CatalogTitlesRequest(Guid.NewGuid(), idsNeedTitle), ct);

                var titleDict = titlesResp.Message.Items.ToDictionary(x => x.DocumentId, x => x.Title);

                foreach (var it in ratings)
                    if (titleDict.TryGetValue(it.DocumentId, out var t)) it.DocumentTitle = t;

                foreach (var d in downloads)
                    if (titleDict.TryGetValue(d.DocumentId, out var t)) d.DocumentTitle = t;
            }

            var c = countersTask.Result.Message;
            var u = usersTask.Result.Message;

            return ApiResponse<StatisticDTO>.Ok(new StatisticDTO
            {
                ReportCount = reportCountTask.Result,
                DocumentCount = c.TotalDocuments,
                SubjectCount = c.TotalSubjects,
                UserCount = u.TotalUsers,
                TopRatings = ratings,
                TopDownloads = downloads
            });
        }
    }
}