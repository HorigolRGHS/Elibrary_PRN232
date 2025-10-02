using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elib.Interaction.Service.Models;

[Table("Rating", Schema = "interaction_svc")]
public partial class Rating
{
    [Key]
    public int RatingId { get; set; }

    [Required]
    public int DocumentId { get; set; }

    [Required]
    [Range(1, 5, ErrorMessage = "Star rating must be between 1 and 5")]
    public int StarRating { get; set; }

    [StringLength(1000, ErrorMessage = "Review cannot exceed 1000 characters")]
    public string? Review { get; set; }

    [Required]
    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
