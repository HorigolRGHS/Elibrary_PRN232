using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs.Admin
{
    public class UserListItemDTO
    {
        [Key]
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string Role { get; set; } = string.Empty;
        public bool Active { get; set; }
        public DateTime? DeletedDate { get; set; }
    }
}