namespace Elib.Activity.Service.DTOs
{
    public class ViewNotificationDTO
    {
        public int NotificationId { get; set; }
        public int ViewedBy { get; set; }
        public bool Viewed { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ViewedDate { get; set; }
    }
}
