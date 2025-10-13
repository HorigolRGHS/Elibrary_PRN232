using Elib.Interaction.Service.Models;
using SharedLibrary.Repositories;

namespace Elib.Interaction.Service.Repositories
{
    public interface ICommentRepository : IBaseRepository<Comment>
    {
        Task<IEnumerable<Comment>> GetCommentsByDocumentIdAsync(int documentId);
    }
}
