using JkuatHospitalApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController(ApplicationDbContext context) : ControllerBase
    {
        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        private bool IsPatient() =>
            User.IsInRole("Patient");

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userId = GetUserId();
            var query = context.Notifications.AsQueryable();

            if (IsPatient())
                query = query.Where(n => n.UserId == userId);
            else if (User.IsInRole("Doctor"))
                query = query.Where(n => n.UserId == null);

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();

            return Ok(notifications.Select(n => new
            {
                id = n.Id,
                message = n.Message,
                read = n.Read,
                createdAt = DateTime.SpecifyKind(n.CreatedAt, DateTimeKind.Utc),
            }));
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            var notification = await context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            if (IsPatient() && notification.UserId != userId)
                return Forbid();

            if (User.IsInRole("Doctor") && notification.UserId != null)
                return Forbid();

            notification.Read = true;
            await context.SaveChangesAsync();

            return Ok(new
            {
                notification.Id,
                notification.Message,
                notification.Read,
                createdAt = DateTime.SpecifyKind(notification.CreatedAt, DateTimeKind.Utc),
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetUserId();
            var notification = await context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            if (IsPatient() && notification.UserId != userId)
                return Forbid();

            if (User.IsInRole("Doctor") && notification.UserId != null)
                return Forbid();

            context.Notifications.Remove(notification);
            await context.SaveChangesAsync();

            return NoContent();
        }
    }
}
