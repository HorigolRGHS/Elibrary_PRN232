using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Catalog.Service.Models;

[Table("Subject")]
public partial class Subject
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SubjectId { get; set; }

    [Required(ErrorMessage = "SubjectName is required")]
    [StringLength(100, ErrorMessage = "SubjectName cannot exceed 100 characters")]
    [Column(TypeName = "nvarchar(100)")]
    public string SubjectName { get; set; } = null!;

    [Required(ErrorMessage = "ImageURL is required")]
    [StringLength(500, ErrorMessage = "ImageURL cannot exceed 500 characters")]
    [Column(TypeName = "nvarchar(500)")]
    public string ImageUrl { get; set; } = null!;

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    [Column(TypeName = "nvarchar(500)")]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "datetime")]
    public DateTime CreatedDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedDate { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
}
