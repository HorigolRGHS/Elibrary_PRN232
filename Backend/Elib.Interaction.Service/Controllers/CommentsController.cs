using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Elib.Interaction.Service.Services;
using Elib.Interaction.Service.DTOs.Comment;
using SharedLibrary.Commons;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace Elib.Interaction.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        // GET: api/comments/5
        [HttpGet("{documentId:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<IEnumerable<CommentListDTO>>>> GetByDocumentId(int documentId)
        {
            var response = await _commentService.GetCommentsByDocumentIdAsync(documentId);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        // GET: api/comments/detail/5
        [HttpGet("detail/{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<CommentReadDTO>>> GetById(int id)
        {
            var response = await _commentService.GetByIdAsync(id);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        // POST: api/comments
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CommentReadDTO>>> Create([FromBody] CommentCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<CommentReadDTO>.Fail("Invalid comment data"));

            var response = await _commentService.CreateAsync(dto);
            if (!response.Success)
                return StatusCode(StatusCodes.Status500InternalServerError, response);

            return CreatedAtAction(nameof(GetById), new { id = response.Data?.CommentId }, response);
        }

        // PUT: api/comments/5
        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<CommentReadDTO>>> Update(int id, [FromBody] CommentUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<CommentReadDTO>.Fail("Invalid comment data"));

            var response = await _commentService.UpdateAsync(id, dto);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }


        // DELETE: api/comments/5
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var response = await _commentService.DeleteAsync(id);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }
    }
}
