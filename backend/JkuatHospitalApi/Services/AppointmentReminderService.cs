using JkuatHospitalApi.Data;
using JkuatHospitalApi.Services.Sms;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JkuatHospitalApi.Services
{
    public class AppointmentReminderService(
        ApplicationDbContext context,
        ISmsService smsService,
        NotificationService notifications,
        IOptions<SmsSettings> smsOptions,
        ILogger<AppointmentReminderService> logger)
    {
        public async Task<int> SendDueRemindersAsync(CancellationToken cancellationToken = default)
        {
            var settings = smsOptions.Value;
            var hoursBefore = Math.Max(1, settings.HoursBeforeAppointment);
            var now = DateTime.Now;
            var reminderEnd = now.AddHours(hoursBefore);

            var dueAppointments = await context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a =>
                    a.Status == "Approved" &&
                    a.ReminderSentAt == null &&
                    a.AppointmentDate > now &&
                    a.AppointmentDate <= reminderEnd)
                .ToListAsync(cancellationToken);

            var sentCount = 0;

            foreach (var appointment in dueAppointments)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var patient = appointment.Patient;
                var doctorName = appointment.Doctor?.FullName ?? "your doctor";
                var formattedDate = appointment.AppointmentDate.ToString("dddd, MMM d 'at' h:mm tt");

                var smsBody =
                    $"JKUAT Hospital reminder: Hi {patient.Name}, your appointment with Dr. {doctorName} is on {formattedDate}. Please arrive on time.";

                var inAppMessage =
                    $"Appointment reminder: Your visit with Dr. {doctorName} is on {formattedDate}.";

                var hasPhone = !string.IsNullOrWhiteSpace(patient.Phone);
                var smsSent = hasPhone && await smsService.SendAsync(patient.Phone, smsBody);

                if (smsService.IsEnabled && hasPhone && !smsSent)
                {
                    logger.LogWarning(
                        "SMS failed for appointment {Id}; will retry on next check",
                        appointment.AppointmentId);
                    continue;
                }

                if (!hasPhone)
                {
                    logger.LogWarning(
                        "No phone for patient {PatientId}; sending in-app reminder only",
                        patient.Id);
                }

                await notifications.NotifyAllAsync(
                    inAppMessage,
                    "AppointmentReminder",
                    new { appointmentId = appointment.AppointmentId },
                    patient.Id);

                appointment.ReminderSentAt = DateTime.UtcNow;
                sentCount++;
            }

            if (sentCount > 0)
                await context.SaveChangesAsync(cancellationToken);

            return sentCount;
        }
    }
}
