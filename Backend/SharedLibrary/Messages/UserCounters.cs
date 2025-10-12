using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Messages
{
    public record UserCountersRequest(Guid RequestId);

    public record UserCountersResponse(
        Guid RequestId,
        int TotalUsers,
        int ActiveUsers
    );
}