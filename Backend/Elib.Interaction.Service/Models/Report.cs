using System;
using System.Collections.Generic;

namespace Elib.Interaction.Service.Models;

public partial class Report
{
    public int ReportId { get; set; }

    public int DocumentId { get; set; }

    public string Reason { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public string Status { get; set; } = null!;

    public DateTime? UpdatedDate { get; set; }
}
