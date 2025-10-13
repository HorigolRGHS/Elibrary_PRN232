using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OData.Query;
using Elib.Interaction.Service.Services;
using Elib.Interaction.Service.DTOs;
using SharedLibrary.Commons;
using Elib.Interaction.Service.DTOs.Elib.Interaction.Service.DTOs;

namespace Elib.Interaction.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        // ===============================================
        // GET: api/Reports/odata?$filter=Status eq 'Pending'&$orderby=CreatedDate desc&$top=10&$skip=0&$count=true
        [HttpGet("odata")]
        [EnableQuery]
        [Authorize(Roles = "Admin,Customer")]
        public IActionResult GetReportsOData()
        {
            var query = _reportService.AsQueryable();
            return Ok(query);
        }

        // ===============================================
        // GET: api/Reports/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer")]
        public async Task<ActionResult<ApiResponse<ReportDTO>>> GetReport(int id)
        {
            var result = await _reportService.GetByIdAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ===============================================
        // POST: api/Reports
        [HttpPost]
        [Authorize(Roles = "Customer,Admin")]
        public async Task<ActionResult<ApiResponse<ReportDTO>>> CreateReport([FromBody] ReportCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<ReportDTO>.Fail("Invalid report data."));

            var result = await _reportService.CreateAsync(dto);
            return Ok(result);
        }

        // ===============================================
        // PUT: api/Reports/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ReportDTO>>> UpdateReport(int id, [FromBody] ReportUpdateDTO dto)
        {
            if (id != dto.ReportId)
                return BadRequest(ApiResponse<ReportDTO>.Fail("ID mismatch."));

            var result = await _reportService.UpdateAsync(dto);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }

        // ===============================================
        // DELETE: api/Reports/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteReport(int id)
        {
            var result = await _reportService.DeleteAsync(id);
            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
