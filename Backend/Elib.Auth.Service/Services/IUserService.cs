using Elib.Auth.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using Elib.Auth.Service.DTOs.Admin;

namespace Elib.Auth.Service.Services
{
    public interface IUserService
    {
        Task<ApiResponse<User>> GetByEmailAsync(string email);
        IQueryable<UserListItemDTO> GetAll(int userId);
        Task<ApiResponse<string>> UpdateUserAsync(UpdateUserAccountDTO dto);
        Task<ApiResponse<string>> DeleteUserAsync(int userId);
    }
}
