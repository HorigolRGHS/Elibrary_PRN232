using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.DTOs
{
    public class NotificationCreateCustomDTO
    {

        public string Title { get; set; } = null!;

        [Required, StringLength(1000)]
        public string Content { get; set; } = null!;

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required, MinLength(1, ErrorMessage = "At least one recipient is required")]
        public List<int> RecipientUserIds { get; set; } = new();

        //public int? CreatedBy { get; set; }
    }
}