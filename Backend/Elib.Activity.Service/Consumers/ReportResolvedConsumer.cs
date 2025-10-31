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
            Console.WriteLine($"[ReportResolvedConsumer] Details => ResolvedBy={msg.ResolvedBy}, Title=\"{msg.ReportTitle}\"");

            try
            {
         
                var dto = new NotificationCreateDTO
                {
                    Title = "Report resolved",
                    Content = $"The report for this document has been successfully reviewed and addressed based on the provided reasons.\n\nReason: {msg.ReportTitle}",
                    Type = "System",
                    ScheduledDate = DateTime.UtcNow,
                    CreatedBy = msg.ResolvedBy,
                    Status = "Sent"
                };

                var result = await _notificationService.CreateAsync(dto);

                if (result.Success)
                {
                    Console.WriteLine($"[ReportResolvedConsumer] Notification created for ReportId={msg.ReportId}, CreatedBy={msg.ResolvedBy}");
                }
                else
                {
                    Console.WriteLine($"[ReportResolvedConsumer] Failed to create notification: {result.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ReportResolvedConsumer] Error while handling ReportId={msg.ReportId}: {ex.Message}");
            }
        }
    }
}
