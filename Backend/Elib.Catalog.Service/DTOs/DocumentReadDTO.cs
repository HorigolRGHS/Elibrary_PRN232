using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class DocumentReadDTO
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string FileUrl { get; set; } = null!;
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public int? CategoryId { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}