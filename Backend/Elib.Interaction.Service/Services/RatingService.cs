using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Elib.Interaction.Service.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RatingService(IRatingRepository repo, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _repo = repo;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
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
            var principal = _httpContextAccessor.HttpContext?.User;
            var idClaim = principal?.FindFirst(ClaimTypes.NameIdentifier) ?? principal?.FindFirst("sub");
            if (idClaim == null || !int.TryParse(idClaim.Value, out var userId))
                throw new UnauthorizedAccessException("Unauthorized Access.");

            var existing = await _repo.Query()
                .FirstOrDefaultAsync(r => r.DocumentId == dto.DocumentId && r.CreatedBy == userId);

            if (existing != null)
            {
                // Update
                existing.StarRating = dto.StarRating;
                existing.Review = dto.Review;
                existing.UpdatedDate = DateTime.UtcNow;
                existing.CreatedBy = userId;

                _repo.Update(existing);
                await _repo.SaveChangesAsync();

                return _mapper.Map<RatingReadDTO>(existing);
            }

            // Create
            var entity = _mapper.Map<Rating>(dto);
            entity.CreatedBy = userId;
            entity.CreatedDate = DateTime.UtcNow;

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            return _mapper.Map<RatingReadDTO>(entity);
        }

        // UPDATE theo key
        public async Task<bool> UpdateAsync(int id, RatingUpdateDTO dto)
        {
            var principal = _httpContextAccessor.HttpContext?.User;
            var idClaim = principal?.FindFirst(ClaimTypes.NameIdentifier) ?? principal?.FindFirst("sub");
            int? userId = (idClaim != null && int.TryParse(idClaim.Value, out var uid)) ? uid : (int?)null;

            var entity = await _repo.GetByIdAsync(id);
            if (entity is null) return false;

            _mapper.Map(dto, entity);
            entity.UpdatedDate = DateTime.UtcNow;
            if (userId.HasValue) entity.CreatedBy = userId.Value;

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
