using Amally.Core.Entities;
using Amally.Core.Interfaces;
using Amally.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Repositories;

public class OtpRepository : IOtpRepository
{
    private readonly AmallyDbContext _db;

    public OtpRepository(AmallyDbContext db) => _db = db;

    public async Task CreateAsync(EmailVerificationOtp otp)
    {
        _db.EmailVerificationOtps.Add(otp);
        await _db.SaveChangesAsync();
    }

    public async Task<EmailVerificationOtp?> GetValidOtpAsync(string email, string code)
    {
        return await _db.EmailVerificationOtps
            .Where(o => o.Email == email.ToLower()
                && o.OtpCode == code
                && !o.IsUsed
                && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task MarkAsUsedAsync(Guid id)
    {
        var otp = await _db.EmailVerificationOtps.FindAsync(id);
        if (otp is not null)
        {
            otp.IsUsed = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task DeleteExpiredAsync()
    {
        var expired = await _db.EmailVerificationOtps
            .Where(o => o.ExpiresAt < DateTime.UtcNow || o.IsUsed)
            .ToListAsync();

        _db.EmailVerificationOtps.RemoveRange(expired);
        await _db.SaveChangesAsync();
    }
}
