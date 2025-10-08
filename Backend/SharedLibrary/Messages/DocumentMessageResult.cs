using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record GetDocumentSummary(int DocumentId);

    public record DocumentSummaryResult(
        int DocumentID,
        string DocumentTitle,
        string? SubjectName,
        string FileURL
    );
    public record DocumentSummaryNotFound(int DocumentId);
}
