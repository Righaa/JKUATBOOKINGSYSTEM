using Microsoft.AspNetCore.SignalR;

namespace JkuatHospitalApi.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendNotification(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        public async Task SendAppointmentApproved(object data)
        {
            await Clients.All.SendAsync("AppointmentApproved", data);
        }

        public async Task SendAppointmentRejected(object data)
        {
            await Clients.All.SendAsync("AppointmentRejected", data);
        }
    }
}
