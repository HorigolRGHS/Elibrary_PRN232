using Elib.Activity.Service.DTOs;
using System.Text.Json.Serialization;

namespace Elib.Activity.Service.Contracts
{
    public class MyHistoryData
    {
        [JsonPropertyName("@odata.count")]
        public int? ODataCount { get; set; }

        public int Page { get; set; }
        public int PageSize { get; set; }

        public IEnumerable<UserDownloadHistoryResponseDTO> Value { get; set; } = Array.Empty<UserDownloadHistoryResponseDTO>();
    }
}
