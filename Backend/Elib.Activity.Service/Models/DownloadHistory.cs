using System;
using System.Collections.Generic;

namespace Elib.Activity.Service.Models;

public partial class DownloadHistory
{
    public int DownloadId { get; set; }

    public int DocumentId { get; set; }

    public int? DownloadedBy { get; set; }

    public DateTime DownloadedDate { get; set; }
}
