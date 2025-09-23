using System;
using System.Collections.Generic;

namespace Elib.Activity.Service.Models;

public partial class NotificationView
{
    public int NotificationId { get; set; }

    public int ViewedBy { get; set; }

    public bool Viewed { get; set; }

    public DateTime? ViewedDate { get; set; }

    public DateTime CreatedDate { get; set; }

}
