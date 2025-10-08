using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Commons
{
    public sealed class ApiPagedResponse<TItem>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? Code { get; set; }
        public string? TraceId { get; set; }

        public IEnumerable<TItem> Items { get; set; } = Array.Empty<TItem>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }

        public static ApiPagedResponse<TItem> Ok(IEnumerable<TItem> items, int total, int page, int pageSize, string? message = null, string? code = null, string? traceId = null)
            => new() { Success = true, Items = items, TotalCount = total, Page = page, PageSize = pageSize, Message = message, Code = code, TraceId = traceId };

        public static ApiPagedResponse<TItem> Fail(string message, string? code = null, string? traceId = null)
            => new() { Success = false, Message = message, Code = code, TraceId = traceId };
    }
}
