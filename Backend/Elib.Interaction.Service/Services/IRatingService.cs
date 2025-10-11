using Elib.Interaction.Service.DTOs;

namespace Elib.Interaction.Service.Services
{
    public interface IRatingService
    {
        IQueryable<RatingReadDTO> QueryDto();
        Task<RatingReadDTO?> GetByIdAsync(int id);
        Task<RatingReadDTO> CreateAsync(RatingCreateDTO dto);
        Task<bool> UpdateAsync(int id, RatingUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
