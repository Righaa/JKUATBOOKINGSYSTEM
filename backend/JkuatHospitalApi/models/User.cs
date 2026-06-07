using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JkuatHospitalApi.Models
{
    [Table("Users")]
    public class User
    {
        public int Id { get; set; }

        [Required]
        [Column("FullName")]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "Patient";

        public string Phone { get; set; } = string.Empty;

        public int Age { get; set; }

        public int? DoctorId { get; set; }

        public Doctor? Doctor { get; set; }
    }
}