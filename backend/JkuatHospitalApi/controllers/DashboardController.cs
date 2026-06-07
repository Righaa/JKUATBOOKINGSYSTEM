using JkuatHospitalApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            return Ok(new
            {
                patients = await context.Users.CountAsync(x => x.Role == "Patient"),
                doctors = await context.Doctors.CountAsync(),
                appointments = await context.Appointments.CountAsync()
            });
        }
    }
}
