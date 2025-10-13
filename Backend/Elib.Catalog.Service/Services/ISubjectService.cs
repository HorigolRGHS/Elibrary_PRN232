using Elib.Catalog.Service.DTOs;
using SharedLibrary.Commons;
using Elib.Catalog.Service.Models;

namespace Elib.Catalog.Service.Services
{
    public interface ISubjectService
    {
        Task<ApiResponse<IEnumerable<SubjectReadDTO>>> GetAllAsync();
        Task<ApiResponse<SubjectReadDTO>> GetByIdAsync(int id);
        Task<ApiResponse<SubjectReadDTO>> CreateAsync(SubjectCreateDTO entityDto);
        Task<ApiResponse<SubjectReadDTO>> UpdateAsync(int id, SubjectUpdateDTO entityDto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }
}