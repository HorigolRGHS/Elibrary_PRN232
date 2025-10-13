namespace Elib.Interaction.Service.DTOs
{
    public class TopDownloadedItemDTO
    {
        public int DocumentId { get; set; }
        public string DocumentTitle { get; set; } = string.Empty;
        public int TotalDownloads { get; set; }
        public DateTime LastDownloadedDate { get; set; }
    }
}
