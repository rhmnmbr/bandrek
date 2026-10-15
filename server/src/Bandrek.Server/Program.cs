using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Features.Activities;
using Bandrek.Server.Features.Audit;
using Bandrek.Server.Features.Auth;
using Bandrek.Server.Features.LearningMatrix;
using Bandrek.Server.Features.Master;
using Bandrek.Server.Features.Realization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Configure ASP.NET Core Identity
builder.Services.AddIdentityCore<AppUser>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "BandrekSuperSecretSigningKeyForDevelopmentPurposes2026!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BandrekServer";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BandrekDesktopClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true
    };
});

builder.Services.AddAuthorization();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Bandrek.Server.Data.Seeding.DataSeeder>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<Bandrek.Server.Features.Audit.IAuditService, Bandrek.Server.Features.Audit.AuditService>();

// Business Rules & Services
builder.Services.AddSingleton<Bandrek.Server.Services.DateTimeProvider.IDateTimeProvider, Bandrek.Server.Services.DateTimeProvider.SystemDateTimeProvider>();
builder.Services.AddScoped<Bandrek.Server.Services.BusinessRules.ActivityStatusService>();
builder.Services.AddScoped<Bandrek.Server.Services.BusinessRules.ConflictDetector>();
builder.Services.AddScoped<Bandrek.Server.Services.BusinessRules.MasterUsageChecker>();
builder.Services.AddScoped<Bandrek.Server.Services.BusinessRules.LearningMatrixEngine>();
builder.Services.AddScoped<Bandrek.Server.Services.BusinessRules.ProfileKpiCalculator>();

// Configure JSON serialization (camelCase, string enums)
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Configure CORS for desktop client & dev browser
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Built-in OpenAPI in .NET 10
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTimeOffset.UtcNow,
    environment = app.Environment.EnvironmentName
}))
.WithName("GetHealth")
.WithTags("System");

// System info endpoint (DOMAIN.md §13 & ARCHITECTURE.md D10)
app.MapGet("/api/system/info", (IConfiguration config) =>
{
    var bimbelSection = config.GetSection("Bimbel");
    return Results.Ok(new
    {
        name = bimbelSection["Name"] ?? "Bandrek Bimbel",
        timezone = bimbelSection["Timezone"] ?? "Asia/Jakarta",
        serverVersion = bimbelSection["ServerVersion"] ?? "1.0.0",
        minClientVersion = bimbelSection["MinClientVersion"] ?? "1.0.0",
        serverTime = DateTimeOffset.UtcNow
    });
})
.WithName("GetSystemInfo")
.WithTags("System");

// Map Domain Endpoints
app.MapAuthEndpoints();
app.MapStudentEndpoints();
app.MapSubjectEndpoints();
app.MapClassGroupEndpoints();
app.MapCourseTopicEndpoints();
app.MapPlaceRoomEndpoints();
app.MapActivityTypeEndpoints();
app.MapActivityEndpoints();
app.MapRealizationEndpoints();
app.MapLearningMatrixEndpoints();
app.MapAuditEndpoints();

// Execute Seeding on startup if database is empty or --reset-seed is passed
try
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<Bandrek.Server.Data.Seeding.DataSeeder>();
    var forceReset = args.Contains("--reset-seed");
    await seeder.SeedAsync(forceReset);
}
catch (Exception ex)
{
    app.Logger.LogWarning(ex, "Could not seed database on startup (database may be unreachable or running during OpenAPI generation).");
}

app.Run();

public partial class Program { }

