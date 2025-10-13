using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Elib.Interaction.Service.Repositories
{
    public class StatisticRepository : IStatisticRepository
    {
        private readonly DbContextOptions<InteractionDb> _options;
        public StatisticRepository(DbContextOptions<InteractionDb> options) => _options = options;

        public async Task<int> GetReportCountAsync(string? status = null, CancellationToken ct = default)
        {
            await using var db = new InteractionDb(_options);   
            var q = db.Reports.AsNoTracking();
            if (!string.IsNullOrWhiteSpace(status))
                q = q.Where(r => r.Status == status);
            return await q.CountAsync(ct);
        }

        public async Task<List<TopRatingItemDTO>> GetTopRatingsAsync(int take = 5, CancellationToken ct = default)
        {
            if (take <= 0) take = 5;

            await using var db = new InteractionDb(_options); 
            return await db.Ratings.AsNoTracking()
                .GroupBy(r => r.DocumentId)
                .Select(g => new TopRatingItemDTO
                {
                    DocumentId = g.Key,
                    TotalRatings = g.Count(),
                    AvgRating = g.Average(x => (double)x.StarRating)
                })
                .OrderByDescending(x => x.TotalRatings)
                .ThenByDescending(x => x.AvgRating)
                .Take(take)
                .ToListAsync(ct);
        }
    }
}
