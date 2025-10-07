using Elib.Activity.Service.DTOs;
using SharedLibrary.Commons;
using SharedLibrary.Services;

namespace Elib.Activity.Service.Services
{
    public interface INotificationService : IBaseService<NotificationDTO>
    {
        Task<ApiResponse<PagedResult<NotificationDTO>>> GetPagedAsync(NotificationFilterDTO filter);
        Task<ApiResponse<NotificationDTO>> CreateAsync(CreateNotificationDTO dto);
        Task<ApiResponse<NotificationDTO>> UpdateAsync(UpdateNotificationDTO dto);
    }
}
