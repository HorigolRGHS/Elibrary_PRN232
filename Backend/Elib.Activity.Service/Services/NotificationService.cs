using AutoMapper;
using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;
using Elib.Activity.Service.Repositories;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Commons;

namespace Elib.Activity.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationViewRepository _viewRepository;

        public NotificationService(INotificationRepository repository, INotificationViewRepository viewRepository,  IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _viewRepository = viewRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }
        // ===============================================

        public IQueryable<NotificationDTO> AsQueryable()
        {
            var query = _repository.AsQueryable()
                .Select(n => new NotificationDTO
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    CreatedDate = n.CreatedDate,
                    UpdatedDate = n.UpdatedDate,
                    ScheduledDate = n.ScheduledDate,
                    Type = n.Type,
                    Status = n.Status
                });

            return query;
        }

        // ===============================================
        // GET ALL
        public async Task<ApiResponse<IEnumerable<NotificationDTO>>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<NotificationDTO>>(entities);
            return ApiResponse<IEnumerable<NotificationDTO>>.Ok(dtos);
        }

        // ===============================================
        // GET BY ID
        public async Task<ApiResponse<NotificationDTO>> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return ApiResponse<NotificationDTO>.Fail("Notification not found");

            var dto = _mapper.Map<NotificationDTO>(entity);
            return ApiResponse<NotificationDTO>.Ok(dto);
        }

        // ===============================================
        // CREATE
        public async Task<ApiResponse<NotificationDTO>> CreateAsync(NotificationCreateDTO dto)
        {
            var entity = _mapper.Map<Notification>(dto);

            // CreatedBy == DTO 
            if (dto.CreatedBy.HasValue)
            {
                entity.CreatedBy = dto.CreatedBy.Value;
                Console.WriteLine($"[NotificationService] CreatedBy received from DTO: {dto.CreatedBy}");
            }
            else
            {
                // HttpContext 
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                {
                    entity.CreatedBy = userId;
                    Console.WriteLine($"[NotificationService] CreatedBy extracted from HttpContext: {userId}");
                }
                else
                {
                    Console.WriteLine($"[NotificationService] ⚠️ No CreatedBy found (DTO + HttpContext are null)");
                }
            }

            entity.CreatedDate = DateTime.UtcNow;

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<NotificationDTO>(entity);

            return ApiResponse<NotificationDTO>.Ok(result, "Notification scheduled successfully.");
        }

        //========================================
        // Create Custom 

        public async Task<ApiResponse<NotificationDTO>> CreateCustomAsync(NotificationCreateCustomDTO dto)
        {
            var entity = new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                ScheduledDate = dto.ScheduledDate,
                Type = "Custom",
                Status = "Pending",
                CreatedDate = DateTime.UtcNow
            };


            if (dto.CreatedBy.HasValue) entity.CreatedBy = dto.CreatedBy.Value;
            else
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
                    entity.CreatedBy = userId;
            }

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync(); 

            var now = DateTime.UtcNow;
            foreach (var uid in dto.RecipientUserIds.Distinct())
            {
                var nv = new NotificationView
                {
                    NotificationId = entity.NotificationId,
                    ViewedBy = uid,
                    Viewed = false,
                    CreatedDate = now,
                    ViewedDate = null
                };
                await _viewRepository.AddAsync(nv);
            }
            await _viewRepository.SaveChangesAsync();

            var result = _mapper.Map<NotificationDTO>(entity);
            return ApiResponse<NotificationDTO>.Ok(result, "Custom notification created and targeted recipients seeded.");
        }


        // ===============================================
        // UPDATE
        public async Task<ApiResponse<NotificationDTO>> UpdateAsync(NotificationUpdateDTO dto)
        {
            var entity = await _repository.GetByIdAsync(dto.NotificationId);
            if (entity == null)
                return ApiResponse<NotificationDTO>.Fail("Notification not found");

            _mapper.Map(dto, entity);
            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<NotificationDTO>(entity);
            return ApiResponse<NotificationDTO>.Ok(result, "Notification updated successfully.");
        }

        // ===============================================
        // DELETE
        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return ApiResponse<bool>.Fail("Notification not found");

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Notification deleted successfully.");
        }

        // ===============================================
        // GET PAGED 
        public async Task<ApiResponse<PagedResult<NotificationDTO>>> GetPagedAsync(NotificationFilterDTO filter)
        {
            var result = await _repository.GetPagedAsync(filter.Type, filter.Status, filter.Page, filter.PageSize);

            var dtoResult = new PagedResult<NotificationDTO>
            {
                Items = _mapper.Map<IEnumerable<NotificationDTO>>(result.Items),
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };

            return ApiResponse<PagedResult<NotificationDTO>>.Ok(dtoResult);
        }

        //=======================
        // Check View
        public async Task<ApiResponse<bool>> CheckUserViewedAsync(int notificationId)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return ApiResponse<bool>.Fail("User not authenticated.");


            var view = await _viewRepository.GetByUserAsync(notificationId, userId);

            bool viewed = view != null && view.Viewed;
            return ApiResponse<bool>.Ok(viewed, viewed ? "User has viewed this notification." : "User has not viewed this notification.");
        }

        public async Task<ApiResponse<bool>> MarkAsViewedAsync(int notificationId)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return ApiResponse<bool>.Fail("User not authenticated.");

            var view = await _viewRepository.GetByUserAsync(notificationId, userId);
            if (view == null)
            {
                view = new NotificationView
                {
                    NotificationId = notificationId,
                    ViewedBy = userId,
                    Viewed = true,
                    CreatedDate = DateTime.UtcNow,
                    ViewedDate = DateTime.UtcNow
                };
                await _viewRepository.AddAsync(view);
            }
            else if (!view.Viewed)
            {
                view.Viewed = true;
                view.ViewedDate = DateTime.UtcNow;
                await _viewRepository.UpdateAsync(view);
            }

            await _viewRepository.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Notification marked as viewed.");
        }

        //========================================
        // Get my 
        public IQueryable<NotificationDTO> AsQueryableForCurrentUser()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.Role);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                userId = -1; // anonymous safety
            var role = roleClaim?.Value ?? string.Empty;

            var customIdsForUser = _viewRepository.AsQueryable()
                .Where(v => v.ViewedBy == userId)
                .Select(v => v.NotificationId);

            var filtered = _repository.AsQueryable()
                .Where(n =>
                    n.Type == "System" ||
                    (n.Type == "Customer" && role == "Customer") ||
                    (n.Type == "Custom" && customIdsForUser.Contains(n.NotificationId))
                );

            return filtered
                .OrderByDescending(n => n.CreatedDate)
                .Select(n => new NotificationDTO
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    CreatedDate = n.CreatedDate,
                    UpdatedDate = n.UpdatedDate,
                    ScheduledDate = n.ScheduledDate,
                    Type = n.Type,
                    Status = n.Status
                });
        }

        public Task<ApiResponse<NotificationDTO>> CreateAsync(NotificationDTO entity)
        {
            throw new NotImplementedException("Use CreateAsync(CreateNotificationDTO dto) instead.");
        }

        public Task<ApiResponse<NotificationDTO>> UpdateAsync(NotificationDTO entity)
        {
            throw new NotImplementedException("Use UpdateAsync(UpdateNotificationDTO dto) instead.");
        }

    }
}