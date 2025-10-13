using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;

namespace Elib.Interaction.Service.Repositories
{
    public class CommentRepository : BaseRepository<Comment>, ICommentRepository
    {
        private readonly InteractionDb _context;

        public CommentRepository(InteractionDb context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Comment>> GetCommentsByDocumentIdAsync(int documentId)
        {
            return await _context.Comments
                .Where(c => c.DocumentId == documentId)
                .OrderByDescending(c => c.CreatedDate)
                .ToListAsync();
        }
    }
}
