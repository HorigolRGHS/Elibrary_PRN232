namespace Elib.Activity.Service.DTOs
{
    public class NotificationFilterDTO
    {
        public string? Type { get; set; }     // System / Customer / Custom
        public string? Status { get; set; }   // Pending / Sent / Cancelled
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
