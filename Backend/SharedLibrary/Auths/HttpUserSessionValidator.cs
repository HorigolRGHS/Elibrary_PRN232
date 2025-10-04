using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace SharedLibrary.Auths
{
    public class HttpUserSessionValidator : IUserSessionValidator
    {
        private readonly IHttpClientFactory _factory;

        public HttpUserSessionValidator(IHttpClientFactory factory)
        {
            _factory = factory;
        }

        public async Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken)
        {
            var client = _factory.CreateClient("AuthService");
            try
            {
                var builder = new UriBuilder(client.BaseAddress!);
                builder.Path = "api/auth/exists";
                var q = HttpUtility.ParseQueryString(string.Empty);
                q["email"] = email;
                builder.Query = q.ToString();
                using var resp = await client.GetAsync(builder.Uri, cancellationToken);
                return resp.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
