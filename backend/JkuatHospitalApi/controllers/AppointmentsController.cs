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
        private static object MapAppointment(Appointment a) => new
        {
            id = a.AppointmentId,
            patientId = a.PatientId,
            doctorName = a.Doctor.FullName,
            doctorSpecialty = a.Doctor.Specialty,
            patientName = a.Patient.Name,
            appointmentDate = a.AppointmentDate,
            status = a.Status,
            reason = a.Reason
        };

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

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .ToListAsync();

            return Ok(appointments.Select(MapAppointment));
        }

        [HttpGet("recent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetRecentAppointments()
        {
            var appointments = await context.Appointments
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

            var appointments = await context.Appointments
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
            var appointments = await context.Appointments
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .Where(a => a.AppointmentDate.Month == month && a.AppointmentDate.Year == year)
                .ToListAsync();

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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveAppointment(int id)
        {
            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound();

            appointment.Status = "Approved";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"Appointment with Dr. {appointment.Doctor.FullName} was approved for {appointment.Patient.Name}",
                "AppointmentApproved",
                new { appointmentId = id });

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectAppointment(int id)
        {
            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound();

            appointment.Status = "Rejected";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"Appointment with Dr. {appointment.Doctor.FullName} was rejected for {appointment.Patient.Name}",
                "AppointmentRejected",
                new { appointmentId = id });

            return Ok(MapAppointment(appointment));
        }

        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var appointment = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
                return NotFound();

            if (appointment.PatientId != userId)
                return Forbid();

            if (appointment.Status is not ("Pending" or "Approved"))
                return BadRequest(new { message = "Only pending or approved appointments can be cancelled" });

            appointment.Status = "Cancelled";
            await context.SaveChangesAsync();

            await notifications.NotifyAllAsync(
                $"{appointment.Patient.Name} cancelled appointment with Dr. {appointment.Doctor.FullName}",
                "AppointmentCancelled",
                new { appointmentId = id });

            return Ok(MapAppointment(appointment));
        }
    }
}
