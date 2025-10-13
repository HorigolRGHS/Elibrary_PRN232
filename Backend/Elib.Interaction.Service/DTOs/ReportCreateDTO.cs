using System.ComponentModel.DataAnnotations;

namespace Elib.Interaction.Service.DTOs
{
    public class ReportCreateDTO
    {
        [Required]
        public int DocumentId { get; set; }

        [Required(ErrorMessage = "Reason is required")]
        [StringLength(1000, ErrorMessage = "Reason cannot exceed 1000 characters")]
        public string Reason { get; set; } = null!;
    }
}