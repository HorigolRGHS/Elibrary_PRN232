using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Elib.Activity.Service.Models;
using Elib.Activity.Service.Services;
using Elib.Activity.Service.DTOs;
using SharedLibrary.Commons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Elib.Activity.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationsController(
            INotificationService notificationService,
            IHttpContextAccessor httpContextAccessor)
        {
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/Notifications/odata?$filter=Type eq 'System'&$orderby=CreatedDate desc&$top=5&$skip=0&$count=true
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public IActionResult GetNotifications(
                           [FromQuery(Name = "$filter")] string? filter,
                           [FromQuery(Name = "$orderby")] string? orderby,
                           [FromQuery(Name = "$skip")] int? skip,
                           [FromQuery(Name = "$top")] int? top,
                           [FromQuery(Name = "$count")] bool? count)
        {
            var s = skip.GetValueOrDefault(0);
            var t = top.GetValueOrDefault(10);
            if (t <= 0) t = 10;
            if (s < 0) s = 0;

            var includeCount = count.GetValueOrDefault(true);


            IQueryable<NotificationDTO> query = _notificationService.AsQueryable();

            // Apply $filter 
            if (!string.IsNullOrWhiteSpace(filter))
            {
                query = ApplyODataFilter(query, filter);
            }

            // Get total 
            var total = includeCount ? query.Count() : (int?)null;

            // Apply $orderby 
            if (!string.IsNullOrWhiteSpace(orderby))
            {
                query = ApplyODataOrderBy(query, orderby);
            }
            else
            {
                query = query.OrderByDescending(n => n.CreatedDate);
            }

            // Apply paging
            query = query.Skip(s).Take(t);

            var items = query.ToList();


            var result = new
            {
                ODataCount = total,
                Skip = s,
                Top = t,
                Value = items
            };

            return Ok(ApiResponse<object>.Ok(result));
        }

        /// <summary>
        /// Simple OData $filter parser for common cases
        /// Supports: contains(tolower(field), 'value') and field eq 'value'
        /// </summary>
        private IQueryable<NotificationDTO> ApplyODataFilter(IQueryable<NotificationDTO> query, string filter)
        {
            // Split by " and "
            var conditions = filter.Split(" and ", StringSplitOptions.RemoveEmptyEntries);

            foreach (var condition in conditions)
            {
                var trimmed = condition.Trim();

                // Pattern: contains(tolower(FieldName), 'value')
                if (trimmed.StartsWith("contains(tolower("))
                {
                    // Extract field name and value
                    var match = System.Text.RegularExpressions.Regex.Match(trimmed, @"contains\(tolower\((\w+)\),\s*'([^']*)'\)");
                    if (match.Success)
                    {
                        var fieldName = match.Groups[1].Value;
                        var value = match.Groups[2].Value.Replace("''", "'"); // Unescape quotes

                        if (fieldName.Equals("Title", StringComparison.OrdinalIgnoreCase))
                        {
                            var valueLower = value.ToLower();
                            query = query.Where(n => n.Title.ToLower().Contains(valueLower));
                        }
                        else if (fieldName.Equals("Content", StringComparison.OrdinalIgnoreCase))
                        {
                            var valueLower = value.ToLower();
                            query = query.Where(n => n.Content.ToLower().Contains(valueLower));
                        }
                    }
                }
                // Pattern: FieldName eq 'value'
                else if (trimmed.Contains(" eq "))
                {
                    var parts = trimmed.Split(" eq ", StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2)
                    {
                        var fieldName = parts[0].Trim();
                        var value = parts[1].Trim().Trim('\''); // Remove quotes

                        if (fieldName.Equals("Type", StringComparison.OrdinalIgnoreCase))
                        {
                            query = query.Where(n => n.Type == value);
                        }
                        else if (fieldName.Equals("Status", StringComparison.OrdinalIgnoreCase))
                        {
                            query = query.Where(n => n.Status == value);
                        }
                    }
                }
            }

            return query;
        }

        /// <summary>
        /// Simple OData $orderby parser
        /// Supports: field asc|desc and multiple fields
        /// </summary>
        private IQueryable<NotificationDTO> ApplyODataOrderBy(IQueryable<NotificationDTO> query, string orderby)
        {
            // Split by comma for multiple sort fields
            var orderClauses = orderby.Split(",", StringSplitOptions.RemoveEmptyEntries);

            bool isFirst = true;
            foreach (var clause in orderClauses)
            {
                var parts = clause.Trim().Split(" ", StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 1) continue;

                var fieldName = parts[0];
                var direction = parts.Length > 1 ? parts[1].ToLower() : "asc";

                if (fieldName.Equals("CreatedDate", StringComparison.OrdinalIgnoreCase))
                {
                    query = isFirst
                        ? (direction == "desc" ? query.OrderByDescending(n => n.CreatedDate) : query.OrderBy(n => n.CreatedDate))
                        : (direction == "desc" ? ((IOrderedQueryable<NotificationDTO>)query).ThenByDescending(n => n.CreatedDate) : ((IOrderedQueryable<NotificationDTO>)query).ThenBy(n => n.CreatedDate));
                    isFirst = false;
                }
                else if (fieldName.Equals("Title", StringComparison.OrdinalIgnoreCase))
                {
                    query = isFirst
                        ? (direction == "desc" ? query.OrderByDescending(n => n.Title) : query.OrderBy(n => n.Title))
                        : (direction == "desc" ? ((IOrderedQueryable<NotificationDTO>)query).ThenByDescending(n => n.Title) : ((IOrderedQueryable<NotificationDTO>)query).ThenBy(n => n.Title));
                    isFirst = false;
                }
                else if (fieldName.Equals("Type", StringComparison.OrdinalIgnoreCase))
                {
                    query = isFirst
                        ? (direction == "desc" ? query.OrderByDescending(n => n.Type) : query.OrderBy(n => n.Type))
                        : (direction == "desc" ? ((IOrderedQueryable<NotificationDTO>)query).ThenByDescending(n => n.Type) : ((IOrderedQueryable<NotificationDTO>)query).ThenBy(n => n.Type));
                    isFirst = false;
                }
                else if (fieldName.Equals("Status", StringComparison.OrdinalIgnoreCase))
                {
                    query = isFirst
                        ? (direction == "desc" ? query.OrderByDescending(n => n.Status) : query.OrderBy(n => n.Status))
                        : (direction == "desc" ? ((IOrderedQueryable<NotificationDTO>)query).ThenByDescending(n => n.Status) : ((IOrderedQueryable<NotificationDTO>)query).ThenBy(n => n.Status));
                    isFirst = false;
                }
            }

            return query;
        }

        //// GET: api/Notifications
        //[HttpGet]
        //[Authorize(Roles = "Admin,Customer")]
        //public async Task<ActionResult<ApiResponse<PagedResult<NotificationDTO>>>>
        //    GetNotifications([FromQuery] NotificationFilterDTO filter)
        //{
        //    var result = await _notificationService.GetPagedAsync(filter);
        //    return Ok(result);
        //}
        [HttpGet("me")]
        [EnableQuery]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        public IActionResult GetNotificationsForHomeOData()
        {
            var query = _notificationService.AsQueryableForCurrentUser();
            return Ok(query);
        }


        // GET: api/Notifications/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> GetNotification(int id)
        {
            var result = await _notificationService.GetByIdAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // PUT: api/Notifications/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>>
            UpdateNotification(int id, [FromBody] NotificationUpdateDTO dto)
        {
            if (id != dto.NotificationId)
                return BadRequest(ApiResponse<NotificationDTO>.Fail("ID mismatch."));

            var result = await _notificationService.UpdateAsync(dto);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/Notifications
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>>
            CreateNotification([FromBody] NotificationCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<NotificationDTO>.Fail("Invalid data."));

            var result = await _notificationService.CreateAsync(dto);
            return Ok(result);
        }

        // DELETE: api/Notifications/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(int id)
        {
            var result = await _notificationService.DeleteAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        //private bool NotificationExists(int id)
        //{
        //    return _context.Notifications.Any(e => e.NotificationId == id);
        //}

        [HttpGet("{id}/view-status")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ApiResponse<bool>>> CheckUserViewed(int id)
        {
            var result = await _notificationService.CheckUserViewedAsync(id);
            return Ok(result);
        }

        [HttpPost("{id}/view")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAsViewed(int id)
        {
            var result = await _notificationService.MarkAsViewedAsync(id);
            return Ok(result);
        }

        ///// api/Notifications/odata/my?$filter=Status eq 'Sent'&$orderby=CreatedDate desc&$top=10&$skip=0&$count=true

        //[HttpGet("me")]
        //[EnableQuery]
        //[Authorize(Roles = "Admin,Customer")]
        //public IActionResult GetMyNotificationsOData()
        //{
        //    var query = _notificationService.AsQueryableForCurrentUser();
        //    return Ok(query);
        //}

        [HttpPost("custom")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> CreateCustom([FromBody] NotificationCreateCustomDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<NotificationDTO>.Fail("Invalid data."));

            var result = await _notificationService.CreateCustomAsync(dto);
            return Ok(result);
        }
    }
}
