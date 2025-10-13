namespace Elib.Interaction.Service.DTOs.Comment
{
    public class CommentListDTO
    {
        public int CommentId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
