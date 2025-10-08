namespace Elib.Catalog.Service.DTOs
{
    public class AdminDocumentItemDTO
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
        public string Status { get; set; } = null!;
        public DateTime CreatedDate { get; set; }
        public int CreatedBy { get; set; }
        public string? CreatedByUsername { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime? DeletedDate { get; set; }
        public int? DeletedBy { get; set; }
        public string? DeletedByUsername { get; set; }
    }

    public class AdminDocumentListDTO
    {
        public int DocumentId { get; set; }
        public string Title { get; set; } = null!;
        public string? CategoryName { get; set; }
        public string? SubjectName { get; set; }
        public string Status { get; set; } = null!;
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedByUsername { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}
