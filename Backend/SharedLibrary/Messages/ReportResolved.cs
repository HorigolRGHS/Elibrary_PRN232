using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record ReportResolved(
        int ReportId,
        int ResolvedBy,
        string ReportTitle,
        DateTime ResolvedAt
    );
}