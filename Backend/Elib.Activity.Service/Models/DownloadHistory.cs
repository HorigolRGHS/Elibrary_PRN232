using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Activity.Service.Models;

[Table("DownloadHistory", Schema = "activity_svc")]
public partial class DownloadHistory
{
    [Key]
    public int DownloadId { get; set; }

    [Required]
    public int DocumentId { get; set; }

    public int? DownloadedBy { get; set; }

    [Required]
    public DateTime DownloadedDate { get; set; }
}
