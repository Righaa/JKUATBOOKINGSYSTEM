using System.ComponentModel.DataAnnotations;

namespace JkuatHospitalApi.Models
{
    public class Appointment
    {
        [Key]
        public int AppointmentId { get; set; }

        public int DoctorId { get; set; }

        public Doctor Doctor { get; set; } = null!;

        // Logged-in patient comes from Users table
        public int PatientId { get; set; }

        public User Patient { get; set; } = null!;

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";
    }
}
