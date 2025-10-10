using System.ComponentModel.DataAnnotations;

namespace Elib.Activity.Service.DTOs
{
    public class DownloadRecordDTO
    {
        public int DocumentId { get; set; }

        public int? DownloadedBy { get; set; }

    }
}
