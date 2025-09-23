using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.Models;

public partial class DownloadHistory
{
    [Key]
    public int DownloadId { get; set; }

    public int DocumentId { get; set; }

    public DateTime DownloadedDate { get; set; }

    public int? DownloadedBy { get; set; }

}
