namespace JkuatHospitalApi.DTOs
{
    public class MedicalRecordDto
    {
        public int PatientId { get; set; }

        public int? AppointmentId { get; set; }

        public string Diagnosis { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;

        public string Prescription { get; set; } = string.Empty;
    }
}
