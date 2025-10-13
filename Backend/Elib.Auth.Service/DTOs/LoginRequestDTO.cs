using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs
{
    public sealed class LoginRequestDTO
    {
        [Required (ErrorMessage = "Email is required.")]
        public string Email { get; init; } = string.Empty;
        [Required (ErrorMessage = "Password is required.")]
        public string Password { get; init; } = string.Empty;
        public bool RememberMe { get; init; } = false;
    }
}
