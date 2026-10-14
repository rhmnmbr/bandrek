using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Audit;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit-logs").WithTags("Audit");

        // GET /api/audit-logs
        group.MapGet("/", async (
            AppDbContext db,
            DateTimeOffset? from,
            DateTimeOffset? to,
            string? userId,
            string? action,
            string? category,
            string? q,
            int? limit,
            CancellationToken ct) =>
        {
            var query = db.AuditLogs.AsNoTracking().AsQueryable();

            if (from.HasValue) query = query.Where(a => a.Timestamp >= from.Value);
            if (to.HasValue) query = query.Where(a => a.Timestamp <= to.Value);
            if (!string.IsNullOrWhiteSpace(userId)) query = query.Where(a => a.UserId == userId);
            if (!string.IsNullOrWhiteSpace(action)) query = query.Where(a => a.Action == action);
            if (!string.IsNullOrWhiteSpace(category)) query = query.Where(a => a.Category == category);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(a => a.EntityName.ToLower().Contains(term) ||
                                         a.Summary.ToLower().Contains(term) ||
                                         a.OperatorName.ToLower().Contains(term));
            }

            int takeCount = Math.Clamp(limit ?? 50, 1, 200);
            var logs = await query.OrderByDescending(a => a.Timestamp).Take(takeCount).ToListAsync(ct);

            var result = logs.Select(a => new AuditLogDto(
                a.Id,
                a.Timestamp,
                a.UserId,
                a.OperatorName,
                a.OperatorUsername,
                a.OperatorRole,
                a.Action,
                a.Category,
                a.EntityType,
                a.EntityName,
                a.Summary,
                a.DiffsJson,
                a.IpAddress)).ToList();

            return Results.Ok(result);
        })
        .WithName("GetAuditLogs");

        // POST /api/audit-logs
        group.MapPost("/", async (
            AuditLogDto request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var log = new AuditLog
            {
                Id = string.IsNullOrWhiteSpace(request.Id) ? Guid.NewGuid().ToString("N") : request.Id,
                Timestamp = request.Timestamp == default ? DateTimeOffset.UtcNow : request.Timestamp,
                UserId = request.UserId,
                OperatorName = request.OperatorName,
                OperatorUsername = request.OperatorUsername,
                OperatorRole = request.OperatorRole,
                Action = request.Action,
                Category = request.Category,
                EntityType = request.EntityType,
                EntityName = request.EntityName,
                Summary = request.Summary,
                DiffsJson = request.DiffsJson,
                IpAddress = request.IpAddress
            };

            db.AuditLogs.Add(log);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/audit-logs/{log.Id}", request);
        })
        .WithName("CreateAuditLog");
    }
}
