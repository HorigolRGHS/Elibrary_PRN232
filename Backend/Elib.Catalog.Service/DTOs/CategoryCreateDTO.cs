using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Catalog.Service.DTOs
{
    public class CategoryCreateDTO
    {
        [Required(ErrorMessage = "CategoryName is required")]
        [StringLength(100, ErrorMessage = "CategoryName cannot exceed 100 characters")]
        [Column(TypeName = "nvarchar(100)")]
        public string CategoryName { get; set; } = null!;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        [Column(TypeName = "nvarchar(500)")]
        public string? Description { get; set; }
    }
}
