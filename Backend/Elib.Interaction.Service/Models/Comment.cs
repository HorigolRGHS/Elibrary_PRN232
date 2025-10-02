using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Interaction.Service.Models;

[Table("Comment", Schema = "interaction_svc")]
public partial class Comment
{
    [Key]
    public int CommentId { get; set; }

    [Required]
    public int DocumentId { get; set; }

    [Required(ErrorMessage = "Content is required")]
    [StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
    public string Content { get; set; } = null!;

    [Required]
    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
