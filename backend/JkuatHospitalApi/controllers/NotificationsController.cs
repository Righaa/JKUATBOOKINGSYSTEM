using JkuatHospitalApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(notifications.Select(n => new
            {
                id = n.Id,
                message = n.Message,
                read = n.Read,
                createdAt = n.CreatedAt
            }));
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            notification.Read = true;
            await context.SaveChangesAsync();

            return Ok(notification);
        }
    }
}
