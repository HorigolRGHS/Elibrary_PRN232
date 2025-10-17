using Elib.Catalog.Service.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Catalog.Service.DTOs
{
    public class UserDocumentListDTO
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? FileUrl { get; set; }
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public string? CategoryName { get; set; }
        public string? SubjectName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class UserDocumentItemDTO
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string FileUrl { get; set; } = null!;
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? SubjectId { get; set; }
        public string? SubjectName { get; set; }
        public int? createdBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
