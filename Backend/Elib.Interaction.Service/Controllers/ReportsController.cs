using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OData.Query;
using Elib.Interaction.Service.Services;
using Elib.Interaction.Service.DTOs;
using SharedLibrary.Commons;
using Microsoft.AspNetCore.Authentication.JwtBearer;

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
        [HttpGet]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Customer")]
        public IActionResult GetReports(
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

            IQueryable<ReportDTO> query = _reportService.AsQueryable();

            // Apply $filter if provided
            if (!string.IsNullOrWhiteSpace(filter))
            {
                query = ApplyODataFilter(query, filter);
            }

            // Get total count before paging
            var total = includeCount ? query.Count() : (int?)null;

            // Apply $orderby if provided, otherwise default to CreatedDate desc
            if (!string.IsNullOrWhiteSpace(orderby))
            {
                query = ApplyODataOrderBy(query, orderby);
            }
            else
            {
                query = query.OrderByDescending(r => r.CreatedDate);
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
        /// Simple OData $filter parser
        /// Supports: documentId eq X, status eq 'value'
        /// </summary>
        private IQueryable<ReportDTO> ApplyODataFilter(IQueryable<ReportDTO> query, string filter)
        {
            var conditions = filter.Split(" and ", StringSplitOptions.RemoveEmptyEntries);

            foreach (var condition in conditions)
            {
                var trimmed = condition.Trim();

                // Pattern: documentId eq X
                if (trimmed.StartsWith("documentId eq "))
                {
                    var parts = trimmed.Split(" eq ", StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2 && int.TryParse(parts[1].Trim(), out var documentId))
                    {
                        query = query.Where(r => r.DocumentId == documentId);
                    }
                }
                // Pattern: status eq 'value'
                else if (trimmed.StartsWith("status eq "))
                {
                    var parts = trimmed.Split(" eq ", StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2)
                    {
                        var value = parts[1].Trim().Trim('\'');
                        query = query.Where(r => r.Status == value);
                    }
                }
            }

            return query;
        }

        /// <summary>
        /// Simple OData $orderby parser
        /// Supports: field asc|desc
        /// </summary>
        private IQueryable<ReportDTO> ApplyODataOrderBy(IQueryable<ReportDTO> query, string orderby)
        {
            var clauses = orderby.Split(",", StringSplitOptions.RemoveEmptyEntries);

            bool isFirst = true;
            foreach (var clause in clauses)
            {
                var parts = clause.Trim().Split(" ", StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 0) continue;

                var fieldName = parts[0];
                var direction = parts.Length > 1 ? parts[1].ToLower() : "asc";

                if (isFirst)
                {
                    if (fieldName.Equals("createdDate", StringComparison.OrdinalIgnoreCase))
                        query = direction == "desc" ? query.OrderByDescending(r => r.CreatedDate) : query.OrderBy(r => r.CreatedDate);
                    else if (fieldName.Equals("documentId", StringComparison.OrdinalIgnoreCase))
                        query = direction == "desc" ? query.OrderByDescending(r => r.DocumentId) : query.OrderBy(r => r.DocumentId);
                    else if (fieldName.Equals("status", StringComparison.OrdinalIgnoreCase))
                        query = direction == "desc" ? query.OrderByDescending(r => r.Status) : query.OrderBy(r => r.Status);
                    else if (fieldName.Equals("createdBy", StringComparison.OrdinalIgnoreCase))
                        query = direction == "desc" ? query.OrderByDescending(r => r.CreatedBy) : query.OrderBy(r => r.CreatedBy);
                    
                    isFirst = false;
                }
            }

            return query;
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
