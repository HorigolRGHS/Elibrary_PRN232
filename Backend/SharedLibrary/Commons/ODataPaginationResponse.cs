using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Commons
{
    public class ODataPaginationResponse<T>
    {
        public IEnumerable<T> Value { get; set; } = new List<T>();
        public int Count { get; set; }
        public string? NextLink { get; set; }
    }
}
