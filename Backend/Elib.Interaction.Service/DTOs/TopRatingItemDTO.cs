namespace Elib.Interaction.Service.DTOs
{
    public class TopRatingItemDTO
    {
        public int DocumentId { get; set; }
        public string? DocumentTitle { get; set; }
        public int TotalRatings { get; set; }
        public double AvgRating { get; set; }
    }
}