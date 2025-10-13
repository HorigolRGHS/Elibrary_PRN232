using System.Globalization;
using System.Runtime.InteropServices;
using Elib.Activity.Service.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Elib.Activity.Service.Services
{
    public class NotificationSchedulerService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<NotificationSchedulerService> _logger;
        private readonly TimeZoneInfo _vietnamZone;

        public NotificationSchedulerService(IServiceScopeFactory scopeFactory, ILogger<NotificationSchedulerService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _vietnamZone = TimeZoneInfo.FindSystemTimeZoneById(
                RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                    ? "SE Asia Standard Time"         // Windows
                    : "Asia/Ho_Chi_Minh"              // Linux/macOS
            );
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {


            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<DbContext>();

    
                    var nowVN = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _vietnamZone);


                    var dueNotifications = await db.Set<Notification>()
                        .Where(n => n.Status == "Pending" && n.ScheduledDate <= nowVN)
                        .ToListAsync(stoppingToken);

                    foreach (var notif in dueNotifications)
                    {
                        notif.Status = "Sent";
                        notif.UpdatedDate = DateTime.UtcNow;

                    }

                    if (dueNotifications.Count > 0)
                    {
                        await db.SaveChangesAsync(stoppingToken);
        
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Notification Scheduler Service.");
                }

                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }

            _logger.LogInformation("Notification Scheduler Service stopped.");
        }
    }
}
