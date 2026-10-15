using System.Security.Claims;
using System.Text.Json;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;

namespace Bandrek.Server.Features.Audit;

public record AuditDiff(string Field, string OldValue, string NewValue);

public interface IAuditService
{
    Task LogAsync(
        string action,
        string category,
        string entityType,
        string entityName,
        string summary,
        IEnumerable<AuditDiff>? diffs = null,
        HttpContext? httpContext = null,
        AppUser? explicitUser = null,
        CancellationToken ct = default);
}

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        AppDbContext db,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuditService> logger)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogAsync(
        string action,
        string category,
        string entityType,
        string entityName,
        string summary,
        IEnumerable<AuditDiff>? diffs = null,
        HttpContext? httpContext = null,
        AppUser? explicitUser = null,
        CancellationToken ct = default)
    {
        try
        {
            var ctx = httpContext ?? _httpContextAccessor.HttpContext;

            string? userId = explicitUser?.Id;
            string operatorName = explicitUser?.FullName ?? string.Empty;
            string operatorUsername = explicitUser?.UserName ?? string.Empty;
            string operatorRole = explicitUser?.Role ?? UserRoles.Operator;
            string? ipAddress = ctx?.Connection?.RemoteIpAddress?.ToString();

            if (ctx?.User?.Identity?.IsAuthenticated == true && explicitUser == null)
            {
                userId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier);
                var givenName = ctx.User.FindFirstValue(ClaimTypes.GivenName);
                var name = ctx.User.FindFirstValue(ClaimTypes.Name) ?? ctx.User.Identity.Name;
                var role = ctx.User.FindFirstValue(ClaimTypes.Role);

                operatorName = !string.IsNullOrWhiteSpace(givenName) ? givenName : (name ?? "Operator");
                operatorUsername = name ?? "operator";
                operatorRole = role ?? UserRoles.Operator;
            }

            if (string.IsNullOrWhiteSpace(operatorName))
            {
                operatorName = "Administrator";
                operatorUsername = "admin";
                operatorRole = UserRoles.Admin;
            }

            string? diffsJson = null;
            if (diffs != null && diffs.Any())
            {
                diffsJson = JsonSerializer.Serialize(diffs, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }

            var log = new AuditLog
            {
                Id = Guid.NewGuid().ToString("N"),
                Timestamp = DateTimeOffset.UtcNow,
                UserId = userId,
                OperatorName = operatorName,
                OperatorUsername = operatorUsername,
                OperatorRole = operatorRole,
                Action = action,
                Category = category,
                EntityType = entityType,
                EntityName = entityName,
                Summary = summary,
                DiffsJson = diffsJson,
                IpAddress = ipAddress
            };

            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write audit log for {Action} on {EntityType} {EntityName}", action, entityType, entityName);
        }
    }
}
