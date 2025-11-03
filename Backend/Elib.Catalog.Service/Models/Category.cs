using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Catalog.Service.Models;

[Table("Category")]
public partial class Category
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "CategoryName is required")]
    [StringLength(100, ErrorMessage = "CategoryName cannot exceed 100 characters")]
    [Column(TypeName = "nvarchar(100)")]
    public string CategoryName { get; set; } = null!;

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    [Column(TypeName = "nvarchar(500)")]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "datetime")]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedDate { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
}
