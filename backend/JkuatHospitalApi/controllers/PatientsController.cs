using System.Security.Claims;
using System.Text.RegularExpressions;
using JkuatHospitalApi.Data;
using JkuatHospitalApi.DTOs;
using JkuatHospitalApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController(ApplicationDbContext context) : ControllerBase
    {
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public Task<List<Patient>> GetPatients() => context.Patients.ToListAsync();

        [HttpGet("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                age = user.Age
            });
        }

        [HttpPut("profile")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await context.Users.FindAsync(userId);

            if (user == null)
                return NotFound();

            user.Name = dto.Name ?? user.Name;
            user.Phone = dto.Phone ?? user.Phone;
            user.Age = dto.Age > 0 ? dto.Age : user.Age;

            await context.SaveChangesAsync();

            return Ok(new
            {
                name = user.Name,
                email = user.Email,
                phone = user.Phone,
                age = user.Age
            });
        }

        [HttpPut("change-password")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var user = await context.Users.FindAsync(userId);

            if (user == null)
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

        [HttpGet("appointments")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var appointments = await context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.PatientId == userId)
                .ToListAsync();

            return Ok(appointments.Select(a => new
            {
                id = a.AppointmentId,
                doctorName = a.Doctor.FullName,
                doctorSpecialty = a.Doctor.Specialty,
                patientName = a.Patient.Name,
                appointmentDate = a.AppointmentDate,
                status = a.Status,
                reason = a.Reason
            }));
        }

        [HttpGet("medical-records")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyMedicalRecords()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var records = await context.MedicalRecords
                .Where(r => r.PatientId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id = r.Id,
                    diagnosis = r.Diagnosis,
                    notes = r.Notes,
                    prescription = r.Prescription,
                    createdAt = r.CreatedAt,
                    doctorId = r.DoctorId
                })
                .ToListAsync();

            return Ok(records);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Patient>> GetPatient(int id)
        {
            return await context.Patients.FindAsync(id)
                ?? (ActionResult<Patient>)NotFound();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Patient>> PostPatient(Patient patient)
        {
            context.Patients.Add(patient);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPatient(int id, Patient patient)
        {
            if (id != patient.Id) return BadRequest();

            context.Entry(patient).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!context.Patients.Any(p => p.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var patient = await context.Patients.FindAsync(id);
            if (patient == null) return NotFound();

            context.Patients.Remove(patient);
            await context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class UserProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int Age { get; set; }
    }
}
