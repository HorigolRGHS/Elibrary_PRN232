using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Repositories;
using Humanizer;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;

namespace Elib.Catalog.Service.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _repository;
        private readonly IMapper _mapper;

        public DocumentService(IDocumentRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<string>> ApproveAsync(int id, ApproveDocumentDTO req)
        {
            if (req.Accept)
            {
                var ok = await _repository.ApproveAsync(id, req.ApprovedBy);
                return ok
                    ? ApiResponse<string>.Ok("Approved")
                    : ApiResponse<string>.Fail("Cannot approve: not found or not Pending");
            }
            else
            {
                var ok = await _repository.RejectAsync(id, req.ApprovedBy, req.Reason);
                return ok
                    ? ApiResponse<string>.Ok("Rejected")
                    : ApiResponse<string>.Fail("Cannot reject: not found or not Pending");
            }
        }

        public async Task<ApiResponse<string>> CreateAsync(CreateDocumentDTO entity)
        {
            var entityr = _mapper.Map<Document>(entity);

            await _repository.AddAsync(entityr);
            await _repository.SaveChangesAsync();

            return ApiResponse<string>.Ok($"Created document #{entityr.DocumentId}");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null || existing.DeletedBy.HasValue)
                return ApiResponse<bool>.Fail("Document not found");

            existing.DeletedBy = existing.CreatedBy; 
            existing.DeletedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true);
        }

        public async Task<ApiResponse<IEnumerable<AdminDocumentListDTO>>> GetAllAdminAsync()
        {
            var data = await _repository
                .GetAllQueryable()
                .ProjectTo<AdminDocumentListDTO>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return ApiResponse<IEnumerable<AdminDocumentListDTO>>.Ok(data);
        }

        public async Task<ApiResponse<IEnumerable<UserDocumentListDTO>>> GetAllAsync()
        {
            var data = await _repository
                .GetPublicDocumentsQueryable()
                .ProjectTo<UserDocumentListDTO>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return ApiResponse<IEnumerable<UserDocumentListDTO>>.Ok(data);
        }

        public async Task<ApiResponse<AdminDocumentItemDTO>> GetByIdAdminAsync(int id)
        {
            var dto = await _repository
                .GetAllQueryable()
                .Where(d => d.DocumentId == id)
                .ProjectTo<AdminDocumentItemDTO>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return dto != null
                ? ApiResponse<AdminDocumentItemDTO>.Ok(dto)
                : ApiResponse<AdminDocumentItemDTO>.Fail("Not found");
        }

        public async Task<ApiResponse<UserDocumentItemDTO>> GetByIdAsync(int id)
        {
            var dto = await _repository
                .GetPublicDocumentsQueryable()
                .Where(d => d.DocumentId == id)
                .ProjectTo<UserDocumentItemDTO>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            return dto != null
                ? ApiResponse<UserDocumentItemDTO>.Ok(dto)
                : ApiResponse<UserDocumentItemDTO>.Fail("Not found");
        }

        public Task<IQueryable<AdminDocumentListDTO>> GetDocumentsForAdminQueryableAsync()
        {
            var q = _repository
                .GetAllQueryable()
                .ProjectTo<AdminDocumentListDTO>(_mapper.ConfigurationProvider);

            return Task.FromResult(q);
        }

        public Task<IQueryable<UserDocumentListDTO>> GetDocumentsForUserQueryableAsync()
        {
            var q = _repository
                .GetPublicDocumentsQueryable()
                .ProjectTo<UserDocumentListDTO>(_mapper.ConfigurationProvider);

            return Task.FromResult(q);
        }

        public async Task<ApiResponse<string>> UpdateAsync(int id, UpdateDocumentDTO entity)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null || existing.DeletedBy.HasValue)
                return ApiResponse<string>.Fail("Document not found");

            var currentStatus = existing.Status;
            var createdBy = existing.CreatedBy;
            var createdDate = existing.CreatedDate;

            _mapper.Map(entity, existing);

            existing.Status = currentStatus;
            existing.CreatedBy = createdBy;
            existing.CreatedDate = createdDate;
            existing.UpdatedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();

            return ApiResponse<string>.Ok("Updated");
        }
    }
}
