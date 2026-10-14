using System.Text.Json;
using System.Text.Json.Serialization;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

// Configure JSON serialization (camelCase, string enums)
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
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

app.MapGet("/", () => Results.Ok(new
{
    app = "Bandrek API Server",
    status = "running",
    version = "1.0.0",
    docs = "/openapi/v1.json"
}));

app.Run();
