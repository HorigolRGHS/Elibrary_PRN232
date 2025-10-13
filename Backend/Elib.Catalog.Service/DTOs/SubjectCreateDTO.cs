using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class SubjectCreateDTO
    {
        [Required(ErrorMessage = "SubjectName is required")]
        [StringLength(100, ErrorMessage = "SubjectName cannot exceed 100 characters")]
        public string SubjectName { get; set; } = null!;

        [Required(ErrorMessage = "ImageURL is required")]
        [StringLength(500, ErrorMessage = "ImageURL cannot exceed 500 characters")]
        public string ImageUrl { get; set; } = null!;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }
    }
}