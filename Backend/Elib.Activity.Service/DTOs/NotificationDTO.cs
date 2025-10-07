namespace Elib.Activity.Service.DTOs
{
    public class NotificationDTO
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Type { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}