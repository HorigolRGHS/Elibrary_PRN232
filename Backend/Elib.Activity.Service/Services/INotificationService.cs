using Elib.Activity.Service.DTOs;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Activity.Service.Services
{
    public interface INotificationService : IBaseService<NotificationDTO>
    {
        Task<ApiResponse<PagedResult<NotificationDTO>>> GetPagedAsync(NotificationFilterDTO filter);

        IQueryable<NotificationDTO> AsQueryable();

        Task<ApiResponse<NotificationDTO>> CreateAsync(NotificationCreateDTO dto);
        Task<ApiResponse<NotificationDTO>> UpdateAsync(NotificationUpdateDTO dto);
    }
}
