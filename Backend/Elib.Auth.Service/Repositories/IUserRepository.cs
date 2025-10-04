using Elib.Auth.Service.Models;
using SharedLibrary.Repositories;
using System.Threading.Tasks;

namespace Elib.Auth.Service.Repositories
{
    public interface IUserRepository : IBaseRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
    }
}
