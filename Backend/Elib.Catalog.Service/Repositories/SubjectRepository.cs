using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;
using System.Linq.Expressions;
using System.Linq;


namespace Elib.Catalog.Service.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly CatalogDb _dbSet;

        public SubjectRepository(CatalogDb db) => _dbSet = db;

        public async Task<Subject?> GetByIdAsync(int id) => await _dbSet.Subjects.Include(s => s.Documents).FirstOrDefaultAsync(s => s.SubjectId == id);

        public async Task<IEnumerable<Subject>> GetAllAsync() => await _dbSet.Subjects.Include(s => s.Documents).ToListAsync();

        public IQueryable<Subject> GetAllQueryable() => _dbSet.Subjects.Include(s => s.Documents).AsQueryable();

        public async Task<IEnumerable<Subject>> FindAsync(Expression<Func<Subject, bool>> predicate)
            => await _dbSet.Subjects.Where(predicate).ToListAsync();

        public async Task<Subject> AddAsync(Subject entity)
        {
            await _dbSet.AddAsync(entity);
            return entity;
        }

        public async Task UpdateAsync(Subject entity)
        {
            _dbSet.Update(entity);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Subject entity)
        {
            _dbSet.Remove(entity);
            await Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync() => await _dbSet.SaveChangesAsync();
    }
}
