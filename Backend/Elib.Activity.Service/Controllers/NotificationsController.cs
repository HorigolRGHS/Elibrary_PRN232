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

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/Notifications/odata?$filter=Type eq 'System'&$orderby=CreatedDate desc&$top=5&$skip=0&$count=true
        [HttpGet]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        public IActionResult GetNotifications(
                           [FromQuery(Name = "$skip")] int? skip,
                           [FromQuery(Name = "$top")] int? top,
                           [FromQuery(Name = "$count")] bool? count)
        {
            var s = skip.GetValueOrDefault(0);
            var t = top.GetValueOrDefault(10);
            if (t <= 0) t = 10;
            if (s < 0) s = 0;

            var includeCount = count.GetValueOrDefault(true);

            var query = _notificationService.AsQueryable()
                .OrderByDescending(n => n.CreatedDate)
                .Skip(s)
                .Take(t);

            var items = query.ToList();
            var total = includeCount ? _notificationService.AsQueryable().Count() : (int?)null;

            var result = new
            {
                ODataCount = total,
                Skip = s,
                Top = t,
                Value = items
            };

            return Ok(ApiResponse<object>.Ok(result));
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

        /// api/Notifications/odata/my?$filter=Status eq 'Sent'&$orderby=CreatedDate desc&$top=10&$skip=0&$count=true

        [HttpGet("odata/me")]
        [EnableQuery]
        [Authorize(Roles = "Admin,Customer")]
        public IActionResult GetMyNotificationsOData()
        {
            var query = _notificationService.AsQueryableForCurrentUser();
            return Ok(query);
        }

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
