using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs
{
    public sealed class ResetPasswordRequestDTO
    {
        [Required]
        public string Token { get; init; } = string.Empty; 

        [Required]
        [EmailAddress]
        public string Email { get; init; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
            ErrorMessage = "Password must include at least one uppercase letter, one lowercase letter, and one number")]
        public string NewPassword { get; init; } = string.Empty;
    }
}
