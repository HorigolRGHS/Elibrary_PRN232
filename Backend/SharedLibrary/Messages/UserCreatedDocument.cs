using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record UserCreatedDocumentRequest(int userId);
    public record UserCreatedDocumentResponse
    (
        int userId,
        string FullName
        );
}
