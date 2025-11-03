using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Activity.Service.Models;

[Table("NotificationView")]
public partial class NotificationView
{
    [Required]
    public int NotificationId { get; set; }

    [Required]
    public int ViewedBy { get; set; }

    [Required]
    public bool Viewed { get; set; } = false;

    [Required]
    public DateTime CreatedDate { get; set; }

    public DateTime? ViewedDate { get; set; }
}
