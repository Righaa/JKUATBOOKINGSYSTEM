using System.Security.Claims;
using System.Text;
using JkuatHospitalApi.Data;
using JkuatHospitalApi.Hubs;
using JkuatHospitalApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
    .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning))
);

builder.Services.AddSignalR();

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<DoctorAccountService>();
builder.Services.AddScoped<AdminSeedService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.NameIdentifier,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty)
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];

                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hub/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173", "http://localhost:5174")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await scope.ServiceProvider.GetRequiredService<AdminSeedService>().SeedAsync();
}

app.UseCors("AllowFrontend");

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var message = env.IsDevelopment() && ex != null
            ? ex.Message
            : "An unexpected error occurred. Please try again.";

        await context.Response.WriteAsJsonAsync(new { message });
    });
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<NotificationHub>("/hub/notifications");

app.Run();