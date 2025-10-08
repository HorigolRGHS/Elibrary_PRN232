using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Catalog.Service.Services
{
    public interface IDocumentService
    {
        Task<ApiResponse<IEnumerable<UserDocumentListDTO>>> GetAllAsync();
        Task<ApiResponse<IEnumerable<AdminDocumentListDTO>>> GetAllAdminAsync();
        Task<ApiResponse<UserDocumentItemDTO>> GetByIdAsync(int id);
        Task<ApiResponse<AdminDocumentItemDTO>> GetByIdAdminAsync(int id);
        Task<ApiResponse<string>> CreateAsync(CreateDocumentDTO entity);
        Task<ApiResponse<string>> UpdateAsync(int id, UpdateDocumentDTO entity);
        Task<ApiResponse<bool>> DeleteAsync(int id);
        Task<IQueryable<UserDocumentListDTO>> GetDocumentsForUserQueryableAsync();
        Task<IQueryable<AdminDocumentListDTO>> GetDocumentsForAdminQueryableAsync();
        Task<ApiResponse<string>> ApproveAsync(int id, ApproveDocumentDTO req);
    }
}
