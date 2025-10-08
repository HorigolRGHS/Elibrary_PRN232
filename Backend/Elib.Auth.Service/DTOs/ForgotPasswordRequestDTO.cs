using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs
{
    public sealed class ForgotPasswordRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; init; } = string.Empty;
    }
}
