using Elib.Auth.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;

namespace Elib.Auth.Service.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(IdentityDb context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
