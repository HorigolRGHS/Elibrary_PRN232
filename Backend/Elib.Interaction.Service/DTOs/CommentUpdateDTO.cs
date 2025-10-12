using System.ComponentModel.DataAnnotations;

namespace Elib.Interaction.Service.DTOs.Comment
{
    public class CommentUpdateDTO
    {
        [Required(ErrorMessage = "Content is required")]
        [StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters")]
        public string Content { get; set; } = null!;
    }
}
