using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class CreateDocumentDTO
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = null!;

        [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "File URL is required")]
        [StringLength(500, ErrorMessage = "File URL cannot exceed 500 characters")]
        public string FileUrl { get; set; } = null!;

        [Required(ErrorMessage = "Category is required")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Subject is required")]
        public int SubjectId { get; set; }
    }
}
