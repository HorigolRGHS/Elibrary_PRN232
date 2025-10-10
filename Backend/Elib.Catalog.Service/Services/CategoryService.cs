using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Elib.Catalog.Service.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public IQueryable<CategoryReadDTO> QueryDto()
            => _repo.Query().AsNoTracking()
                     .ProjectTo<CategoryReadDTO>(_mapper.ConfigurationProvider);

        public async Task<CategoryReadDTO?> GetByIdAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            return entity is null ? null : _mapper.Map<CategoryReadDTO>(entity);
        }

        public async Task<CategoryReadDTO> CreateAsync(CategoryCreateDTO dto)
        {
            var entity = _mapper.Map<Category>(dto);
            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();
            return _mapper.Map<CategoryReadDTO>(entity);
        }

        public async Task<bool> UpdateAsync(int id, CategoryUpdateDTO dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return false;

            _mapper.Map(dto, entity);
            _repo.Update(entity);
            await _repo.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return false;

            _repo.Remove(entity);
            await _repo.SaveChangesAsync();
            return true;
        }
    }
}
