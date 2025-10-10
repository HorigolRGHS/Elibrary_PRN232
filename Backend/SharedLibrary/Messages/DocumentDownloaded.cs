using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record DocumentDownloaded(
    int DocumentId,
    int UserId,
    string FileName,
    DateTime DownloadedAt
    );
}
