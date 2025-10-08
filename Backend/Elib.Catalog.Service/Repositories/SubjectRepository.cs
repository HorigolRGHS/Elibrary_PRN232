using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.Models;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Repositories;


namespace Elib.Catalog.Service.Repositories
{
    public class SubjectRepository : BaseRepository<Subject>, ISubjectRepository
    {
        public SubjectRepository(CatalogDb context) : base(context)
        {
        }
    }
}
