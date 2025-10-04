namespace Elib.Auth.Service.DTOs
{
    public sealed class LoginResponseDTO
    {
        public string AccessToken { get; init; } = string.Empty;
        public DateTime ExpiresAtUtc { get; init; }
        public UserInfoDTO User { get; init; } = new();
        public IEnumerable<string> Permissions { get; init; } = Array.Empty<string>();
    }
}