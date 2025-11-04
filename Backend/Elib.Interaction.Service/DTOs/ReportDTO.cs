
 namespace Elib.Interaction.Service.DTOs
    {
        public class ReportDTO
        {
            public int ReportId { get; set; }
            public int DocumentId { get; set; }
            public string Reason { get; set; } = null!;
            public DateTime CreatedDate { get; set; }
            public int? CreatedBy { get; set; }
            public string? CreatedByName { get; set; }
            public string Status { get; set; } = null!;
            public DateTime? UpdatedDate { get; set; }
        }
    }