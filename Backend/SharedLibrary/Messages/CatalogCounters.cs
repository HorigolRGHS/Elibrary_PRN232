using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record CatalogCountersRequest(Guid RequestId);
    public record CatalogCountersResponse(Guid RequestId, int TotalDocuments, int TotalSubjects);
}