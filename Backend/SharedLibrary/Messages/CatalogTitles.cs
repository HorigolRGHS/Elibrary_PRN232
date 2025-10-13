using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record CatalogTitlesRequest(Guid RequestId, IReadOnlyList<int> DocumentIds);
    public record CatalogTitlesResponse(Guid RequestId, IReadOnlyList<TitlePair> Items);
    public record TitlePair(int DocumentId, string Title);
}
