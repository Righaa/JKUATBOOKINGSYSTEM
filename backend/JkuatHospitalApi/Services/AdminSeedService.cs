using JkuatHospitalApi.Data;
using JkuatHospitalApi.Models;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Services
{
    public class AdminSeedService(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AdminSeedService> logger)
    {
        public async Task SeedAsync()
        {
            if (await context.Users.AnyAsync(u => u.Role == "Admin"))
                return;

            var email = configuration["Auth:SeedAdminEmail"] ?? "admin@jkuat.ac.ke";
            var password = configuration["Auth:SeedAdminPassword"] ?? "Admin@123";
            var name = configuration["Auth:SeedAdminName"] ?? "System Admin";

            var existing = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (existing != null)
            {
                existing.Role = "Admin";
                existing.Name = name;
                existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                await context.SaveChangesAsync();
                logger.LogInformation("Promoted existing user {Email} to Admin", email);
                return;
            }

            context.Users.Add(new User
            {
                Name = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "Admin"
            });

            await context.SaveChangesAsync();
            logger.LogInformation("Seeded admin account {Email}", email);
        }
    }
}
