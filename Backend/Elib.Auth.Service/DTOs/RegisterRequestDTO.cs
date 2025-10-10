using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Elib.Auth.Service.DTOs
{
    public class RegisterRequestDTO
    {
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name must not exceed 100 characters")]
        public string FullName { get; set; } = default!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = default!;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
            ErrorMessage = "Password must include at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; } = default!;
    }
}
