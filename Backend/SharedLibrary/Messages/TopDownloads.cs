using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record TopDownloadsRequest(Guid RequestId, int Take, DateTime? From, DateTime? To);

    public record TopDownloadsItem(int DocumentId, int TotalDownloads, DateTime LastDownloadedDate);

    public record TopDownloadsResponse(Guid RequestId, List<TopDownloadsItem> Items);
}