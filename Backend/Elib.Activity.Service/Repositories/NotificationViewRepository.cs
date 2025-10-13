using Elib.Activity.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;

namespace Elib.Activity.Service.Repositories
{
    public class NotificationViewRepository : BaseRepository<NotificationView>, INotificationViewRepository
    {
        public NotificationViewRepository(DbContext context) : base(context) { }

        public async Task<NotificationView?> GetByUserAsync(int notificationId, int userId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(v => v.NotificationId == notificationId && v.ViewedBy == userId);
        }
        public IQueryable<NotificationView> AsQueryable() 
        {
            return _dbSet.AsQueryable();
        }
    }
}