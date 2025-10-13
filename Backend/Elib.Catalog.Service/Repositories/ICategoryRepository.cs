using Elib.Catalog.Service.Models;
using SharedLibrary.Repositories;
using System.Linq.Expressions;

namespace Elib.Catalog.Service.Repositories
{
    public interface ICategoryRepository
    {
        IQueryable<Category> Query();
        Task<Category?> GetByIdAsync(int id);
        Task AddAsync(Category entity);
        void Update(Category entity);
        void Remove(Category entity);
        Task<bool> AnyAsync(Expression<Func<Category, bool>> predicate);
        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}
