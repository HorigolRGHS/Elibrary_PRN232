using Elib.Activity.Service.Contracts;
using Elib.Activity.Service.Models;
using Elib.Activity.Service.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SharedLibrary.Commons;
using System.Security.Claims;

namespace Elib.Activity.Service.Controllers
{
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
        /// Lịch sử tải của chính user (đã ENRICH từ Catalog). Hỗ trợ OData $skip/$top/$count/$orderby/$filter (áp dụng tối thiểu: skip/top/count).
        /// GET /odata/Downloads/MyHistory?$skip=0&$top=10&$count=true
        /// </summary>
        [HttpGet("MyHistory")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        public async Task<IActionResult> GetMyHistory(
            [FromQuery(Name = "$skip")] int? skip,
            [FromQuery(Name = "$top")] int? top,
            [FromQuery(Name = "$count")] bool? count,
            CancellationToken ct)
        {
            var userId = GetUserIdOrThrow(User);

            var s = skip.GetValueOrDefault(0);
            var t = top.GetValueOrDefault(10);
            if (t <= 0) t = 10;           // tránh chia cho 0
            if (s < 0) s = 0;

            var includeCount = count.GetValueOrDefault(true);

            var result = await _service.GetUserDownloadsAsync(userId, s, t, includeCount, ct);

            var data = new MyHistoryData
            {
                ODataCount = includeCount ? result.TotalCount : (int?)null,
                Page = result.Page,
                PageSize = result.PageSize,
                Value = result.Items
            };

            return Ok(ApiResponse<MyHistoryData>.Ok(data));
        }



        //public record RecordDownloadRequest(int DocumentId);

        ///// <summary>
        ///// Ghi nhận lượt tải của user hiện tại.
        ///// POST /odata/Downloads/Record
        ///// Body: { "documentId": 123 }
        ///// </summary>
        //[HttpPost("Record/{documentId:int}")]
        //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        //public async Task<IActionResult> RecordByRoute([FromRoute] int documentId, CancellationToken ct)
        //{
        //    if (documentId <= 0) return BadRequest("documentId must be > 0.");

        //    var userId = GetUserIdOrThrow(User);
        //    await _service.RecordUserDownloadAsync(documentId, userId, DateTime.UtcNow, ct);
        //    return Ok(ApiResponse<string>.Ok(null, "Recorded"));
        //}

        private static int GetUserIdOrThrow(ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue("user_id")
                   ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? user.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(raw) || !int.TryParse(raw, out var id))
                throw new UnauthorizedAccessException("Invalid or missing user id claim.");
            return id;
        }
    }
}
