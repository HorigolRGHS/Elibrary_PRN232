using System;
using System.Collections.Generic;

namespace Elib.Activity.Service.Models;

public partial class AuditLog
{
    public long AuditId { get; set; }

    public string ServiceName { get; set; } = null!;

    public string TableName { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string RecordId { get; set; } = null!;

    public int? PerformedBy { get; set; }

    public DateTime PerformedAt { get; set; }

    public string? OldValues { get; set; }

    public string? NewValues { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
