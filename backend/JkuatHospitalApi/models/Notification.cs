namespace JkuatHospitalApi.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool Read { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}    