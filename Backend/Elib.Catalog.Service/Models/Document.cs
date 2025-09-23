using System;
using System.Collections.Generic;

namespace Elib.Catalog.Service.Models;

public partial class Document
{
    public int DocumentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string FileUrl { get; set; } = null!;

    public int? ViewCount { get; set; }

    public int? DownloadCount { get; set; }

    public int? CategoryId { get; set; }

    public int? SubjectId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

    public int CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public DateTime? DeletedDate { get; set; }

    public virtual Category? Category { get; set; }

    public virtual Subject? Subject { get; set; }
}
