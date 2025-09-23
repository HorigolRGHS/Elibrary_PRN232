using System;
using System.Collections.Generic;

namespace Elib.Interaction.Service.Models;

public partial class Comment
{
    public int CommentId { get; set; }

    public int DocumentId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }
}
