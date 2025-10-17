using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SharedLibrary.Auths;
using System.Security.Claims;

namespace Elib.Catalog.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController(IDocumentService service, IViewTrackingService viewTracking, CatalogDb dbcontext) : ControllerBase
    {
        protected readonly IDocumentService _service = service;
        protected readonly IViewTrackingService _viewTracking = viewTracking;
        protected readonly CatalogDb _dbcontext = dbcontext;

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var resp = await _service.GetAllAsync();
            return Ok(resp);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var resp = await _service.GetByIdAsync(id);
            if (!resp.Success) return NotFound(resp);

            int? userId = User?.Identity?.IsAuthenticated == true 
                ? User.GetUserIdOrThrow()
                : null;

            HttpContext.Response.OnCompleted(async () =>
            {
                try
                {
                    await _viewTracking.TryIncrementViewAsync(id, userId, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DocumentsController] View tracking failed for DocId={id}, UserId={userId}. {ex}");
                }
            });

            return Ok(resp);
        }

        [EnableQuery]
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        [ServiceFilter(typeof(EnrichDocumentUserNamesFilter))]
        public IActionResult Get()
        {
            return Ok(_service.GetDocumentsForAdminQueryableAsync());
        }

        [HttpGet("admin/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByIdAdmin(int id)
        {
            var resp = await _service.GetByIdAdminAsync(id);
            return resp.Success ? Ok(resp) : NotFound(resp);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateDocumentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            // Get user ID from bearer token claims
            var userId = User.GetUserIdOrThrow();
            
            var resp = await _service.CreateAsync(dto, userId);
            return Ok(resp);
        }

        [Authorize(Roles = "Admin,Customer")]
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDocumentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var resp = await _service.UpdateAsync(id, dto);
            return resp.Success ? Ok(resp) : BadRequest(resp);
        }

        [Authorize(Roles = "Admin,Customer")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Get user ID and role from bearer token claims
            var userId = User.GetUserIdOrThrow();
            var userRole = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);
            
            var resp = await _service.DeleteAsync(id, userId, userRole);
            return resp.Success ? Ok(resp) : (resp.Message.Contains("not found") ? NotFound(resp) : Forbid());
        }

        [HttpPost("{id:int}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveDocumentDTO req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            // Get user ID from bearer token claims
            var userId = User.GetUserIdOrThrow();
            
            var resp = await _service.ApproveAsync(id, req, userId);
            return resp.Success ? Ok(resp) : BadRequest(resp);
        }

    }
}
