using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Elib.Auth.Service.Services;
using SharedLibrary.Commons;
using SharedLibrary.Auths;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Elib.Auth.Service.DTOs;

namespace Elib.Auth.Service.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserSessionValidator _validator;
        private readonly IUserService _users;

        public AuthController(IAuthService authService, IUserSessionValidator validator, IUserService users)
        {
            _authService = authService;
            _validator = validator;
            _users = users;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponseDTO>>> Login([FromBody] LoginRequestDTO dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (!result.Success)
                return Unauthorized(result);

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("exists")]
        public async Task<IActionResult> Exists([FromQuery] string email, CancellationToken ct)
        {
            var ok = await _validator.UserExistsAsync(email, ct);
            return ok ? Ok() : NotFound();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<ApiResponse<UserInfoDTO>>> Me(CancellationToken ct)
        {
            var principal = HttpContext.User;
            var email = principal?.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(email))
            {
                return Unauthorized(ApiResponse<UserInfoDTO>.Fail("Invalid token subject"));
            }

            var result = await _users.GetByEmailAsync(email);
            if (!result.Success || result.Data is null)
                return NotFound(ApiResponse<UserInfoDTO>.Fail("User not found"));

            var u = result.Data;
            var image = principal.FindFirst("image_url")?.Value;
            var dto = new UserInfoDTO
            {
                UserId = u.UserId,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                ImageUrl = image ?? u.ImageUrl
            };
            return Ok(ApiResponse<UserInfoDTO>.Ok(dto));
        }
    }
}