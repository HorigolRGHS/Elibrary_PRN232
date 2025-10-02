using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Catalog.Service.Models;

[Table("Document", Schema = "catalog_svc")]
public partial class Document
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int DocumentId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    [Column(TypeName = "nvarchar(200)")]
    public string Title { get; set; } = null!;

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    [Column(TypeName = "nvarchar(2000)")]
    public string? Description { get; set; }

    [StringLength(500, ErrorMessage = "File URL cannot exceed 500 characters")]
    [Url(ErrorMessage = "Invalid file URL format")]
    [Column(TypeName = "nvarchar(500)")]
    [Required(ErrorMessage = "File URL is required")]
    public string FileUrl { get; set; } = null!;

    [Range(0, int.MaxValue, ErrorMessage = "View count must be non-negative")]
    public int ViewCount { get; set; } = 0;

    [Range(0, int.MaxValue, ErrorMessage = "Download count must be non-negative")]
    public int DownloadCount { get; set; } = 0;

    [Required]
    [ForeignKey(nameof(Category))]
    public int? CategoryId { get; set; }

    [Required]
    [ForeignKey(nameof(Subject))]
    public int? SubjectId { get; set; }

    [Required]
    [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
    [Column(TypeName = "varchar(20)")]
    [RegularExpression(@"^(Pending|Accepted|Rejected)$",
            ErrorMessage = "Status must be: Pending, Accepted or Rejected")]
    public string Status { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    [Required]
    public int CreatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DeletedDate { get; set; }

    public int? DeletedBy { get; set; }

    public virtual Category? Category { get; set; }

    public virtual Subject? Subject { get; set; }
}
