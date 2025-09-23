using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.Models;

public partial class Notification
{
    [Key]
    public int NotificationId { get; set; }

    [Required(ErrorMessage ="Title is required")]
    [MinLength(5, ErrorMessage ="Title must be at least 5 characters long")]
    public string Title { get; set; } = null!;

    [Required(ErrorMessage ="Content is required")]
    [MinLength(10, ErrorMessage ="Content must be at least 10 characters long")]
    public string Content { get; set; } = null!;

    public int? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime ScheduledDate { get; set; }

    public NotificationType Type { get; set; }

    public NotificationStatus Status { get; set; } = NotificationStatus.Pending!;

    public DateTime? UpdatedDate { get; set; }
}

public enum NotificationType
{
    System,
    Customer,
    Custom
}

public enum NotificationStatus
{
    Pending,
    Sent,
    Cancelled
}
