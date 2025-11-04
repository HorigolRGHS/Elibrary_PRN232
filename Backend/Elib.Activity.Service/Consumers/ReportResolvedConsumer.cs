using MassTransit;
using SharedLibrary.Messages;
using Elib.Activity.Service.Services;
using Elib.Activity.Service.DTOs;

namespace Elib.Activity.Service.Consumers
{
    public class ReportResolvedConsumer : IConsumer<ReportResolved>
    {
        private readonly INotificationService _notificationService;

        public ReportResolvedConsumer(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Consume(ConsumeContext<ReportResolved> context)
        {
            var msg = context.Message;

            Console.WriteLine($"[ReportResolvedConsumer] Received ReportResolved event for ReportId={msg.ReportId}");
            Console.WriteLine($"[ReportResolvedConsumer] Details => ResolvedBy={msg.ResolvedBy}, ReportedBy={msg.ReportedBy}, Title=\"{msg.ReportTitle}\"");

            try
            {
                var dto = new NotificationCreateCustomDTO
                {
                    Title = "Your report has been resolved",
                    Content = $"Your report \"{msg.ReportTitle}\" has been reviewed and resolved by the admin. Thank you for your feedback!",
                    ScheduledDate = DateTime.UtcNow,
                    RecipientUserIds = new List<int> { msg.ReportedBy }
                };

                var result = await _notificationService.CreateCustomAsync(dto);

                if (result.Success)
                {
                    Console.WriteLine($"[ReportResolvedConsumer] Notification scheduled at {dto.ScheduledDate:yyyy-MM-dd HH:mm:ss} (UTC)");
                    Console.WriteLine($"[ReportResolvedConsumer] Custom notification sent to userId={msg.ReportedBy} for ReportId={msg.ReportId}");
                }
                else
                {
                    Console.WriteLine($"[ReportResolvedConsumer] Failed to send notification: {result.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ReportResolvedConsumer] Error while handling ReportId={msg.ReportId}: {ex.Message}");
            }
        }
    }
}
