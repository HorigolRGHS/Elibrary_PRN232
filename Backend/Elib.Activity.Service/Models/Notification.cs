using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.Models;

public partial class Notification
{
    [Key]
    public int NotificationId { get; set; }

    [Required(ErrorMessage = "Title is required")]
    [MinLength(3, ErrorMessage = "Title must be at least 3 characters long")]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage = "Content is required")]
    [StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
    public string Content { get; set; } = null!;

    public int? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    [Required]
    public DateTime ScheduledDate { get; set; }

    [Required]
    [RegularExpression(@"^(System|Customer|Custom)$", ErrorMessage = "Type must be System, Customer, or Custom")]
    public string Type { get; set; } = null!;

    [Required]
    [RegularExpression(@"^(Pending|Sent|Cancelled)$", ErrorMessage = "Status must be Pending, Sent, or Cancelled")]
    public string Status { get; set; } = null!;
}
