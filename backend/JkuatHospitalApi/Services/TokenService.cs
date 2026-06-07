using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JkuatHospitalApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace JkuatHospitalApi.Services
{
    public class TokenService(IConfiguration configuration)
    {
        public string CreateToken(User user)
        {
            Claim[] claims =
            [
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, user.Role)
            ];

            if (user.DoctorId is int doctorId)
            {
                claims =
                [
                    .. claims,
                    new Claim("doctorId", doctorId.ToString())
                ];
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? string.Empty)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
