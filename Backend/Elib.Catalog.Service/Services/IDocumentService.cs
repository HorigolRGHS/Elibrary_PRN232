using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Catalog.Service.Services
{
    public interface IDocumentService
    {
        Task<ApiResponse<IEnumerable<UserDocumentListDTO>>> GetAllAsync();
        Task<ApiResponse<UserDocumentItemDTO>> GetByIdAsync(int id);
        Task<ApiResponse<AdminDocumentItemDTO>> GetByIdAdminAsync(int id);
        Task<ApiResponse<string>> CreateAsync(CreateDocumentDTO entity, int userId);
        Task<ApiResponse<string>> UpdateAsync(int id, UpdateDocumentDTO entity);
        Task<ApiResponse<bool>> DeleteAsync(int id, int userId, string? userRole);
        Task<IQueryable<UserDocumentListDTO>> GetDocumentsForUserQueryableAsync();
        IQueryable<AdminDocumentListDTO> GetDocumentsForAdminQueryableAsync();
        Task<ApiResponse<string>> ApproveAsync(int id, ApproveDocumentDTO req, int userId);
        Task<ApiResponse<string>> IncreaseView(int id);
        Task<ApiResponse<string>> IncreaseDownload(int id);
        Task EnrichDocumentsWithUserNames(IEnumerable<AdminDocumentListDTO> documents);
    }
}
