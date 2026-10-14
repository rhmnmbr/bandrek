using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class ClassGroupEndpoints
{
    public static void MapClassGroupEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/classes").WithTags("Classes");

        // GET /api/classes
        group.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? educationalLevel,
            string? q,
            CancellationToken ct) =>
        {
            var query = db.ClassGroups
                .AsNoTracking()
                .Include(cg => cg.Students).ThenInclude(cgs => cgs.Student)
                .Include(cg => cg.Activities)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(educationalLevel) && educationalLevel != "semua")
            {
                query = query.Where(cg => cg.EducationalLevel == educationalLevel);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(cg => cg.Name.ToLower().Contains(term) ||
                                          (cg.Description != null && cg.Description.ToLower().Contains(term)));
            }

            var list = await query.OrderBy(cg => cg.Name).ToListAsync(ct);
            var result = new List<ClassGroupDto>();

            foreach (var cg in list)
            {
                var usage = await usageChecker.CheckClassGroupUsageAsync(cg.Id, ct);
                result.Add(new ClassGroupDto(
                    cg.Id,
                    cg.Name,
                    cg.EducationalLevel,
                    cg.Description,
                    cg.Students.Select(s => s.StudentId).ToList(),
                    cg.Students.Select(s => s.Student?.FullName ?? s.StudentId).ToList(),
                    cg.Students.Count,
                    cg.Activities.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetClasses");

        // GET /api/classes/{id}
        group.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var cg = await db.ClassGroups
                .AsNoTracking()
                .Include(c => c.Students).ThenInclude(cgs => cgs.Student)
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.Id == id, ct);

            if (cg == null) return Results.NotFound(new { message = $"Kelas dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckClassGroupUsageAsync(cg.Id, ct);
            return Results.Ok(new ClassGroupDto(
                cg.Id,
                cg.Name,
                cg.EducationalLevel,
                cg.Description,
                cg.Students.Select(s => s.StudentId).ToList(),
                cg.Students.Select(s => s.Student?.FullName ?? s.StudentId).ToList(),
                cg.Students.Count,
                cg.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetClassById");

        // POST /api/classes
        group.MapPost("/", async (
            CreateClassGroupRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { message = "Nama kelas wajib diisi." });
            }

            string classId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(classId))
            {
                var existingIds = await db.ClassGroups.Select(c => c.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("K", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                classId = $"K{maxNum + 1}";
            }
            else
            {
                var exists = await db.ClassGroups.AnyAsync(c => c.Id == classId, ct);
                if (exists) return Results.Conflict(new { message = $"Kelas dengan ID '{classId}' sudah ada." });
            }

            var cg = new ClassGroup
            {
                Id = classId,
                Name = request.Name.Trim(),
                EducationalLevel = request.EducationalLevel,
                Description = request.Description?.Trim()
            };

            if (request.StudentIds != null && request.StudentIds.Count > 0)
            {
                foreach (var sId in request.StudentIds.Distinct())
                {
                    cg.Students.Add(new ClassGroupStudent
                    {
                        ClassGroupId = classId,
                        StudentId = sId
                    });
                }
            }

            db.ClassGroups.Add(cg);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/classes/{cg.Id}", new ClassGroupDto(
                cg.Id,
                cg.Name,
                cg.EducationalLevel,
                cg.Description,
                cg.Students.Select(s => s.StudentId).ToList(),
                new List<string>(),
                cg.Students.Count,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateClass");

        // PUT /api/classes/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateClassGroupRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var cg = await db.ClassGroups
                .Include(c => c.Students).ThenInclude(cgs => cgs.Student)
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.Id == id, ct);

            if (cg == null) return Results.NotFound(new { message = $"Kelas dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) cg.Name = request.Name.Trim();
            if (request.EducationalLevel != null) cg.EducationalLevel = request.EducationalLevel;
            if (request.Description != null) cg.Description = request.Description.Trim();

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckClassGroupUsageAsync(cg.Id, ct);
            return Results.Ok(new ClassGroupDto(
                cg.Id,
                cg.Name,
                cg.EducationalLevel,
                cg.Description,
                cg.Students.Select(s => s.StudentId).ToList(),
                cg.Students.Select(s => s.Student?.FullName ?? s.StudentId).ToList(),
                cg.Students.Count,
                cg.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateClass");

        // POST /api/classes/{id}/members
        group.MapPost("/{id}/members", async (
            string id,
            UpdateClassMemberRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var cg = await db.ClassGroups
                .Include(c => c.Students).ThenInclude(cgs => cgs.Student)
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.Id == id, ct);

            if (cg == null) return Results.NotFound(new { message = $"Kelas dengan ID '{id}' tidak ditemukan." });

            var existingMember = cg.Students.FirstOrDefault(s => s.StudentId == request.StudentId);
            if (request.Add && existingMember == null)
            {
                cg.Students.Add(new ClassGroupStudent
                {
                    ClassGroupId = id,
                    StudentId = request.StudentId
                });
            }
            else if (!request.Add && existingMember != null)
            {
                cg.Students.Remove(existingMember);
            }

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckClassGroupUsageAsync(cg.Id, ct);
            return Results.Ok(new ClassGroupDto(
                cg.Id,
                cg.Name,
                cg.EducationalLevel,
                cg.Description,
                cg.Students.Select(s => s.StudentId).ToList(),
                cg.Students.Select(s => s.Student?.FullName ?? s.StudentId).ToList(),
                cg.Students.Count,
                cg.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateClassMember");

        // DELETE /api/classes/{id}
        group.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var cg = await db.ClassGroups.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (cg == null) return Results.NotFound(new { message = $"Kelas dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckClassGroupUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.ClassGroups.Remove(cg);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Kelas berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteClass");
    }
}
