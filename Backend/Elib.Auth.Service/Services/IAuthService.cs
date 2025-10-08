using Elib.Auth.Service.DTOs;
using SharedLibrary.Commons;
using System.Security.Claims;

namespace Elib.Auth.Service.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO dto);
        Task<ApiResponse<UserInfoDTO>> RegisterAsync(RegisterRequestDTO dto);
        Task<ApiResponse<UserInfoDTO>> MeAsync(ClaimsPrincipal principal);
        Task<ApiResponse<string>> ForgotPasswordAsync(ForgotPasswordRequestDTO dto);
        Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordRequestDTO dto);
        Task<ApiResponse<string>> ConfirmRegistrationAsync(string email, string token);
        Task<ApiResponse<LoginResponseDTO>> UpdateMeAsync(ClaimsPrincipal principal, UpdateMeRequestDTO dto);
    }
}