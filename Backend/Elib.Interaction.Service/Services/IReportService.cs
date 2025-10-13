using Elib.Interaction.Service.DTOs.Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.DTOs;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Interaction.Service.Services
{
    public interface IReportService : IBaseService<ReportDTO>
    {
        IQueryable<ReportDTO> AsQueryable();
        Task<ApiResponse<ReportDTO>> CreateAsync(ReportCreateDTO dto);
        Task<ApiResponse<ReportDTO>> UpdateAsync(ReportUpdateDTO dto);
    }
}