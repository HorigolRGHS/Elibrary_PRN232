using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Elib.Interaction.Service.Services;
using Elib.Interaction.Service.DTOs.Comment;
using SharedLibrary.Commons;

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
        public async Task<IActionResult> GetByDocumentId(int documentId)
        {
            var response = await _commentService.GetCommentsByDocumentIdAsync(documentId);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        // GET: api/comments/detail/5
        [HttpGet("detail/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _commentService.GetByIdAsync(id);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }

        // POST: api/comments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CommentCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid comment data"));

            var response = await _commentService.CreateAsync(dto);
            return Ok(response);
        }

        // PUT: api/comments/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CommentUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Invalid comment data"));

            var response = await _commentService.UpdateAsync(id, dto);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }


        // DELETE: api/comments/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var response = await _commentService.DeleteAsync(id);
            if (!response.Success)
                return NotFound(response);

            return Ok(response);
        }
    }
}
