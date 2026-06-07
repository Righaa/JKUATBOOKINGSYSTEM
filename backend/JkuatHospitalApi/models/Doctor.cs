using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JkuatHospitalApi.Models
{
    public class Doctor
    {
        [Key]
        public int DoctorId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Specialty { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        [NotMapped]
        public string Specialization { get; set; } = string.Empty;

        [NotMapped]
        public string Phone { get; set; } = string.Empty;

        public ICollection<Appointment> Appointments { get; set; } = [];
    }
}
