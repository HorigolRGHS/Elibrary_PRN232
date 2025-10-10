using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class SubjectReadDTO
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = null!;
        public string ImageUrl { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public ICollection<DocumentReadDTO> Documents { get; set; } = new List<DocumentReadDTO>();
    }
}