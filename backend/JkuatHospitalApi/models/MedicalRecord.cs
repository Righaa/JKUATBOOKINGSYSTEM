using System.ComponentModel.DataAnnotations;

namespace JkuatHospitalApi.Models
{
    public class MedicalRecord
    {
        [Key]
        public int Id { get; set; }

        public int PatientId { get; set; }

        public User Patient { get; set; } = null!;

        public int DoctorId { get; set; }

        public Doctor Doctor { get; set; } = null!;

        public int? AppointmentId { get; set; }

        public Appointment? Appointment { get; set; }

        public string Diagnosis { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public string Prescription { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
