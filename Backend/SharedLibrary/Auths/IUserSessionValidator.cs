using System.Threading;
using System.Threading.Tasks;

namespace SharedLibrary.Auths
{
    public interface IUserSessionValidator
    {
        Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken);
    }
}
