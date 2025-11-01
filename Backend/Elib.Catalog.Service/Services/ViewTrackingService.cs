using Elib.Catalog.Service.Repositories;
using Microsoft.Extensions.Caching.Memory;

namespace Elib.Catalog.Service.Services
{
    public class ViewTrackingService : IViewTrackingService
    {
        private readonly IMemoryCache _cache;
        private readonly IDocumentRepository _documentRepo;
        private readonly ILogger<ViewTrackingService> _logger;

        public ViewTrackingService(
            IMemoryCache cache,
            IDocumentRepository documentRepo,
            ILogger<ViewTrackingService> logger)
        {
            _cache = cache;
            _documentRepo = documentRepo;
            _logger = logger;
        }

        public async Task<bool> TryIncrementViewAsync(int documentId, int? userId, CancellationToken ct = default)
        {
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var cacheKey = $"view:{userId?.ToString() ?? "guest"}:{documentId}:{today}";

            // Check if view already tracked in memory cache
            if (_cache.TryGetValue(cacheKey, out _))
            {
                _logger.LogDebug(
                    "View already counted today: UserId={UserId}, DocId={DocumentId}, Date={Date}",
                    userId, documentId, today);
                return false;
            }

            var increased = await _documentRepo.IncreaseView(documentId, ct);
            if (!increased)
            {
                _logger.LogWarning(
                    "Failed to increase view count: DocId={DocumentId}",
                    documentId);
                return false;
            }

            // Set cache entry with expiration at end of day + 5 minutes
            var expiresAt = DateTime.UtcNow.Date.AddDays(1).AddMinutes(5);
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = expiresAt
            };

            _cache.Set(cacheKey, "1", cacheOptions);

            _logger.LogInformation(
                "View counted: UserId={UserId}, DocId={DocumentId}, Date={Date}",
                userId, documentId, today);

            return true;
        }
    }
}
