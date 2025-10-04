using Elib.Auth.Service.Models;
using Elib.Auth.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Commons;

namespace Elib.Auth.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;

        public UsersController(IUserService service)
        {
            _service = service;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<User>>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [Authorize(Roles = "Admin,Customer")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<User>>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("by-email")]
        public async Task<ActionResult<ApiResponse<User>>> GetByEmail([FromQuery] string email)
        {
            var result = await _service.GetByEmailAsync(email);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<User>>> Create([FromBody] User user)
        {
            var result = await _service.CreateAsync(user);
            return CreatedAtAction(nameof(Get), new { id = user.UserId }, result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse<User>>> Update(int id, [FromBody] User user)
        {
            if (id != user.UserId)
                return BadRequest(ApiResponse<User>.Fail("Mismatched id"));

            var result = await _service.UpdateAsync(user);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}
