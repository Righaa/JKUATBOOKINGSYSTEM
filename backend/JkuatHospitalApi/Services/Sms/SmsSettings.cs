namespace JkuatHospitalApi.Services.Sms
{
    public class SmsSettings
    {
        public bool Enabled { get; set; }
        public string AccountSid { get; set; } = string.Empty;
        public string AuthToken { get; set; } = string.Empty;
        public string FromNumber { get; set; } = string.Empty;
        public int HoursBeforeAppointment { get; set; } = 24;
        public int CheckIntervalMinutes { get; set; } = 15;
    }
}
