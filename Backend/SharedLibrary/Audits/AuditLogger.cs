using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace SharedLibrary.Audits
{
    public class AuditLogger
    {
        private readonly string _connectionString;

        public AuditLogger(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task LogAsync(AuditLogEntry entry)
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO activity_svc.AuditLog
                (ServiceName, TableName, Action, RecordID, PerformedBy, OldValues, NewValues)
                VALUES (@ServiceName, @TableName, @Action, @RecordID, @PerformedBy, @OldValues, @NewValues);
            ", conn);

            cmd.Parameters.AddWithValue("@ServiceName", entry.ServiceName);
            cmd.Parameters.AddWithValue("@TableName", entry.TableName);
            cmd.Parameters.AddWithValue("@Action", entry.Action);
            cmd.Parameters.AddWithValue("@RecordID", entry.RecordID);
            cmd.Parameters.AddWithValue("@PerformedBy", (object?)entry.PerformedBy ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@OldValues", (object?)entry.OldValues ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@NewValues", (object?)entry.NewValues ?? DBNull.Value);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }

        public async Task LogAsync<T>(
            string serviceName, string tableName, string action, string recordId,
            int? performedBy, T? oldObj, T? newObj)
        {
            var entry = new AuditLogEntry
            {
                ServiceName = serviceName,
                TableName = tableName,
                Action = action,
                RecordID = recordId,
                PerformedBy = performedBy,
                OldValues = oldObj != null ? JsonSerializer.Serialize(oldObj) : null,
                NewValues = newObj != null ? JsonSerializer.Serialize(newObj) : null
            };

            await LogAsync(entry);
        }
    }
}
