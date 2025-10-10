using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class DocumentInSubjectDTO
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
    }
}