using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Repositories;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;
using MassTransit;
using SharedLibrary.Messages;
using Microsoft.Extensions.Logging;

namespace Elib.Catalog.Service.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _repository;
        private readonly IMapper _mapper;
        private readonly IRequestClient<UserFullNamesRequest> _userFullNamesClient;
        private readonly ILogger<DocumentService> _logger;

        public DocumentService(
            IDocumentRepository repository, 
            IMapper mapper,
            IRequestClient<UserFullNamesRequest> userFullNamesClient,
            ILogger<DocumentService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _userFullNamesClient = userFullNamesClient;
            _logger = logger;
        }

        public async Task<ApiResponse<string>> ApproveAsync(int id, ApproveDocumentDTO req, int userId)
        {
            if (req.Accept)
            {
                var ok = await _repository.ApproveAsync(id, userId);
                return ok
                    ? ApiResponse<string>.Ok("","Approved")
                    : ApiResponse<string>.Fail("Cannot approve: not found or not Pending");
            }
            else
            {
                var ok = await _repository.RejectAsync(id, userId, req.Reason);
                return ok
                    ? ApiResponse<string>.Ok("","Rejected")
                    : ApiResponse<string>.Fail("Cannot reject: not found or not Pending");
            }
        }

        public async Task<ApiResponse<string>> CreateAsync(CreateDocumentDTO entity, int userId, string? userRole)
        {
            var entityr = _mapper.Map<Document>(entity);

            entityr.CreatedBy = userId;
            entityr.CreatedDate = DateTime.UtcNow;
            
            if (string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                entityr.Status = "Accepted";
            }
            else
            {
                entityr.Status = "Pending";
            }

            await _repository.AddAsync(entityr);
            await _repository.SaveChangesAsync();

            return ApiResponse<string>.Ok(null, $"Created document successfully!");
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id, int userId, string? userRole)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null || existing.DeletedBy.HasValue)
                return ApiResponse<bool>.Fail("Document not found");

            if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                if (existing.CreatedBy != userId)
                    return ApiResponse<bool>.Fail("You do not have permission to delete this document. Only the creator or admin can delete it.");
            }

            existing.DeletedBy = userId;
            existing.DeletedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Document deleted successfully");
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

            if (dto == null)
                return ApiResponse<AdminDocumentItemDTO>.Fail("Not found");

            // Fetch user full names from Auth service via RabbitMQ
            var userIds = new List<int> { dto.CreatedBy };
            if (dto.DeletedBy.HasValue)
                userIds.Add(dto.DeletedBy.Value);

            try
            {
                var response = await _userFullNamesClient.GetResponse<UserFullNamesResponse>(
                    new UserFullNamesRequest(Guid.NewGuid(), userIds),
                    timeout: RequestTimeout.After(s: 3)
                );

                var userFullNames = response.Message.UserFullNames;
                
               if (userFullNames.TryGetValue(dto.CreatedBy, out var createdByName))
                    dto.CreatedByUsername = createdByName;
                
                if (dto.DeletedBy.HasValue && userFullNames.TryGetValue(dto.DeletedBy.Value, out var deletedByName))
                    dto.DeletedByUsername = deletedByName;
            }
            catch (RequestTimeoutException ex)
            {
                _logger.LogWarning(ex, 
                    "RabbitMQ timeout while fetching user names for document {DocumentId}. Returning data without user names.", 
                    id);
                // Continue without user names
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, 
                    "Failed to fetch user names via RabbitMQ for document {DocumentId}. Returning data without user names.", 
                    id);
                // Continue without user names
            }

            return ApiResponse<AdminDocumentItemDTO>.Ok(dto);
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

        public IQueryable<AdminDocumentListDTO> GetDocumentsForAdminQueryableAsync()
        {
            var q = _repository
                .GetAllQueryable()
                .ProjectTo<AdminDocumentListDTO>(_mapper.ConfigurationProvider);

            return q;
        }

        public Task<IQueryable<UserDocumentListDTO>> GetDocumentsForUserQueryableAsync()
        {
            var q = _repository
                .GetPublicDocumentsQueryable()
                .ProjectTo<UserDocumentListDTO>(_mapper.ConfigurationProvider);

            return Task.FromResult(q);
        }

        public async Task<ApiResponse<string>> IncreaseDownload(int id)
        {
            var doit = await _repository.IncreaseDownload(id);
            if (doit)
            {
                return ApiResponse<string>.Ok(null, "Count download successfully!");

            }
            return ApiResponse<string>.Fail("Count download failed!");

        }

        public async Task<ApiResponse<string>> IncreaseView(int id)
        {
            var doit = await _repository.IncreaseView(id);
            if (doit)
            {
                return ApiResponse<string>.Ok(null, "Count view successfully!");
            }
            return ApiResponse<string>.Fail("Count view failed!");

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

        public async Task EnrichDocumentsWithUserNames(IEnumerable<AdminDocumentListDTO> documents)
        {
            if (documents == null || !documents.Any())
                return;

            // Collect all unique user IDs from documents (CreatedBy)
            var userIds = documents
                .Select(d => d.CreatedBy)
                .Distinct()
                .ToList();

            if (!userIds.Any())
                return;

            try
            {
                var response = await _userFullNamesClient.GetResponse<UserFullNamesResponse>(
                    new UserFullNamesRequest(Guid.NewGuid(), userIds),
                    timeout: RequestTimeout.After(s: 3)
                );

                var userFullNames = response.Message.UserFullNames;

                foreach (var doc in documents)
                {
                    if (userFullNames.TryGetValue(doc.CreatedBy, out var fullName))
                    {
                        doc.CreatedByFullname = fullName;
                    }
                }
                
                _logger.LogDebug("Successfully enriched {Count} documents with user names", documents.Count());
            }
            catch (RequestTimeoutException ex)
            {
                _logger.LogWarning(ex, 
                    "RabbitMQ timeout while fetching user names for {Count} documents. Returning data without user names.", 
                    documents.Count());
                // Continue without user names
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, 
                    "Failed to fetch user names via RabbitMQ for {Count} documents. Returning data without user names.", 
                    documents.Count());
                // Continue without user names
            }
        }
    }
}
