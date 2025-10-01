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

    public string Content { get; set; } = null!;

    public int? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public DateTime ScheduledDate { get; set; }

    public string Type { get; set; } = null!;

    public string Status { get; set; } = null!;
}
