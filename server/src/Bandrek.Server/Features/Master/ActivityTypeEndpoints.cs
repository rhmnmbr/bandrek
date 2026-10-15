using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class ActivityTypeEndpoints
{
    public static void MapActivityTypeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/activity-types").WithTags("ActivityTypes");

        // GET /api/activity-types
        group.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? q,
            CancellationToken ct) =>
        {
            var query = db.ActivityTypes
                .AsNoTracking()
                .Include(a => a.Activities)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(a => a.Name.ToLower().Contains(term));
            }

            var types = await query.OrderBy(a => a.Name).ToListAsync(ct);
            var result = new List<ActivityTypeDto>();

            foreach (var t in types)
            {
                var usage = await usageChecker.CheckActivityTypeUsageAsync(t.Id, ct);
                result.Add(new ActivityTypeDto(
                    t.Id,
                    t.Name,
                    t.Color,
                    t.RequiresTopic,
                    t.RequiresStudents,
                    t.Activities.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetActivityTypes")
        .Produces<List<ActivityTypeDto>>(StatusCodes.Status200OK);

        // GET /api/activity-types/{id}
        group.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var t = await db.ActivityTypes
                .AsNoTracking()
                .Include(at => at.Activities)
                .FirstOrDefaultAsync(at => at.Id == id, ct);

            if (t == null) return Results.NotFound(new { message = $"Jenis kegiatan dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckActivityTypeUsageAsync(t.Id, ct);
            return Results.Ok(new ActivityTypeDto(
                t.Id,
                t.Name,
                t.Color,
                t.RequiresTopic,
                t.RequiresStudents,
                t.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetActivityTypeById")
        .Produces<ActivityTypeDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // POST /api/activity-types
        group.MapPost("/", async (
            CreateActivityTypeRequest request,
            AppDbContext db,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { message = "Nama jenis kegiatan wajib diisi." });
            }

            string typeId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(typeId))
            {
                var existingIds = await db.ActivityTypes.Select(t => t.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("J", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                typeId = $"J{maxNum + 1}";
            }
            else
            {
                var exists = await db.ActivityTypes.AnyAsync(t => t.Id == typeId, ct);
                if (exists) return Results.Conflict(new { message = $"Jenis kegiatan dengan ID '{typeId}' sudah ada." });
            }

            var activityType = new ActivityType
            {
                Id = typeId,
                Name = request.Name.Trim(),
                Color = request.Color ?? "pembelajaran",
                RequiresTopic = request.RequiresTopic ?? true,
                RequiresStudents = request.RequiresStudents ?? true
            };

            db.ActivityTypes.Add(activityType);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "buat",
                category: "master",
                entityType: "jenis_kegiatan",
                entityName: activityType.Name,
                summary: $"Menambahkan jenis kegiatan baru: {activityType.Name}",
                ct: ct);

            return Results.Created($"/api/activity-types/{activityType.Id}", new ActivityTypeDto(
                activityType.Id,
                activityType.Name,
                activityType.Color,
                activityType.RequiresTopic,
                activityType.RequiresStudents,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateActivityType")
        .Produces<ActivityTypeDto>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status409Conflict);

        // PUT /api/activity-types/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateActivityTypeRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var activityType = await db.ActivityTypes
                .Include(t => t.Activities)
                .FirstOrDefaultAsync(t => t.Id == id, ct);

            if (activityType == null) return Results.NotFound(new { message = $"Jenis kegiatan dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) activityType.Name = request.Name.Trim();
            if (!string.IsNullOrWhiteSpace(request.Color)) activityType.Color = request.Color;
            if (request.RequiresTopic.HasValue) activityType.RequiresTopic = request.RequiresTopic.Value;
            if (request.RequiresStudents.HasValue) activityType.RequiresStudents = request.RequiresStudents.Value;

            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "master",
                entityType: "jenis_kegiatan",
                entityName: activityType.Name,
                summary: $"Memperbarui data jenis kegiatan: {activityType.Name}",
                ct: ct);

            var usage = await usageChecker.CheckActivityTypeUsageAsync(activityType.Id, ct);
            return Results.Ok(new ActivityTypeDto(
                activityType.Id,
                activityType.Name,
                activityType.Color,
                activityType.RequiresTopic,
                activityType.RequiresStudents,
                activityType.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateActivityType")
        .Produces<ActivityTypeDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // DELETE /api/activity-types/{id}
        group.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var activityType = await db.ActivityTypes.FirstOrDefaultAsync(t => t.Id == id, ct);
            if (activityType == null) return Results.NotFound(new { message = $"Jenis kegiatan dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckActivityTypeUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.ActivityTypes.Remove(activityType);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "hapus",
                category: "master",
                entityType: "jenis_kegiatan",
                entityName: activityType.Name,
                summary: $"Menghapus jenis kegiatan: {activityType.Name}",
                ct: ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Jenis kegiatan berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteActivityType")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }
}
