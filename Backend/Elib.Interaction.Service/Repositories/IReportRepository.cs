using Elib.Interaction.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Repositories;

namespace Elib.Interaction.Service.Repositories
{
    public interface IReportRepository : IBaseRepository<Report>
    {
    // Task<PagedResult<Report>> GetPagedAsync(string? status, int? documentId, int page, int pageSize);

        IQueryable<Report> AsQueryable();
    }
}