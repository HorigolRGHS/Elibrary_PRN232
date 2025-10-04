namespace Elib.Auth.Service.DTOs
{
    public sealed class UserInfoDTO
    {
        public int UserId { get; init; }
        public string FullName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public string? ImageUrl { get; init; }
    }
}
