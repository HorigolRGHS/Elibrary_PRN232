using System.ComponentModel.DataAnnotations;

namespace Elib.Interaction.Service.DTOs.Comment
{
    public class CommentCreateDTO
    {
        [Required(ErrorMessage = "DocumentId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "DocumentId must be greater than 0")]
        public int DocumentId { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
        public string Content { get; set; } = null!;

        [Required(ErrorMessage = "CreatedBy is required")]
        [Range(1, int.MaxValue, ErrorMessage = "CreatedBy must be greater than 0")]
        public int CreatedBy { get; set; }
    }
}
