using System;
using System.Collections.Generic;

namespace Elib.Catalog.Service.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
}
