namespace Elib.Catalog.Service.DTOs
{
    public class PersonalDocumentSumaryDTO
    {
        public int DocumentID { get; set; }
        public string DocumentTitle { get; set; } = default!;
        public string SubjectName { get; set; } = default!;
        public string FileURL { get; set; } = default!;
    }
}
