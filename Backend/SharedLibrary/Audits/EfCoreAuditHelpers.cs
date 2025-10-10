using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace SharedLibrary.Audits
{
    internal static class EfCoreAuditHelpers
    {
        public static string GetSchemaQualifiedTableName(this EntityEntry entry)
        {
            var et = entry.Context.Model.FindEntityType(entry.Entity.GetType());
            var schema = et?.GetSchema() ?? "dbo";
            var table = et?.GetTableName() ?? entry.Entity.GetType().Name;
            return $"{schema}.{table}";
        }

        public static string GetRecordIdString(this EntityEntry entry)
        {
            var et = entry.Context.Model.FindEntityType(entry.Entity.GetType());
            var keys = et?.FindPrimaryKey()?.Properties;
            if (keys is null || keys.Count == 0) return "";

            var values = keys.Select(p =>
            {
                var propEntry = entry.Property(p.Name);
                var val = entry.State == EntityState.Deleted
                    ? propEntry.OriginalValue
                    : propEntry.CurrentValue;
                return $"{p.Name}={val}";
            });

            return string.Join("|", values);
        }

        public static bool IsAuditLogTable(this EntityEntry entry)
            => entry.GetSchemaQualifiedTableName()
                    .Equals("activity_svc.AuditLog", StringComparison.OrdinalIgnoreCase);
    }
}
