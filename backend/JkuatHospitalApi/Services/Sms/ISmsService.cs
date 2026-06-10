namespace JkuatHospitalApi.Services.Sms
{
    public interface ISmsService
    {
        bool IsEnabled { get; }
        Task<bool> SendAsync(string phoneNumber, string message);
    }
}
