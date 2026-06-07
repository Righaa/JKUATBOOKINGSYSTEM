using JkuatHospitalApi.Data;
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
    }
}
