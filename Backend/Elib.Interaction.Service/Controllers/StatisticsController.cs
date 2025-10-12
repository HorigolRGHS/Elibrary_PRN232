using Elib.Interaction.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Elib.Interaction.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticService _service;
        public StatisticsController(IStatisticService service) => _service = service;

        [HttpGet("report-count")]
        public async Task<IActionResult> ReportCount([FromQuery] string? status = null, CancellationToken ct = default)
            => Ok(await _service.GetReportCountAsync(status, ct));

        [HttpGet("top-ratings")]
        public async Task<IActionResult> TopRatings([FromQuery] int take = 5, CancellationToken ct = default)
            => Ok(await _service.GetTopRatingsAsync(take, ct));

        [HttpGet("summary")]
        public async Task<IActionResult> Summary([FromQuery] int top = 5, [FromQuery] string? reportStatus = null, CancellationToken ct = default)
            => Ok(await _service.GetSummaryAsync(top, reportStatus, ct));
    }
}