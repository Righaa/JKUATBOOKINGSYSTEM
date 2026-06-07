using System.ComponentModel.DataAnnotations;

namespace JkuatHospitalApi.Models
{
    public class Patient
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public int Age { get; set; }

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        // Optional
        public string? PhoneNumber { get; set; }
    }
}