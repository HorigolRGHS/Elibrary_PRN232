using Elib.Interaction.Service.DTOs;
using SharedLibrary.Commons;

namespace Elib.Interaction.Service.Services
{
    public interface IStatisticService
    {
        Task<ApiResponse<int>> GetReportCountAsync(string? status = null, CancellationToken ct = default);
        Task<ApiResponse<List<TopRatingItemDTO>>> GetTopRatingsAsync(int take = 5, CancellationToken ct = default);
        Task<ApiResponse<StatisticDTO>> GetSummaryAsync(int top = 5, string? reportStatus = null, CancellationToken ct = default);
    }
}