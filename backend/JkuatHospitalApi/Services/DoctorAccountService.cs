using JkuatHospitalApi.Data;
using JkuatHospitalApi.Models;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Services
{
    public class DoctorAccountService(ApplicationDbContext context, IConfiguration configuration)
    {
        public string DefaultPassword =>
            configuration["Auth:DefaultDoctorPassword"] ?? "Doctor@123";

        public async Task<User> EnsureDoctorUserAsync(Doctor doctor)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.DoctorId == doctor.DoctorId);

            if (user != null)
                return user;

            user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == doctor.Email && u.Role == "Doctor");

            if (user != null)
            {
                user.DoctorId = doctor.DoctorId;
                user.Name = doctor.FullName;
                await context.SaveChangesAsync();
                return user;
            }

            user = new User
            {
                Name = doctor.FullName,
                Email = doctor.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DefaultPassword),
                Role = "Doctor",
                DoctorId = doctor.DoctorId
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            return user;
        }

        public async Task RemoveDoctorUserAsync(int doctorId)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.DoctorId == doctorId);

            if (user == null)
                return;

            context.Users.Remove(user);
            await context.SaveChangesAsync();
        }
    }
}
