using SharedLibrary.Commons;

namespace SharedLibrary.Services
{
    public interface IBaseService<T> where T : class
    {
        Task<ApiResponse<IEnumerable<T>>> GetAllAsync();
        Task<ApiResponse<T>> GetByIdAsync(int id);
        Task<ApiResponse<T>> CreateAsync(T entity);
        Task<ApiResponse<T>> UpdateAsync(T entity);
        Task<ApiResponse<bool>> DeleteAsync(int id);
    }
}
