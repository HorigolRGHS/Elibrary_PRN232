using Elib.Catalog.Service.DTOs;

namespace Elib.Catalog.Service.Services
{
    public interface ICategoryService
    {
        IQueryable<CategoryReadDTO> QueryDto();
        Task<CategoryReadDTO?> GetByIdAsync(int id);
        Task<CategoryReadDTO> CreateAsync(CategoryCreateDTO dto);
        Task<bool> UpdateAsync(int id, CategoryUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
