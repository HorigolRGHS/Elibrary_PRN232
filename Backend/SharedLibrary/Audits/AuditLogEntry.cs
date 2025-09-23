using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Audits
{
    public class AuditLogEntry
    {
        public string ServiceName { get; set; } = default!;
        public string TableName { get; set; } = default!;
        public string Action { get; set; } = default!; 
        public string RecordID { get; set; } = default!;
        public int? PerformedBy { get; set; }
        public string? OldValues { get; set; } 
        public string? NewValues { get; set; }
    }
}
