using JkuatHospitalApi.Data;
using JkuatHospitalApi.Models;
using JkuatHospitalApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController(
        ApplicationDbContext context,
        DoctorAccountService doctorAccountService) : ControllerBase
    {
        [HttpGet("specialties")]
        public IActionResult GetSpecialties()
        {
            return Ok(DoctorSpecialties.All);
        }

        [HttpGet]
        public async Task<IActionResult> GetDoctors([FromQuery] string? specialty)
        {
            var query = context.Doctors.AsQueryable();

            if (!string.IsNullOrWhiteSpace(specialty))
                query = query.Where(d => d.Specialty == specialty);

            return Ok(await query.OrderBy(d => d.Specialty).ThenBy(d => d.FullName).ToListAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateDoctor(Doctor doctor)
        {
            if (!DoctorSpecialties.IsValid(doctor.Specialty))
                return BadRequest($"Invalid specialty. Choose from: {string.Join(", ", DoctorSpecialties.All)}");

            doctor.Specialty = DoctorSpecialties.All.First(
                s => s.Equals(doctor.Specialty, StringComparison.OrdinalIgnoreCase));

            context.Doctors.Add(doctor);
            await context.SaveChangesAsync();

            await doctorAccountService.EnsureDoctorUserAsync(doctor);

            return Ok(new
            {
                doctor,
                doctorId = doctor.DoctorId,
                defaultPassword = doctorAccountService.DefaultPassword
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateDoctor(int id, Doctor updated)
        {
            var doctor = await context.Doctors
                .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
                return NotFound();

            if (!DoctorSpecialties.IsValid(updated.Specialty))
                return BadRequest($"Invalid specialty. Choose from: {string.Join(", ", DoctorSpecialties.All)}");

            doctor.FullName = updated.FullName;
            doctor.Email = updated.Email;
            doctor.Specialty = DoctorSpecialties.All.First(
                s => s.Equals(updated.Specialty, StringComparison.OrdinalIgnoreCase));
            doctor.PhoneNumber = updated.PhoneNumber ?? updated.Phone;

            await context.SaveChangesAsync();
            return Ok(doctor);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctor(int id)
        {
            var doctor = await context.Doctors
                .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
                return NotFound();

            await doctorAccountService.RemoveDoctorUserAsync(doctor.DoctorId);

            context.Doctors.Remove(doctor);
            await context.SaveChangesAsync();

            return Ok();
        }
    }
}
