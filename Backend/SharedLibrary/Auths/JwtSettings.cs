using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedLibrary.Auths
{
    public class JwtSettings
    {
        public string Issuer { get; set; } = default!;
        public string Audience { get; set; } = default!;
        public string SecretKey { get; set; } = default!;
        public int ExpiryDays { get; set; } = 1;
    }
}
