using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.DTOs
{
    public class UpdateNotificationDTO
    {
        [Required]
        public int NotificationId { get; set; }

        [Required, MinLength(3)]
        public string Title { get; set; } = null!;

        [Required, StringLength(1000)]
        public string Content { get; set; } = null!;

        [Required]
        [RegularExpression(@"^(System|Customer|Custom)$")]
        public string Type { get; set; } = null!;

        [Required]
        [RegularExpression(@"^(Pending|Sent|Cancelled)$")]
        public string Status { get; set; } = null!;

        [Required]
        public DateTime ScheduledDate { get; set; }
    }
}
