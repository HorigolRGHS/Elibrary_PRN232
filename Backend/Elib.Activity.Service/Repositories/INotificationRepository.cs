using Elib.Activity.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Repositories;

namespace Elib.Activity.Service.Repositories
{
    public interface INotificationRepository : IBaseRepository<Notification>
    {
        Task<PagedResult<Notification>> GetPagedAsync(string? type, string? status, int page, int pageSize);

        IQueryable<Notification> AsQueryable();
    }
}