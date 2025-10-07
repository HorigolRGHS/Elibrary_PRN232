using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.DTOs
{
    public class CreateNotificationDTO
    {
        [Required, MinLength(3)]
        public string Title { get; set; } = null!;

        [Required, StringLength(1000)]
        public string Content { get; set; } = null!;

        [Required]
        [RegularExpression(@"^(System|Customer|Custom)$", ErrorMessage = "Type must be System, Customer, or Custom")]
        public string Type { get; set; } = null!;

        [Required]
        public DateTime ScheduledDate { get; set; }
    }
}
