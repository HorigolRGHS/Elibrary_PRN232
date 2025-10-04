namespace Elib.Auth.Service.DTOs
{
    public sealed class LoginRequestDTO
    {
        public string Email { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty;
    }
}
