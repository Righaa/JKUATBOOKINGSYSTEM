namespace JkuatHospitalApi.DTOs
{
    public class AppointmentDto
    {
        public int DoctorId { get; set; }

        public DateTime AppointmentDate { get; set; }

        public string Reason { get; set; } = string.Empty;
    }
}
