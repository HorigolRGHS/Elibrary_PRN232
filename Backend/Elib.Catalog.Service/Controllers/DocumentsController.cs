using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using SharedLibrary.Auths;
using System.Security.Claims;
using MassTransit;
using SharedLibrary.Messages;

namespace Elib.Catalog.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        protected readonly IDocumentService _service;
        protected readonly IViewTrackingService _viewTracking;
        protected readonly CatalogDb _dbcontext;
        protected readonly IPublishEndpoint _publish;
        protected readonly ILogger<DocumentsController> _logger;

        public DocumentsController(
            IDocumentService service, 
            IViewTrackingService viewTracking, 
            CatalogDb dbcontext,
            IPublishEndpoint publish,
            ILogger<DocumentsController> logger)
        {
            _service = service;
            _viewTracking = viewTracking;
            _dbcontext = dbcontext;
            _publish = publish;
            _logger = logger;
        }

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
            
            // Get user ID and role from bearer token claims
            var userId = User.GetUserIdOrThrow();
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var resp = await _service.CreateAsync(dto, userId, userRole);
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

        /// <summary>
        /// Track document download and publish event.
        /// Call this endpoint before redirecting to Storage Service.
        /// POST /api/documents/{id}/download
        /// </summary>
        [HttpPost("{id:int}/download")]
        [Authorize]
        public async Task<IActionResult> TrackDownload(int id)
        {
            // Verify document exists and is accessible
            var doc = await _service.GetByIdAsync(id);
            if (!doc.Success)
                return NotFound(doc);

            var userId = User.GetUserIdOrThrow();

            // Publish download event
            try
            {
                await _publish.Publish(new DocumentDownloaded(
                    DocumentId: id,
                    UserId: userId,
                    FileName: doc.Data?.FileUrl ?? "",
                    DownloadedAt: DateTime.UtcNow
                ));

                _logger.LogInformation(
                    "Download tracked: DocId={DocId}, UserId={UserId}",
                    id, userId);

                return Ok(SharedLibrary.Commons.ApiResponse<object>.Ok(
                    new { documentId = id, fileUrl = doc.Data?.FileUrl },
                    "Download tracked successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to track download for DocId={DocId}, UserId={UserId}",
                    id, userId);

                // Return success anyway - don't block download
                return Ok(SharedLibrary.Commons.ApiResponse<object>.Ok(
                    new { documentId = id, fileUrl = doc.Data?.FileUrl },
                    "Download proceeding (tracking failed)"
                ));
            }
        }

    }
}

