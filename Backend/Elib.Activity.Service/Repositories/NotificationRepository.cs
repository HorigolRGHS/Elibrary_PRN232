using Elib.Activity.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;
using SharedLibrary.Repositories;

namespace Elib.Activity.Service.Repositories
{
    public class NotificationRepository : BaseRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(DbContext context) : base(context) { }

  
        public async Task<PagedResult<Notification>> GetPagedAsync(string? type, string? status, int page, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(n => n.Type == type);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(n => n.Status == status);

            query = query.OrderByDescending(n => n.CreatedDate);

            return await query.ToPagedResultAsync(page, pageSize);
        }

        public IQueryable<Notification> AsQueryable()
        {
            return _dbSet.AsQueryable();
        }
    }
}
