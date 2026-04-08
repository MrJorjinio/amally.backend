using Amally.Core.Entities;

namespace Amally.Core.Interfaces;

public interface IOtpRepository
{
    Task CreateAsync(EmailVerificationOtp otp);
    Task<EmailVerificationOtp?> GetValidOtpAsync(string email, string code);
    Task MarkAsUsedAsync(Guid id);
    Task DeleteExpiredAsync();
}
