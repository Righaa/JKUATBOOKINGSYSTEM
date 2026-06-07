using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JkuatHospitalApi.Models
{
    public class Schedule
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public int DoctorId { get; set; }

        [ForeignKey("DoctorId")]
        public Doctor Doctor { get; set; } = null!;

        public int? PatientId { get; set; }

        [ForeignKey("PatientId")]
        public Patient? Patient { get; set; }
    }
}