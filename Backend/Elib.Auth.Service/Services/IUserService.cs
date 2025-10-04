using Elib.Auth.Service.Models;
using SharedLibrary.Commons;
using SharedLibrary.Services;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Elib.Auth.Service.Services
{
    public interface IUserService : IBaseService<User>
    {
        Task<ApiResponse<User>> GetByEmailAsync(string email);
    }
}
