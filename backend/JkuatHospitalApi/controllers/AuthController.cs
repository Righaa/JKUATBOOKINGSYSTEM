using BCrypt.Net;
using JkuatHospitalApi.Data;
using JkuatHospitalApi.DTOs;
using JkuatHospitalApi.Models;
using JkuatHospitalApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JkuatHospitalApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(
        ApplicationDbContext context,
        TokenService tokenService,
        DoctorAccountService doctorAccountService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await context.Users.AnyAsync(x => x.Email == dto.Email))
                return BadRequest(new { message = "Email already registered" });

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Patient"
            };
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });
            var validPassword = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!validPassword)
                return Unauthorized(new { message = "Invalid credentials" });
            var token = tokenService.CreateToken(user);
            return Ok(new { token });
        }

        [HttpPost("doctor-login")]
        public async Task<IActionResult> DoctorLogin(DoctorLoginDto dto)
        {
            var doctor = await context.Doctors.FindAsync(dto.DoctorId);
            if (doctor == null)
                return Unauthorized(new { message = "Invalid doctor ID or password" });

            var user = await doctorAccountService.EnsureDoctorUserAsync(doctor);

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid doctor ID or password" });

            var token = tokenService.CreateToken(user);

            return Ok(new
            {
                token,
                doctorId = doctor.DoctorId,
                doctorName = doctor.FullName
            });
        }
    }
}
