using Elib.Catalog.Service.Models;
using SharedLibrary.Repositories;
using System.Linq.Expressions;

namespace Elib.Catalog.Service.Repositories
{
    public interface ISubjectRepository
    {
        Task<Subject?> GetByIdAsync(int id);
        Task<IEnumerable<Subject>> GetAllAsync();
        Task<IEnumerable<Subject>> FindAsync(Expression<Func<Subject, bool>> predicate);
        Task<Subject> AddAsync(Subject entity);
        Task UpdateAsync(Subject entity);
        Task DeleteAsync(Subject entity);
        Task<int> SaveChangesAsync();
    }
}
