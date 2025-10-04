using System.Threading;
using System.Threading.Tasks;
using Elib.Auth.Service.Repositories;
using SharedLibrary.Auths;

namespace Elib.Auth.Service.Services
{
    public class LocalUserSessionValidator : IUserSessionValidator
    {
        private readonly IUserRepository _users;
        public LocalUserSessionValidator(IUserRepository users)
        {
            _users = users;
        }

        public async Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken)
        {
            var user = await _users.GetByEmailAsync(email);
            return user != null && user.Active && user.DeletedDate == null;
        }
    }
}
