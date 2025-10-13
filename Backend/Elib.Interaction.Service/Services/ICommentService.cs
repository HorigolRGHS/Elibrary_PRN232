using Elib.Interaction.Service.DTOs.Comment;
using SharedLibrary.Commons;

namespace Elib.Interaction.Service.Services
{
    public interface ICommentService
    {
        Task<ApiResponse<IEnumerable<CommentListDTO>>> GetCommentsByDocumentIdAsync(int documentId);
        Task<ApiResponse<CommentReadDTO>> GetByIdAsync(int id);
        Task<ApiResponse<CommentReadDTO>> CreateAsync(CommentCreateDTO dto);
        Task<ApiResponse<CommentReadDTO>> UpdateAsync(int id, CommentUpdateDTO dto);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }
}
