using System;
using System.Collections.Generic;

namespace Elib.Interaction.Service.Models;

public partial class Rating
{
    public int RatingId { get; set; }

    public int DocumentId { get; set; }

    public int StarRating { get; set; }

    public string? Review { get; set; }

    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
