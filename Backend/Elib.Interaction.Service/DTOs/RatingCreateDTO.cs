using System.ComponentModel.DataAnnotations;

namespace Elib.Interaction.Service.DTOs
{
    public class RatingCreateDTO
    {
        [Required]
        public int DocumentId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Star rating must be between 1 and 5")]
        public int StarRating { get; set; }

        [StringLength(1000, ErrorMessage = "Review cannot exceed 1000 characters")]
        public string? Review { get; set; }

        public int? CreatedBy { get; set; }
    }
}
