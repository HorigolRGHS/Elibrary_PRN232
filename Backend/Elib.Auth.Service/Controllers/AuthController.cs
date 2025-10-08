using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Elib.Auth.Service.Services;
using SharedLibrary.Commons;
using SharedLibrary.Auths;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Elib.Auth.Service.DTOs;
using Elib.Auth.Service.Models;

namespace Elib.Auth.Service.Controllers
{
    [ApiController]
    [Route("api/")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserSessionValidator _validator;
        private readonly IConfiguration _config;
        private readonly IEmailService _email;

        public AuthController(IAuthService authService, IUserSessionValidator validator, IEmailService email, IConfiguration config)
        {
            _authService = authService;
            _validator = validator;
            _email = email;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponseDTO>>> Login([FromBody] LoginRequestDTO dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (!result.Success) return Unauthorized(result);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<UserInfoDTO>>> Register([FromBody] RegisterRequestDTO dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (!result.Success)
            {
                if (string.Equals(result.Message, "Email already in use", StringComparison.OrdinalIgnoreCase))
                    return Conflict(result);
                return BadRequest(result);
            }

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("confirm-registration")]
        public async Task<ActionResult<ApiResponse<string>>> ConfirmRegistration([FromQuery] string email, [FromQuery] string token)
        {
            var result = await _authService.ConfirmRegistrationAsync(email, token);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponse<string>>> ForgotPassword([FromBody] ForgotPasswordRequestDTO dto)
        {
            var result = await _authService.ForgotPasswordAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponse<string>>> ResetPassword([FromBody] ResetPasswordRequestDTO dto)
        {

            var result = await _authService.ResetPasswordAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("auth/exists")]
        public async Task<IActionResult> Exists([FromQuery] string email, CancellationToken ct)
        {
            var ok = await _validator.UserExistsAsync(email, ct);
            return ok ? Ok() : NotFound();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<ApiResponse<UserInfoDTO>>> Me(CancellationToken ct)
        {
            var result = await _authService.MeAsync(HttpContext.User);
            if (!result.Success)
                return Unauthorized(result);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<ActionResult<ApiResponse<LoginResponseDTO>>> UpdateMe([FromBody] UpdateMeRequestDTO dto)
        {
            var result = await _authService.UpdateMeAsync(HttpContext.User, dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}   