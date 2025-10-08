using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs.Admin
{
    public class UpdateUserAccountDTO
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public string FullName { get; set; } = string.Empty;
        [Required]
        public bool Active { get; set; }
    }
}