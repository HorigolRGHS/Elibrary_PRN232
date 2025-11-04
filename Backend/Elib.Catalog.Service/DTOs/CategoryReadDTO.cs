using System.ComponentModel.DataAnnotations;

namespace Elib.Catalog.Service.DTOs
{
    public class CategoryReadDTO
    {
        [Key]
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}
