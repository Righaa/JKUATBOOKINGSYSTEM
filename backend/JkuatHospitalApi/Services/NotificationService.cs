using JkuatHospitalApi.Data;
using JkuatHospitalApi.Hubs;
using JkuatHospitalApi.Models;
using Microsoft.AspNetCore.SignalR;

namespace JkuatHospitalApi.Services
{
    public class NotificationService(
        ApplicationDbContext context,
        IHubContext<NotificationHub> hub)
    {
        public async Task NotifyAllAsync(string message, string? eventName = null, object? eventData = null)
        {
            context.Notifications.Add(new Notification { Message = message });
            await context.SaveChangesAsync();

            await hub.Clients.All.SendAsync("ReceiveNotification", message);

            if (!string.IsNullOrEmpty(eventName))
                await hub.Clients.All.SendAsync(eventName, eventData ?? new { message });
        }
    }
}
