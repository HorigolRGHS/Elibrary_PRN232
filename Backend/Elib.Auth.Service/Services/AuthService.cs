using BCrypt.Net;
using Elib.Auth.Service.DTOs;
using Elib.Auth.Service.Repositories;
using SharedLibrary.Auths;
using SharedLibrary.Commons;

namespace Elib.Auth.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly JwtHelper _jwt;
        private readonly JwtSettings _jwtSettings;

        public AuthService(IUserRepository users, JwtHelper jwt, JwtSettings jwtSettings)
        {
            _users = users;
            _jwt = jwt;
            _jwtSettings = jwtSettings;
        }

        public async Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return ApiResponse<LoginResponseDTO>.Fail("Email or password is empty");

            var user = await _users.GetByEmailAsync(dto.Email);
            if (user == null || user.DeletedDate != null || !user.Active)
                return ApiResponse<LoginResponseDTO>.Fail("Invalid credentials");

            var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!ok)
                return ApiResponse<LoginResponseDTO>.Fail("Invalid credentials");

            var token = _jwt.GenerateToken(
                user.UserId,
                user.Role.ToString(),
                user.FullName,
                user.Email,
                permissions: null,
                imageUrl: user.ImageUrl
            );

            var resp = new LoginResponseDTO
            {
                AccessToken = token,
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = new UserInfoDTO
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    ImageUrl = user.ImageUrl
                },
                Permissions = Array.Empty<string>()
            };

            return ApiResponse<LoginResponseDTO>.Ok(resp);
        }
    }
}