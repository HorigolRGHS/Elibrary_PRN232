using Elib.Activity.Service.Models;
using SharedLibrary.Repositories;

namespace Elib.Activity.Service.Repositories
{
    public interface INotificationViewRepository : IBaseRepository<NotificationView>
    {
        Task<NotificationView?> GetByUserAsync(int notificationId, int userId);

        IQueryable<NotificationView> AsQueryable();
    }
}
