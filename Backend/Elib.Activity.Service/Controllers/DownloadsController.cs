using Elib.Activity.Service.Contracts;
using Elib.Activity.Service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Auths;
using SharedLibrary.Commons;

namespace Elib.Activity.Service.Controllers
{
    /// <summary>
    /// RESTful API cho Download operations
    /// Base URL: /api/downloads
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class DownloadsController : ControllerBase
    {
        private readonly IDownloadHistoryService _service;
        private readonly ILogger<DownloadsController> _logger;

        public DownloadsController(
            IDownloadHistoryService service,
            ILogger<DownloadsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Lịch sử tải của user hiện tại (đã ENRICH từ Catalog với Document info).
        /// Simple pagination với skip/top/count.
        /// GET /api/downloads/my-history?skip=0&top=10&includeCount=true
        /// </summary>
        [HttpGet("my-history")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        public async Task<IActionResult> GetMyHistory(
            [FromQuery] int? skip,
            [FromQuery] int? top,
            [FromQuery] bool? includeCount,
            CancellationToken ct)
        {
            var userId = User.GetUserIdOrThrow();

            var s = skip.GetValueOrDefault(0);
            var t = top.GetValueOrDefault(10);
            if (t <= 0) t = 10;
            if (s < 0) s = 0;

            var doCount = includeCount.GetValueOrDefault(true);

            var result = await _service.GetUserDownloadsAsync(userId, s, t, doCount, ct);

            return Ok(ApiResponse<PagedResult<Elib.Activity.Service.DTOs.UserDownloadHistoryResponseDTO>>.Ok(result));
        }

        /// <summary>
        /// Get top downloaded documents (with enriched info)
        /// GET /api/downloads/top?take=10&from=2025-01-01&to=2025-12-31
        /// </summary>
        [HttpGet("top")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopDownloads(
            [FromQuery] int? take,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            CancellationToken ct)
        {
            // TODO: Implement GetTopDownloadsAsync in service if needed
            return Ok(ApiResponse<object>.Ok(new { message = "Coming soon" }));
        }
    }
}
