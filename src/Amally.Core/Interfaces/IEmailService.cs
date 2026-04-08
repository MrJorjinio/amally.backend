namespace Amally.Core.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationOtpAsync(string email, string otp);
    Task SendWelcomeEmailAsync(string email, string firstName);
}
