
namespace SharedLibrary.Audits
{
    public sealed class AuditOptions
    {
        public string ServiceName { get; set; } = ""; 
    }

    public interface ICurrentUserAccessor
    {
        int? GetUserId();
    }
}
