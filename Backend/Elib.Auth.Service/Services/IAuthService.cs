using Elib.Auth.Service.DTOs;
using SharedLibrary.Commons;

namespace Elib.Auth.Service.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<LoginResponseDTO>> LoginAsync(LoginRequestDTO dto);
    }
}