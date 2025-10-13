namespace Elib.Interaction.Service.DTOs
{
    public class StatisticDTO
    {
        public int ReportCount { get; set; }
        public int DocumentCount { get; set; }  
        public int SubjectCount { get; set; }

        public int UserCount { get; set; }
        //public int ActiveUsers { get; set; }
        public List<TopRatingItemDTO> TopRatings { get; set; } = new();
        public List<TopDownloadedItemDTO> TopDownloads { get; set; } = new();
    }
}