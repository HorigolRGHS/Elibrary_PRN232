namespace Elib.Activity.Service.DTOs
{
    public class UserDownloadHistoryResponseDTO
    {
        public int DocumentID { get; set; }
        public string DocumentTitle { get; set; } = default!;
        public string SubjectName { get; set; } = default!;
        public string FileURL { get; set; } = default!;
        public DateTime DownloadedDate { get; set; }
    }
}
