using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Elib.Catalog.Service.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly CatalogDb _db;

        public CategoryRepository(CatalogDb db) => _db = db;

        public IQueryable<Category> Query() => _db.Categories.AsQueryable();

        public async Task<Category?> GetByIdAsync(int id)
            => await _db.Categories.FirstOrDefaultAsync(x => x.CategoryId == id);

        public async Task AddAsync(Category entity)
            => await _db.Categories.AddAsync(entity);

        public void Update(Category entity)
            => _db.Categories.Update(entity);

        public void Remove(Category entity)
            => _db.Categories.Remove(entity);

        public async Task<bool> AnyAsync(Expression<Func<Category, bool>> predicate)
            => await _db.Categories.AnyAsync(predicate);

        public Task<int> SaveChangesAsync(CancellationToken ct = default)
            => _db.SaveChangesAsync(ct);
    }
}
