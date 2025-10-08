using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json;

namespace SharedLibrary.Audits
{
    public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly AuditLogger _logger;
        private readonly AuditOptions _options;
        private readonly ICurrentUserAccessor? _user;

        public AuditSaveChangesInterceptor(
            AuditLogger logger,
            Microsoft.Extensions.Options.IOptions<AuditOptions> options,
            ICurrentUserAccessor? user = null)
        {
            _logger = logger;
            _options = options.Value;
            _user = user;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var ctx = eventData.Context;
            if (ctx is null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

            var entries = ctx.ChangeTracker.Entries()
                .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
                .Where(e => !e.IsAuditLogTable()) // tránh tự log bảng AuditLog
                .ToList();

            var performedBy = _user?.GetUserId();

            foreach (var e in entries)
            {
                var table = e.GetSchemaQualifiedTableName();
                var recordId = e.GetRecordIdString();

                string action = e.State switch
                {
                    EntityState.Added => "INSERT",
                    EntityState.Modified => "UPDATE",
                    EntityState.Deleted => "DELETE",
                    _ => "UNKNOWN"
                };

                string? oldJson = null;
                string? newJson = null;

                if (e.State == EntityState.Added)
                {
                    var cur = e.Properties.ToDictionary(p => p.Metadata.Name, p => p.CurrentValue);
                    newJson = JsonSerializer.Serialize(cur);
                }
                else if (e.State == EntityState.Deleted)
                {
                    var org = e.Properties.ToDictionary(p => p.Metadata.Name, p => p.OriginalValue);
                    oldJson = JsonSerializer.Serialize(org);
                }
                else // Modified
                {
                    var changedProps = e.Properties.Where(p => p.IsModified).ToList();
                    var org = changedProps.ToDictionary(p => p.Metadata.Name, p => p.OriginalValue);
                    var cur = changedProps.ToDictionary(p => p.Metadata.Name, p => p.CurrentValue);
                    if (org.Count > 0) oldJson = JsonSerializer.Serialize(org);
                    if (cur.Count > 0) newJson = JsonSerializer.Serialize(cur);
                }

                await _logger.LogAsync(new AuditLogEntry
                {
                    ServiceName = _options.ServiceName,
                    TableName = table,
                    Action = action,
                    RecordID = recordId,
                    PerformedBy = performedBy,
                    OldValues = oldJson,
                    NewValues = newJson
                });
            }

            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}
