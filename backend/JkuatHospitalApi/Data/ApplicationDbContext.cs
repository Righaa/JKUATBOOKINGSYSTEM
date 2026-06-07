using JkuatHospitalApi.Models;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Doctor> Doctors { get; set; } = null!;
        public DbSet<Patient> Patients { get; set; } = null!;
        public DbSet<Appointment> Appointments { get; set; } = null!;
        public DbSet<Schedule> Schedules { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<MedicalRecord> MedicalRecords { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Patient)
                .WithMany()
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Doctor)
                .WithMany()
                .HasForeignKey(u => u.DoctorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Patient)
                .WithMany()
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Doctor)
                .WithMany()
                .HasForeignKey(m => m.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MedicalRecord>()
                .HasOne(m => m.Appointment)
                .WithMany()
                .HasForeignKey(m => m.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
