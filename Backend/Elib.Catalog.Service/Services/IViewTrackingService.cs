namespace Elib.Catalog.Service.Services
{
    public interface IViewTrackingService
    {
        Task<bool> TryIncrementViewAsync(int documentId, int? userId, CancellationToken ct = default);
    }
}
