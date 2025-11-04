using AutoMapper;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using SharedLibrary.Commons;
using MassTransit;
using SharedLibrary.Messages;
using System.Runtime.InteropServices;

namespace Elib.Interaction.Service.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IRequestClient<UserFullNamesRequest> _userFullNamesClient;
        private readonly ILogger<ReportService> _logger;

        public ReportService(
            IReportRepository repository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IPublishEndpoint publishEndpoint,
            IRequestClient<UserFullNamesRequest> userFullNamesClient,
            ILogger<ReportService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _publishEndpoint = publishEndpoint;
            _userFullNamesClient = userFullNamesClient;
            _logger = logger;
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

            var userIds = dtos
                .Where(r => r.CreatedBy.HasValue)
                .Select(r => r.CreatedBy.Value)
                .Distinct()
                .ToList();

            if (userIds.Any())
            {
                try
                {
                    var response = await _userFullNamesClient.GetResponse<UserFullNamesResponse>(
                        new UserFullNamesRequest(Guid.NewGuid(), userIds),
                        timeout: RequestTimeout.After(s: 3)
                    );

                    var userFullNames = response.Message.UserFullNames;

                    foreach (var dto in dtos)
                    {
                        if (dto.CreatedBy.HasValue &&
                            userFullNames.TryGetValue(dto.CreatedBy.Value, out var fullName))
                        {
                            dto.CreatedByName = fullName;
                        }
                        else
                        {
                            dto.CreatedByName ??= "Unknown";
                        }
                    }

                    _logger.LogDebug("Successfully enriched {Count} reports with user names", dtos.Count());
                }
                catch (RequestTimeoutException ex)
                {
                    _logger.LogWarning(ex, "RabbitMQ timeout while fetching user names for reports");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch user names via RabbitMQ for reports");
                }
            }

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

     
            if (dto.Status == "Resolved")
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                int.TryParse(userIdClaim?.Value, out var resolvedBy);

                var vietnamZone = TimeZoneInfo.FindSystemTimeZoneById(
                    RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                        ? "SE Asia Standard Time"
                        : "Asia/Ho_Chi_Minh"
                );
                var vnNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vietnamZone);

                var message = new ReportResolved(
                    entity.ReportId,
                    resolvedBy,
                    entity.Reason.Length > 80 ? entity.Reason[..80] + "..." : entity.Reason,
                    vnNow, 
                    entity.CreatedBy ?? 0
                );

                Console.WriteLine($"[ReportService] 📨 Publishing ReportResolved event for ReportId={message.ReportId} at {vnNow:yyyy-MM-dd HH:mm:ss}");
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