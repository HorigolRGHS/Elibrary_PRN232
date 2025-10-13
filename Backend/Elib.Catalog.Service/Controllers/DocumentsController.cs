using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace Elib.Catalog.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _service;

        public DocumentsController(IDocumentService service)
        {
            _service = service;
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
            return resp.Success ? Ok(resp) : NotFound(resp);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAdmin()
        {
            var resp = await _service.GetAllAdminAsync();
            return Ok(resp);
        }

        [HttpGet("admin/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByIdAdmin(int id)
        {
            var resp = await _service.GetByIdAdminAsync(id);
            return resp.Success ? Ok(resp) : NotFound(resp);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDocumentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var resp = await _service.CreateAsync(dto);
            return Ok(resp);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDocumentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var resp = await _service.UpdateAsync(id, dto);
            return resp.Success ? Ok(resp) : BadRequest(resp);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var resp = await _service.DeleteAsync(id);
            return resp.Success ? Ok(resp) : NotFound(resp);
        }

        [HttpPost("{id:int}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id, [FromBody] ApproveDocumentDTO req)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var resp = await _service.ApproveAsync(id, req);
            return resp.Success ? Ok(resp) : BadRequest(resp);
        }

        [EnableQuery]
        [HttpGet("query")]
        public async Task<IQueryable<UserDocumentListDTO>> QueryUser()
        {
            return await _service.GetDocumentsForUserQueryableAsync();
        }

        [EnableQuery]
        [HttpGet("admin/query")]
        public async Task<IQueryable<AdminDocumentListDTO>> QueryAdmin()
        {
            return await _service.GetDocumentsForAdminQueryableAsync();
        }

    }
}
