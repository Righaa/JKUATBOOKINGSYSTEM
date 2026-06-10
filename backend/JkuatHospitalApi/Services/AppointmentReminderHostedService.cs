using JkuatHospitalApi.Services.Sms;
using Microsoft.Extensions.Options;

namespace JkuatHospitalApi.Services
{
    public class AppointmentReminderHostedService(
        IServiceScopeFactory scopeFactory,
        IOptions<SmsSettings> smsOptions,
        ILogger<AppointmentReminderHostedService> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var intervalMinutes = Math.Max(5, smsOptions.Value.CheckIntervalMinutes);
            logger.LogInformation(
                "Appointment SMS reminder service started (every {Minutes} min)",
                intervalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var reminderService =
                        scope.ServiceProvider.GetRequiredService<AppointmentReminderService>();
                    var sent = await reminderService.SendDueRemindersAsync(stoppingToken);

                    if (sent > 0)
                        logger.LogInformation("Sent {Count} appointment SMS reminder(s)", sent);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Appointment reminder check failed");
                }

                await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
            }
        }
    }
}
