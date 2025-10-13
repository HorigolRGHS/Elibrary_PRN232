using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Elib.Interaction.Service.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _repo;
        private readonly IMapper _mapper;

        public RatingService(IRatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public IQueryable<RatingReadDTO> QueryDto()
            => _repo.Query().AsNoTracking()
                     .ProjectTo<RatingReadDTO>(_mapper.ConfigurationProvider);

        public async Task<RatingReadDTO?> GetByIdAsync(int id)
        {
            var entity = await _repo.GetByIdAsync(id);
            return entity is null ? null : _mapper.Map<RatingReadDTO>(entity);
        }

        // CREATE
        public async Task<RatingReadDTO> CreateAsync(RatingCreateDTO dto)
        {
            // kiểm tra đã có rate chưa
            var existing = await _repo.Query()
                .FirstOrDefaultAsync(r => r.DocumentId == dto.DocumentId && r.CreatedBy == dto.CreatedBy);

            if (existing != null)
            {
                // Update
                existing.StarRating = dto.StarRating;
                existing.Review = dto.Review;
                existing.UpdatedDate = DateTime.UtcNow;

                _repo.Update(existing);
                await _repo.SaveChangesAsync();

                return _mapper.Map<RatingReadDTO>(existing);
            }

            // Create
            var entity = _mapper.Map<Rating>(dto);
            entity.CreatedDate = DateTime.UtcNow;

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            return _mapper.Map<RatingReadDTO>(entity);
        }

        // UPDATE theo key
        public async Task<bool> UpdateAsync(int id, RatingUpdateDTO dto)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return false;

            _mapper.Map(dto, entity);
            _repo.Update(entity);
            await _repo.SaveChangesAsync();
            return true;
        }

        // DELETE theo key
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
