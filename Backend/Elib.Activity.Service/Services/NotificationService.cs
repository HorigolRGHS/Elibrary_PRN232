using AutoMapper;
using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;
using Elib.Activity.Service.Repositories;
using MassTransit;
using Microsoft.AspNetCore.Http;
using SharedLibrary.Commons;
using SharedLibrary.Messages;
using System.Runtime.InteropServices;

namespace Elib.Activity.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationViewRepository _viewRepository;
        private readonly TimeZoneInfo _vietnamZone;
        private readonly IRequestClient<UserFullNamesRequest> _userFullNamesClient;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            INotificationRepository repository,
            INotificationViewRepository viewRepository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IRequestClient<UserFullNamesRequest> userFullNamesClient,
            ILogger<NotificationService> logger)
        {
            _repository = repository;
            _viewRepository = viewRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _userFullNamesClient = userFullNamesClient;
            _logger = logger;

            _vietnamZone = TimeZoneInfo.FindSystemTimeZoneById(
                RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                    ? "SE Asia Standard Time"
                    : "Asia/Ho_Chi_Minh"
            );
        }
        // ===============================================

        public IQueryable<NotificationDTO> AsQueryable()
        {

            var usernameClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.Name);
            string createdByName = usernameClaim?.Value ?? "Unknown User";

            var query = _repository.AsQueryable()
                .Select(n => new NotificationDTO
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    CreatedByName = createdByName,
                    CreatedDate = n.CreatedDate,
                    UpdatedDate = n.UpdatedDate,
                    ScheduledDate = n.ScheduledDate,
                    Type = n.Type,
                    Status = n.Status,
                    IsViewed = false,
                    ViewedDate = null
                });

            return query;
        }

        // ===============================================
        // GET ALL
        public async Task<ApiResponse<IEnumerable<NotificationDTO>>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<NotificationDTO>>(entities);


            var userIds = dtos
                .Where(d => d.CreatedBy.HasValue)
                .Select(d => d.CreatedBy.Value)
                .Distinct()
                .ToList();

            if (userIds.Any())
            {
                try
                {
                    // Gửi request lấy tên đầy đủ qua RabbitMQ
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
                }
                catch (RequestTimeoutException ex)
                {
                    _logger.LogWarning(ex, "RabbitMQ timeout while fetching user names for notifications");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch user names via RabbitMQ for notifications");
                }
            }

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

            // 🔹 Lấy userId từ token
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                entity.CreatedBy = userId;
            }

            entity.CreatedDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamZone);
            entity.Status = "Pending";

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            var result = _mapper.Map<NotificationDTO>(entity);
            return ApiResponse<NotificationDTO>.Ok(result, "Notification created successfully.");
        }

        //========================================
        // CREATE CUSTOM
        public async Task<ApiResponse<NotificationDTO>> CreateCustomAsync(NotificationCreateCustomDTO dto)
        {
            var vnNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamZone);

            var entity = new Notification
            {
                Title = dto.Title,
                Content = dto.Content,
                ScheduledDate = dto.ScheduledDate,
                Type = "Custom",
                Status = "Pending",
                CreatedDate = vnNow
            };


            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId))
            {
                entity.CreatedBy = userId;
            }

            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();

            foreach (var uid in dto.RecipientUserIds.Distinct())
            {
                var nv = new NotificationView
                {
                    NotificationId = entity.NotificationId,
                    ViewedBy = uid,
                    Viewed = false,
                    CreatedDate = vnNow
                };
                await _viewRepository.AddAsync(nv);
            }
            await _viewRepository.SaveChangesAsync();

            var result = _mapper.Map<NotificationDTO>(entity);
            return ApiResponse<NotificationDTO>.Ok(result, "Custom notification created successfully.");
        }

        // ===============================================
        // UPDATE
        public async Task<ApiResponse<NotificationDTO>> UpdateAsync(NotificationUpdateDTO dto)
        {
            var entity = await _repository.GetByIdAsync(dto.NotificationId);
            if (entity == null)
                return ApiResponse<NotificationDTO>.Fail("Notification not found");

            _mapper.Map(dto, entity);
            entity.UpdatedDate = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamZone);
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

            var vnNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamZone);

            var view = await _viewRepository.GetByUserAsync(notificationId, userId);
            if (view == null)
            {
                view = new NotificationView
                {
                    NotificationId = notificationId,
                    ViewedBy = userId,
                    Viewed = true,
                    CreatedDate = vnNow,
                    ViewedDate = vnNow
                };
                await _viewRepository.AddAsync(view);
            }
            else if (!view.Viewed)
            {
                view.Viewed = true;
                view.ViewedDate = vnNow;
                await _viewRepository.UpdateAsync(view);
            }

            await _viewRepository.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Notification marked as viewed.");
        }

        //========================================
        // Get me 
        public IQueryable<NotificationDTO> AsQueryableForCurrentUser()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.Role);

            int userId = -1;
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out var uid)) userId = uid;
            var role = roleClaim?.Value ?? string.Empty;


            var userViews = _viewRepository.AsQueryable().Where(v => v.ViewedBy == userId);


            var query =
                from n in _repository.AsQueryable()
                join v in userViews on n.NotificationId equals v.NotificationId into g
                from v in g.DefaultIfEmpty()
                where

                    (n.Type == "System")
                    || (n.Type == "Customer" && (role == "Customer" || role == "Admin"))
                    || (n.Type == "Custom" && v != null)
                orderby n.CreatedDate descending
                select new NotificationDTO
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Content = n.Content,
                    CreatedBy = n.CreatedBy,
                    CreatedDate = n.CreatedDate,
                    UpdatedDate = n.UpdatedDate,
                    ScheduledDate = n.ScheduledDate,
                    Type = n.Type,
                    Status = n.Status,
                    IsViewed = v != null && v.Viewed,
                    ViewedDate = v != null ? v.ViewedDate : null
                };

            return query;
        }


        public IQueryable<int> GetCustomIdsForUser(int userId)
        {
            if (userId <= 0) return Enumerable.Empty<int>().AsQueryable();
            return _viewRepository.AsQueryable()
                .Where(v => v.ViewedBy == userId)
                .Select(v => v.NotificationId);
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