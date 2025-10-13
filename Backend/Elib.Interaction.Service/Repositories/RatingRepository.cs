using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Elib.Interaction.Service.Repositories;

public class RatingRepository : IRatingRepository
{
    private readonly InteractionDb _db;
    public RatingRepository(InteractionDb db) => _db = db;

    public IQueryable<Rating> Query() => _db.Ratings.AsQueryable();

    public Task<Rating?> GetByIdAsync(int id)
        => _db.Ratings.FirstOrDefaultAsync(r => r.RatingId == id);

    public Task AddAsync(Rating entity) => _db.Ratings.AddAsync(entity).AsTask();

    public void Update(Rating entity) => _db.Ratings.Update(entity);

    public void Remove(Rating entity) => _db.Ratings.Remove(entity);

    public Task<bool> AnyAsync(Expression<Func<Rating, bool>> predicate)
        => _db.Ratings.AnyAsync(predicate);

    public Task<int> SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}
