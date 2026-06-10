using System.Security.Claims;
using System.Text.RegularExpressions;
using JkuatHospitalApi.Data;
using JkuatHospitalApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
        {
            var dashboard = new
            {
                patients = await context.Patients.CountAsync(cancellationToken),
                doctors = await context.Doctors.CountAsync(cancellationToken),
                appointments = await context.Appointments.CountAsync(cancellationToken),
                users = await context.Users.CountAsync(cancellationToken)
            };

            return Ok(dashboard);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await context.Users.FindAsync(userId);

            if (user == null || user.Role != "Admin")
                return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect" });

            if (!Regex.IsMatch(dto.NewPassword,
                @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?""':{}|<>_\-+=[\]\\;/']).{8,}$"))
                return BadRequest(new { message = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully" });
        }
    }
}
