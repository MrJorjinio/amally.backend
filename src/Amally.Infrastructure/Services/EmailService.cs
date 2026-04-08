using System.Text;
using System.Text.Json;
using Amally.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Amally.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(HttpClient httpClient, IConfiguration config, ILogger<EmailService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailVerificationOtpAsync(string email, string otp)
    {
        var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f0;"">
  <div style=""max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
    <div style=""background:#69824f;padding:32px;text-align:center;"">
      <h1 style=""color:#ffffff;margin:0;font-size:24px;font-weight:600;"">Amally</h1>
    </div>
    <div style=""padding:32px;"">
      <h2 style=""color:#333;margin:0 0 8px;font-size:20px;"">Email tasdiqlash kodi</h2>
      <p style=""color:#666;margin:0 0 24px;font-size:14px;line-height:1.5;"">Ro'yxatdan o'tishni yakunlash uchun quyidagi kodni kiriting:</p>
      <div style=""background:#f5f5f0;border:2px solid #69824f;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;"">
        <span style=""font-size:32px;font-weight:700;letter-spacing:8px;color:#69824f;"">{otp}</span>
      </div>
      <p style=""color:#999;margin:0;font-size:12px;line-height:1.5;"">Bu kod 15 daqiqa ichida amal qiladi. Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xabarni e'tiborsiz qoldiring.</p>
    </div>
    <div style=""background:#f5f5f0;padding:16px;text-align:center;"">
      <p style=""color:#999;margin:0;font-size:11px;"">Amally - O'qituvchilar tajriba almashish platformasi</p>
    </div>
  </div>
</body>
</html>";

        await SendEmailAsync(email, "Amally - Email tasdiqlash kodi", html);
    }

    public async Task SendWelcomeEmailAsync(string email, string firstName)
    {
        var html = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f0;"">
  <div style=""max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
    <div style=""background:#69824f;padding:32px;text-align:center;"">
      <h1 style=""color:#ffffff;margin:0;font-size:24px;font-weight:600;"">Amally</h1>
    </div>
    <div style=""padding:32px;"">
      <h2 style=""color:#333;margin:0 0 8px;font-size:20px;"">Xush kelibsiz, {firstName}!</h2>
      <p style=""color:#666;margin:0 0 16px;font-size:14px;line-height:1.6;"">Amally platformasiga muvaffaqiyatli ro'yxatdan o'tdingiz. Endi siz o'z tajribalaringizni boshqa o'qituvchilar bilan baham ko'rishingiz mumkin.</p>
      <p style=""color:#666;margin:0;font-size:14px;line-height:1.6;"">Platformadan to'liq foydalanish uchun profilingizni to'ldiring va birinchi postingizni yozing!</p>
    </div>
    <div style=""background:#f5f5f0;padding:16px;text-align:center;"">
      <p style=""color:#999;margin:0;font-size:11px;"">Amally - O'qituvchilar tajriba almashish platformasi</p>
    </div>
  </div>
</body>
</html>";

        await SendEmailAsync(email, "Amally - Xush kelibsiz!", html);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        var apiKey = _config["Email:BrevoApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Brevo API key is not configured. Email to {Email} was not sent.", toEmail);
            return;
        }

        var payload = new
        {
            sender = new
            {
                name = _config["Email:FromName"] ?? "Amally",
                email = _config["Email:FromEmail"] ?? "noreply@amally.uz"
            },
            to = new[] { new { email = toEmail } },
            subject,
            htmlContent
        };

        var json = JsonSerializer.Serialize(payload);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("api-key", apiKey);

        try
        {
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Brevo API error {StatusCode}: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }
}
