using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class UpdateDocumentDTO
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? FileUrl { get; set; }

        public int? CategoryId { get; set; }
        public int? SubjectId { get; set; }
    }
}
