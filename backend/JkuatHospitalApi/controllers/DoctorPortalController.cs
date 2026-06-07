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
    [Route("api/doctor-portal")]
    [Authorize(Roles = "Doctor")]
    public class DoctorPortalController(
        ApplicationDbContext context,
        NotificationService notifications) : ControllerBase
    {
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

        private Task<bool> HasPatientRelationshipAsync(int doctorId, int patientId) =>
            context.Appointments.AnyAsync(a =>
                a.DoctorId == doctorId && a.PatientId == patientId);

        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            var doctor = await GetCurrentDoctorAsync();
            if (doctor == null)
                return Ok(Array.Empty<object>());

            var patientIds = await context.Appointments
                .Where(a => a.DoctorId == doctor.DoctorId)
                .Select(a => a.PatientId)
                .Distinct()
                .ToListAsync();

            var patients = await context.Users
                .Where(u => patientIds.Contains(u.Id))
                .Select(u => new
                {
                    id = u.Id,
                    name = u.Name,
                    email = u.Email,
                    phone = u.Phone,
                    age = u.Age,
                    appointmentCount = context.Appointments.Count(a =>
                        a.DoctorId == doctor.DoctorId && a.PatientId == u.Id)
                })
                .OrderBy(u => u.name)
                .ToListAsync();

            return Ok(patients);
        }

        [HttpGet("patients/{patientId}")]
        public async Task<IActionResult> GetPatient(int patientId)
        {
            var doctor = await GetCurrentDoctorAsync();
            if (doctor == null)
                return NotFound();

            if (!await HasPatientRelationshipAsync(doctor.DoctorId, patientId))
                return Forbid();

            var patient = await context.Users.FindAsync(patientId);
            if (patient == null)
                return NotFound();

            var appointments = await context.Appointments
                .Where(a => a.DoctorId == doctor.DoctorId && a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    id = a.AppointmentId,
                    appointmentDate = a.AppointmentDate,
                    status = a.Status,
                    reason = a.Reason
                })
                .ToListAsync();

            return Ok(new
            {
                id = patient.Id,
                name = patient.Name,
                email = patient.Email,
                phone = patient.Phone,
                age = patient.Age,
                appointments
            });
        }

        [HttpGet("patients/{patientId}/records")]
        public async Task<IActionResult> GetPatientRecords(int patientId)
        {
            var doctor = await GetCurrentDoctorAsync();
            if (doctor == null)
                return NotFound();

            if (!await HasPatientRelationshipAsync(doctor.DoctorId, patientId))
                return Forbid();

            var records = await context.MedicalRecords
                .Where(r => r.DoctorId == doctor.DoctorId && r.PatientId == patientId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id = r.Id,
                    patientId = r.PatientId,
                    appointmentId = r.AppointmentId,
                    diagnosis = r.Diagnosis,
                    notes = r.Notes,
                    prescription = r.Prescription,
                    createdAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(records);
        }

        [HttpPost("records")]
        public async Task<IActionResult> CreateRecord(MedicalRecordDto dto)
        {
            var doctor = await GetCurrentDoctorAsync();
            if (doctor == null)
                return NotFound();

            if (!await HasPatientRelationshipAsync(doctor.DoctorId, dto.PatientId))
                return Forbid();

            if (dto.AppointmentId.HasValue)
            {
                var appointmentExists = await context.Appointments.AnyAsync(a =>
                    a.AppointmentId == dto.AppointmentId &&
                    a.DoctorId == doctor.DoctorId &&
                    a.PatientId == dto.PatientId);

                if (!appointmentExists)
                    return BadRequest("Invalid appointment for this patient.");
            }

            var record = new MedicalRecord
            {
                PatientId = dto.PatientId,
                DoctorId = doctor.DoctorId,
                AppointmentId = dto.AppointmentId,
                Diagnosis = dto.Diagnosis ?? string.Empty,
                Notes = dto.Notes ?? string.Empty,
                Prescription = dto.Prescription ?? string.Empty
            };

            context.MedicalRecords.Add(record);
            await context.SaveChangesAsync();

            var patient = await context.Users.FindAsync(dto.PatientId);
            var patientName = patient?.Name ?? "patient";

            await notifications.NotifyAllAsync(
                $"Dr. {doctor.FullName} added a medical record for {patientName}: {record.Diagnosis}",
                "MedicalRecordCreated",
                new { recordId = record.Id, patientId = dto.PatientId });

            return Ok(new
            {
                id = record.Id,
                patientId = record.PatientId,
                appointmentId = record.AppointmentId,
                diagnosis = record.Diagnosis,
                notes = record.Notes,
                prescription = record.Prescription,
                createdAt = record.CreatedAt
            });
        }

        [HttpPut("records/{id}")]
        public async Task<IActionResult> UpdateRecord(int id, MedicalRecordDto dto)
        {
            var doctor = await GetCurrentDoctorAsync();
            if (doctor == null)
                return NotFound();

            var record = await context.MedicalRecords.FindAsync(id);
            if (record == null)
                return NotFound();

            if (record.DoctorId != doctor.DoctorId)
                return Forbid();

            record.Diagnosis = dto.Diagnosis ?? record.Diagnosis;
            record.Notes = dto.Notes ?? record.Notes;
            record.Prescription = dto.Prescription ?? record.Prescription;

            await context.SaveChangesAsync();

            return Ok(new
            {
                id = record.Id,
                patientId = record.PatientId,
                appointmentId = record.AppointmentId,
                diagnosis = record.Diagnosis,
                notes = record.Notes,
                prescription = record.Prescription,
                createdAt = record.CreatedAt
            });
        }
    }
}
