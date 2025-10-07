using System.ComponentModel.DataAnnotations;

namespace Elib.Interaction.Service.DTOs
{
    public class ReportUpdateDTO
    {
        [Required]
        public int ReportId { get; set; }

        [Required]
        [RegularExpression(@"^(Pending|Resolved)$", ErrorMessage = "Status must be Pending or Resolved")]
        public string Status { get; set; } = null!;
    }
}