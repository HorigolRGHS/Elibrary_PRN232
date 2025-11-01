using BCrypt.Net;
using Elib.Auth.Service.DTOs;
using Elib.Auth.Service.Repositories;
using SharedLibrary.Auths;
using SharedLibrary.Commons;
using AutoMapper;
using Elib.Auth.Service.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Cryptography;

namespace Elib.Auth.Service.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _users;
        private readonly JwtHelper _jwt;
        private readonly JwtSettings _jwtSettings;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IEmailService _email;

        public AuthService(IUserRepository users, JwtHelper jwt, JwtSettings jwtSettings, IMapper mapper, IConfiguration config, IEmailService email)
        {
            _users = users;
            _jwt = jwt;
            _jwtSettings = jwtSettings;
            _mapper = mapper;
            _config = config;
            _email = email;
        }

        public async Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO dto)
        {

            var user = await _users.GetByEmailAsync(dto.Email);
            if (user == null)
            {
                return ApiResponse<LoginResponseDTO>.Fail("Account not found!");
            } else if (!user.Active)
            {
                return ApiResponse<LoginResponseDTO>.Fail("Your account has been banned or is inactive!");
            }


                var ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!ok)
                return ApiResponse<LoginResponseDTO>.Fail("Password is incorrect!");

            var token = _jwt.GenerateToken(
                user.UserId,
                user.Role.ToString(),
                user.FullName,
                user.Email,
                permissions: null,
                imageUrl: user.ImageUrl,
                rememberMe: dto.RememberMe
            );

            var resp = new LoginResponseDTO
            {
                AccessToken = token,
                ExpiresAtUtc = dto.RememberMe ? DateTime.UtcNow.AddDays(_jwtSettings.RememberMeExpiryDays) :  DateTime.UtcNow.AddDays(_jwtSettings.ExpiryDays),
                User = _mapper.Map<UserInfoDTO>(user),
                Permissions = Array.Empty<string>()
            };

            return ApiResponse<LoginResponseDTO>.Ok(resp, "Login successfully");
        }

        public async Task<ApiResponse<UserInfoDTO>> RegisterAsync(RegisterRequestDTO dto)
        {

            var exists = await _users.GetByEmailAsync(dto.Email);
            if (exists != null)
            {
                if (exists.Active == false)
                {
                    if (exists.DeletedDate != null)
                    {
                        return ApiResponse<UserInfoDTO>.Fail("This email has been banned.");
                    }
                    else
                    {
                        await _users.DeleteAsync(exists);
                        await _users.SaveChangesAsync();
                    }
                }
                else
                {
                    return ApiResponse<UserInfoDTO>.Fail("Email already in use");
                }
            }

            var entity = _mapper.Map<User>(dto);
            entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            await _users.AddAsync(entity);
            await _users.SaveChangesAsync();

            var baseUrl = _config["AuthService:FrontEndUrl"] ?? "http://localhost:3000";
            var confirmKey = _config["AuthService:ConfirmKey"];
            var token = BCrypt.Net.BCrypt.HashPassword(entity.CreatedDate + confirmKey); 
            var confirmUrl = $"{baseUrl}/confirm-registration?token={token}&email={entity.Email}";
            var subject = "Confirm your account - EMC Library";
            var body = $@"
                <div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:24px;background:#fafafa;'>
                    <div style='text-align:center;'>
                        <img src='https://ik.imagekit.io/i0aiv29ol/EMC_LIBRARY_2-removebg-preview.png?updatedAt=1760120698017' alt='EMC Library' style='width:120px;height:auto;margin-bottom:16px;'/>
                        <h2 style='color:#1e3a8a;'>Welcome to EMC Library!</h2>
                    </div>
                    <p>Hi <strong>{entity.FullName}</strong>,</p>
                    <p>Thank you for registering at <strong>EMC Library</strong>! Please confirm your account by clicking the button below:</p>
                    <div style='text-align:center;margin:24px 0;'>
                        <a href='{confirmUrl}' style='background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500;'>Confirm Account</a>
                    </div>
                    <p style='font-size:14px;color:#555;'>If you didn’t sign up for EMC Library, you can safely ignore this email.</p>
                    <hr style='margin:24px 0;border:none;border-top:1px solid #ddd;'/>
                    <p style='font-size:12px;color:#999;text-align:center;'>© {DateTime.UtcNow.Year} EMC Library. All rights reserved.</p>
                </div>";
            try
            {
                _ = Task.Run(() => _email.SendEmailAsync(entity.Email, subject, body));
            }
            catch { }

            var result = _mapper.Map<UserInfoDTO>(entity);
            return ApiResponse<UserInfoDTO>.Ok(result, "Registration created. Please check your email to confirm.");
        }

        public async Task<ApiResponse<UserInfoDTO>> MeAsync(ClaimsPrincipal principal)
        {
            var email = principal?.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return ApiResponse<UserInfoDTO>.Fail("Invalid token subject");

            var userResp = await _users.GetByEmailAsync(email);
            if (userResp == null)
                return ApiResponse<UserInfoDTO>.Fail("User not found");

            var dto = _mapper.Map<UserInfoDTO>(userResp);
            return ApiResponse<UserInfoDTO>.Ok(dto);
        }

        public async Task<ApiResponse<string>> ConfirmRegistrationAsync(string email, string token)
        {
            var confirmKey = _config["AuthService:ConfirmKey"];
            var user = await _users.GetByEmailAsync(email);

            if (user == null)
                return ApiResponse<string>.Fail("User not found");

            if (user.Active)
                return ApiResponse<string>.Ok("Account is already confirmed.");

            var expectedToken = BCrypt.Net.BCrypt.HashPassword(user.CreatedDate + confirmKey);

            var valid = BCrypt.Net.BCrypt.Verify(user.CreatedDate + confirmKey, token);
            if (!valid)
                return ApiResponse<string>.Fail("Invalid or expired token.");

            user.Active = true;
            await _users.UpdateAsync(user);
            await _users.SaveChangesAsync();

            return ApiResponse<string>.Ok("Your account has been successfully confirmed!");
        }

        public async Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequestDTO dto)
        {
            var user = await _users.GetByEmailAsync(dto.Email);
            if (user == null || user.DeletedDate != null)
                return ApiResponse<string>.Fail("Account not found");

            var resetPassKey = _config["AuthService:ResetPassKey"];

            var handler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email+resetPassKey),
                new Claim("purpose", "reset_password"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            var rawToken = handler.WriteToken(token);

            var baseUrl = _config["AuthService:FrontEndUrl"] ?? "http://localhost:3000";
            var link = $"{baseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}&email={Uri.EscapeDataString(user.Email)}";
            var subject = "Reset your password - EMC Library";
            var body = $@"
                <div style='font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;padding:24px;background:#fafafa;'>
                    <div style='text-align:center;'>
                        <img src='https://ik.imagekit.io/i0aiv29ol/EMC_LIBRARY_2-removebg-preview.png?updatedAt=1760120698017' alt='EMC Library' style='width:120px;height:auto;margin-bottom:16px;'/>
                        <h2 style='color:#1e3a8a;'>Password Reset Request</h2>
                    </div>
                    <p>Hi <strong>{user.FullName}</strong>,</p>
                    <p>We received a request to reset your password for your <strong>EMC Library</strong> account. Click the button below to set a new password:</p>
                    <div style='text-align:center;margin:24px 0;'>
                        <a href='{link}' style='background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500;'>Reset Password</a>
                    </div>
                    <p style='font-size:14px;color:#555;'>This link will expire in 15 minutes for security reasons. If you did not request a password reset, please ignore this email.</p>
                    <hr style='margin:24px 0;border:none;border-top:1px solid #ddd;'/>
                    <p style='font-size:12px;color:#999;text-align:center;'>© {DateTime.UtcNow.Year} EMC Library. All rights reserved.</p>
                </div>";
            try { _ = Task.Run(() => _email.SendEmailAsync(user.Email, subject, body)); }
            catch {
                return ApiResponse<string>.Fail("Failed to send reset email. Please try again later.");
            }


            return ApiResponse<string>.Ok(null, "Reset link has been sent to your email.");
        }


        public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequestDTO dto)
        {
            var resetPassKey = _config["AuthService:ResetPassKey"];

            var handler = new JwtSecurityTokenHandler();
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            ClaimsPrincipal principal;

            try
            {
                principal = handler.ValidateToken(dto.Token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key
                }, out _);
            }
            catch (SecurityTokenExpiredException)
            {
                return ApiResponse<string>.Fail("Reset token expired.");
            }
            catch
            {
                return ApiResponse<string>.Fail("Invalid or expired token.");
            }

            var email = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
          ?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var purpose = principal.FindFirst("purpose")?.Value;


            if (purpose != "reset_password")
                return ApiResponse<string>.Fail("Invalid token purpose.");

            if (!string.Equals(email, dto.Email + resetPassKey, StringComparison.OrdinalIgnoreCase))
                return ApiResponse<string>.Fail("Invalid token subject.");

            var user = await _users.GetByEmailAsync(dto.Email);
            if (user == null || user.DeletedDate != null)
                return ApiResponse<string>.Fail("Account not found");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedDate = DateTime.UtcNow;
            await _users.UpdateAsync(user);
            await _users.SaveChangesAsync();

            return ApiResponse<string>.Ok(null, "Password has been reset successfully.");
        }

        public async Task<ApiResponse<LoginResponseDTO>> UpdateMeAsync(ClaimsPrincipal principal, UpdateMeRequestDTO dto)
        {
            var email = principal?.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return ApiResponse<LoginResponseDTO>.Fail("Invalid token subject");

            var user = await _users.GetByEmailAsync(email);
            if (user == null || user.DeletedDate != null)
                return ApiResponse<LoginResponseDTO>.Fail("User not found");

            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
                user.ImageUrl = dto.ImageUrl.Trim();
            user.UpdatedDate = DateTime.UtcNow;

            await _users.UpdateAsync(user);
            await _users.SaveChangesAsync();

            var newToken = _jwt.GenerateToken(
                user.UserId,
                user.Role.ToString(),
                user.FullName,
                user.Email,
                permissions: null,
                imageUrl: user.ImageUrl
            );

            var resp = new LoginResponseDTO
            {
                AccessToken = newToken,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwtSettings.ExpiryDays),
                User = _mapper.Map<UserInfoDTO>(user),
                Permissions = Array.Empty<string>()
            };
            return ApiResponse<LoginResponseDTO>.Ok(resp, "Update profile successfully");
        }
    }
}