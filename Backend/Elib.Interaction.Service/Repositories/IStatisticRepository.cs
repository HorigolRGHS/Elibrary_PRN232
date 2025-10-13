using Elib.Interaction.Service.DTOs;

namespace Elib.Interaction.Service.Repositories
{
    public interface IStatisticRepository
    {
        Task<int> GetReportCountAsync(string? status = null, CancellationToken ct = default);
        Task<List<TopRatingItemDTO>> GetTopRatingsAsync(int take = 5, CancellationToken ct = default);
    }
}