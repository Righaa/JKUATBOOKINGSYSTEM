using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;

namespace JkuatHospitalApi.Services.Sms
{
    public class TwilioSmsService(
        IOptions<SmsSettings> options,
        IHttpClientFactory httpClientFactory,
        ILogger<TwilioSmsService> logger) : ISmsService
    {
        private readonly SmsSettings _settings = options.Value;

        public bool IsEnabled =>
            _settings.Enabled &&
            !string.IsNullOrWhiteSpace(_settings.AccountSid) &&
            !string.IsNullOrWhiteSpace(_settings.AuthToken) &&
            !string.IsNullOrWhiteSpace(_settings.FromNumber);

        public async Task<bool> SendAsync(string phoneNumber, string message)
        {
            var to = NormalizePhone(phoneNumber);
            if (string.IsNullOrEmpty(to))
            {
                logger.LogWarning("SMS skipped: invalid phone number {Phone}", phoneNumber);
                return false;
            }

            if (!IsEnabled)
            {
                logger.LogInformation(
                    "SMS disabled — would send to {Phone}: {Message}",
                    to,
                    message);
                return false;
            }

            try
            {
                var client = httpClientFactory.CreateClient("Twilio");
                var url =
                    $"https://api.twilio.com/2010-04-01/Accounts/{_settings.AccountSid}/Messages.json";

                var content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["To"] = to,
                    ["From"] = _settings.FromNumber.Trim(),
                    ["Body"] = message,
                });

                var credentials = Convert.ToBase64String(
                    Encoding.ASCII.GetBytes($"{_settings.AccountSid}:{_settings.AuthToken}"));
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Basic", credentials);

                var response = await client.PostAsync(url, content);
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("SMS sent to {Phone}", to);
                    return true;
                }

                var body = await response.Content.ReadAsStringAsync();
                logger.LogError(
                    "Twilio SMS failed ({Status}) for {Phone}: {Body}",
                    response.StatusCode,
                    to,
                    body);
                return false;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "SMS send failed for {Phone}", to);
                return false;
            }
        }

        public static string? NormalizePhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return null;

            var digits = new string(phone.Where(c => char.IsDigit(c) || c == '+').ToArray());
            if (digits.StartsWith('+'))
                digits = digits[1..];

            if (digits.StartsWith("0") && digits.Length >= 10)
                return "+254" + digits[1..];

            if (digits.StartsWith("254"))
                return "+" + digits;

            if (digits.Length == 9)
                return "+254" + digits;

            return "+" + digits;
        }
    }
}
