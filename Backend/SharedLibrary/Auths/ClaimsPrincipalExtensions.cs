using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace SharedLibrary.Auths
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserIdOrThrow(this ClaimsPrincipal user)
        {
            var raw = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? user.FindFirstValue("user_id");

            if (string.IsNullOrWhiteSpace(raw) || !int.TryParse(raw, out var id))
                throw new UnauthorizedAccessException("Invalid or missing user id claim.");

            return id;
        }
    }
}
