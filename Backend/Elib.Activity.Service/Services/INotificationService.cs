using Elib.Activity.Service.DTOs;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Activity.Service.Services
{
    public interface INotificationService : IBaseService<NotificationDTO>
    {
        Task<ApiResponse<PagedResult<NotificationDTO>>> GetPagedAsync(NotificationFilterDTO filter);

        IQueryable<NotificationDTO> AsQueryable();
        IQueryable<NotificationDTO> AsQueryableForCurrentUser();
        Task<ApiResponse<NotificationDTO>> CreateAsync(NotificationCreateDTO dto);
        Task<ApiResponse<NotificationDTO>> UpdateAsync(NotificationUpdateDTO dto);

        Task<ApiResponse<NotificationDTO>> CreateCustomAsync(NotificationCreateCustomDTO dto);
        Task<ApiResponse<bool>> CheckUserViewedAsync(int notificationId);

        Task<ApiResponse<bool>> MarkAsViewedAsync(int notificationId);
    }
}
