using Elib.Interaction.Service.Models;
using System.Linq.Expressions;

namespace Elib.Interaction.Service.Repositories
{
    public interface IRatingRepository
    {
        IQueryable<Rating> Query();
        Task<Rating?> GetByIdAsync(int id);
        Task AddAsync(Rating entity);
        void Update(Rating entity);
        void Remove(Rating entity);
        Task<bool> AnyAsync(Expression<Func<Rating, bool>> predicate);
        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}
