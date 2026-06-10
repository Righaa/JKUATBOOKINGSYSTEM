using System.Security.Claims;
using JkuatHospitalApi.Data;
using JkuatHospitalApi.DTOs;
using JkuatHospitalApi.Models;
using JkuatHospitalApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController(
        ApplicationDbContext context,
        NotificationService notifications) : ControllerBase
    {
        private const string RejectedStatus = "Rejected";

        private static object MapAppointment(Appointment a) => new
        {
            id = a.AppointmentId,
            patientId = a.PatientId,
            doctorName = a.Doctor.FullName,
            doctorSpecialty = a.Doctor.Specialty,
            patientName = a.Patient.Name,
            appointmentDate = a.AppointmentDate,
            status = a.Status,
            reason = a.Reason,
            rejectionReason = a.RejectionReason
        };

        private static IQueryable<Appointment> ExcludeRejected(IQueryable<Appointment> query) =>
            query.Where(a => a.Status != RejectedStatus);

        private async Task<Doctor?> GetCurrentDoctorAsync()
        {
            var doctorIdClaim = User.FindFirstValue("doctorId");
            if (int.TryParse(doctorIdClaim, out var doctorId))
            {
                var doctor = await context.Doctors.FindAsync(doctorId);
                if (doctor != null)
                    return doctor;
            }

            var email = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email))
                return null;

            return await context.Doctors.FirstOrDefaultAsync(d => d.Email == email);
        }

        private async Task<(Appointment? Appointment, IActionResult? Error)> GetManagedAppointmentAsync(int id)
        {
            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return (null, NotFound());

            if (User.IsInRole("Admin"))
                return (appointment, null);

            if (User.IsInRole("Doctor"))
            {
                var doctor = await GetCurrentDoctorAsync();
                if (doctor == null || appointment.DoctorId != doctor.DoctorId)
                    return (null, Forbid());
                return (appointment, null);
            }

            return (null, Forbid());
        }

        private async Task<(Appointment? Appointment, IActionResult? Error)> GetCancellableAppointmentAsync(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return (null, NotFound());

            if (User.IsInRole("Admin"))
                return (appointment, null);

            if (appointment.PatientId == userId)
                return (appointment, null);

            if (User.IsInRole("Doctor"))
            {
                var doctor = await GetCurrentDoctorAsync();
                if (doctor != null && appointment.DoctorId == doctor.DoctorId)
                    return (appointment, null);
            }

            return (null, Forbid());
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await ExcludeRejected(context.Appointments)
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .ToListAsync();

            return Ok(appointments.Select(MapAppointment));
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentAppointments()
        {
            var appointments = await ExcludeRejected(context.Appointments)
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .OrderByDescending(a => a.AppointmentDate)
                .Take(5)
                .ToListAsync();

            return Ok(appointments.Select(MapAppointment));
        }

        [HttpGet("doctor")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorAppointments()
        {
            var doctor = await GetCurrentDoctorAsync();

            if (doctor == null)
                return Ok(Array.Empty<object>());

            var appointments = await ExcludeRejected(context.Appointments)
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.DoctorId == doctor.DoctorId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(appointments.Select(MapAppointment));
        }

        [HttpGet("calendar")]
        [Authorize]
        public async Task<IActionResult> GetCalendarAppointments(int month, int year)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var query = ExcludeRejected(context.Appointments)
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.AppointmentDate.Month == month && a.AppointmentDate.Year == year);

            if (User.IsInRole("Doctor"))
            {
                var doctor = await GetCurrentDoctorAsync();
                if (doctor == null)
                    return Ok(Array.Empty<object>());
                query = query.Where(a => a.DoctorId == doctor.DoctorId);
            }
            else if (User.IsInRole("Patient"))
            {
                query = query.Where(a => a.PatientId == userId);
            }

            var appointments = await query.ToListAsync();
            return Ok(appointments.Select(MapAppointment));
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> CreateAppointment(AppointmentDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var patient = await context.Users.FindAsync(userId);

            if (patient == null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(patient.Name) ||
                string.IsNullOrWhiteSpace(patient.Phone) ||
                patient.Age <= 0)
            {
                return BadRequest(new { message = "Complete your patient profile before booking an appointment." });
            }

            var doctorExists = await context.Doctors.AnyAsync(d => d.DoctorId == dto.DoctorId);
            if (!doctorExists)
                return BadRequest(new { message = "Selected doctor is not available." });

            var slotTaken = await context.Appointments.AnyAsync(a =>
                a.DoctorId == dto.DoctorId &&
                a.AppointmentDate == dto.AppointmentDate &&
                a.Status != RejectedStatus &&
                a.Status != "Cancelled");

            if (slotTaken)
                return BadRequest(new { message = "This doctor already has an appointment at the selected date and time." });

            var appointment = new Appointment
            {
                DoctorId = dto.DoctorId,
                PatientId = userId,
                AppointmentDate = dto.AppointmentDate,
                Reason = dto.Reason
            };

            context.Appointments.Add(appointment);
            await context.SaveChangesAsync();

            var doctor = await context.Doctors.FindAsync(dto.DoctorId);
            var patientName = patient?.Name ?? "A patient";
            var doctorName = doctor?.FullName ?? "a doctor";

            await notifications.NotifyAllAsync(
                $"New appointment request from {patientName} with Dr. {doctorName}",
                "AppointmentCreated",
                new { appointmentId = appointment.AppointmentId });

            await context.Entry(appointment).Reference(a => a.Doctor).LoadAsync();
            await context.Entry(appointment).Reference(a => a.Patient).LoadAsync();

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> ApproveAppointment(int id)
        {
            var (appointment, error) = await GetManagedAppointmentAsync(id);
            if (error != null)
                return error;

            if (appointment!.Status != "Pending")
                return BadRequest(new { message = "Only pending appointments can be approved" });

            appointment.Status = "Approved";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"Appointment with Dr. {appointment.Doctor.FullName} was approved for {appointment.Patient.Name}",
                "AppointmentApproved",
                new { appointmentId = id },
                appointment.PatientId);

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> RejectAppointment(int id, [FromBody] RejectAppointmentDto dto)
        {
            var (appointment, error) = await GetManagedAppointmentAsync(id);
            if (error != null)
                return error;

            if (appointment!.Status != "Pending")
                return BadRequest(new { message = "Only pending appointments can be rejected" });

            var rejectionReason = dto.Reason?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(rejectionReason))
                return BadRequest(new { message = "A rejection reason is required" });

            appointment.Status = RejectedStatus;
            appointment.RejectionReason = rejectionReason;
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"Appointment with Dr. {appointment.Doctor.FullName} was rejected for {appointment.Patient.Name}. Reason: {rejectionReason}",
                "AppointmentRejected",
                new { appointmentId = id, rejectionReason },
                appointment.PatientId);

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var (appointment, error) = await GetCancellableAppointmentAsync(id);
            if (error != null)
                return error;

            if (appointment!.Status is not ("Pending" or "Approved"))
                return BadRequest(new { message = "Only pending or approved appointments can be cancelled" });

            appointment.Status = "Cancelled";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"{appointment.Patient.Name} cancelled appointment with Dr. {appointment.Doctor.FullName}",
                "AppointmentCancelled",
                new { appointmentId = id },
                appointment.PatientId);

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> CompleteAppointment(int id)
        {
            var (appointment, error) = await GetManagedAppointmentAsync(id);
            if (error != null)
                return error;

            if (appointment!.Status != "Approved")
                return BadRequest(new { message = "Only approved appointments can be marked as completed" });

            appointment.Status = "Completed";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"Appointment with Dr. {appointment.Doctor.FullName} for {appointment.Patient.Name} was completed",
                "AppointmentCompleted",
                new { appointmentId = id },
                appointment.PatientId);

            return Ok(MapAppointment(appointment));
        }
    }
}
