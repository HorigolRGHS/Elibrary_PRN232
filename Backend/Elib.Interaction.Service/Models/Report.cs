using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Interaction.Service.Models;

[Table("Report")]
public partial class Report
{
    [Key]
    public int ReportId { get; set; }

    [Required]
    public int DocumentId { get; set; }

    [Required(ErrorMessage = "Reason is required")]
    [StringLength(1000, ErrorMessage = "Reason cannot exceed 1000 characters")]
    public string Reason { get; set; } = null!;

    [Required]
    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    [Required]
    [RegularExpression(@"^(Pending|Resolved)$", ErrorMessage = "Status must be Pending or Resolved")]
    public string Status { get; set; } = null!;

    public DateTime? UpdatedDate { get; set; }
}
