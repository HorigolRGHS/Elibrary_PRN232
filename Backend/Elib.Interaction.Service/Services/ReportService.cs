using AutoMapper;
using Elib.Interaction.Service.DTOs.Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using SharedLibrary.Commons;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Interaction.Service.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPublishEndpoint _publishEndpoint;

        public ReportService(IReportRepository repository, IMapper mapper, IHttpContextAccessor httpContextAccessor, IPublishEndpoint publishEndpoint)
        {
            _repository = repository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _publishEndpoint = publishEndpoint;
        }

        // ===============================================
        // OData Query
        public IQueryable<ReportDTO> AsQueryable()
        {
            var query = _repository.AsQueryable()
                .Select(r => new ReportDTO
                {
                    ReportId = r.ReportId,
                    DocumentId = r.DocumentId,
                    Reason = r.Reason,
                    CreatedDate = r.CreatedDate,
                    CreatedBy = r.CreatedBy,
                    Status = r.Status,
                    UpdatedDate = r.UpdatedDate
                });

            return query;
        }

        // ===============================================
        // GET ALL
        public async Task<ApiResponse<IEnumerable<ReportDTO>>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<ReportDTO>>(entities);
            return ApiResponse<IEnumerable<ReportDTO>>.Ok(dtos);
        }

        // ===============================================
        // GET BY ID
        public async Task<ApiResponse<ReportDTO>> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return ApiResponse<ReportDTO>.Fail("Report not found.");

            var dto = _mapper.Map<ReportDTO>(entity);
            return ApiResponse<ReportDTO>.Ok(dto);
        }

        // ===============================================
        // CREATE (UC10.1 - Report Document)
        public async Task<ApiResponse<ReportDTO>> CreateAsync(ReportCreateDTO dto)
        {
            var entity = _mapper.Map<Report>(dto);

            // Gán CreatedBy từ JWT token nếu có
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                entity.CreatedBy = userId;
            }

            entity.CreatedDate = DateTime.UtcNow;
            entity.Status = "Pending";

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<ReportDTO>(entity);
            return ApiResponse<ReportDTO>.Ok(result, "Report submitted successfully.");
        }

        // ===============================================
        // UPDATE (UC10.3 - Resolve Report)
        public async Task<ApiResponse<ReportDTO>> UpdateAsync(ReportUpdateDTO dto)
        {
            var entity = await _repository.GetByIdAsync(dto.ReportId);
            if (entity == null)
                return ApiResponse<ReportDTO>.Fail("Report not found.");

            _mapper.Map(dto, entity);
            entity.UpdatedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();

            // resolved → publish event
            if (dto.Status == "Resolved")
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                int.TryParse(userIdClaim?.Value, out var resolvedBy);

                var message = new ReportResolved(
                    entity.ReportId,
                    resolvedBy,
                    entity.Reason.Length > 80 ? entity.Reason[..80] + "..." : entity.Reason,
                    DateTime.UtcNow,
                    entity.CreatedBy ?? 0
                );

                Console.WriteLine($"[ReportService] 📨 Publishing ReportResolved event for ReportId={message.ReportId}");
                await _publishEndpoint.Publish(message);
            }

            var result = _mapper.Map<ReportDTO>(entity);
            return ApiResponse<ReportDTO>.Ok(result, "Report updated successfully.");
        }


        // ===============================================
        // DELETE
        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return ApiResponse<bool>.Fail("Report not found.");

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Report deleted successfully.");
        }

        // ===============================================
        // Not Implemented (for IBaseService compatibility)
        public Task<ApiResponse<ReportDTO>> CreateAsync(ReportDTO entity)
        {
            throw new NotImplementedException("Use CreateAsync(ReportCreateDTO dto) instead.");
        }

        public Task<ApiResponse<ReportDTO>> UpdateAsync(ReportDTO entity)
        {
            throw new NotImplementedException("Use UpdateAsync(ReportUpdateDTO dto) instead.");
        }
    }
}