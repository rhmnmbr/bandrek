using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class SubjectEndpoints
{
    public static void MapSubjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subjects").WithTags("Subjects");

        // GET /api/subjects
        group.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? role,
            string? isActive,
            string? q,
            CancellationToken ct) =>
        {
            var query = db.Subjects
                .AsNoTracking()
                .Include(s => s.Activities)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(role) && role != "semua")
            {
                query = query.Where(s => s.Role == role);
            }

            if (!string.IsNullOrWhiteSpace(isActive) && isActive != "semua")
            {
                bool activeBool = isActive == "aktif" || isActive == "true";
                query = query.Where(s => s.IsActive == activeBool);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(s => s.FullName.ToLower().Contains(term) ||
                                         (s.Contact != null && s.Contact.ToLower().Contains(term)));
            }

            var subjects = await query.OrderBy(s => s.FullName).ToListAsync(ct);
            var result = new List<SubjectDto>();

            foreach (var s in subjects)
            {
                var usage = await usageChecker.CheckSubjectUsageAsync(s.Id, ct);
                result.Add(new SubjectDto(
                    s.Id,
                    s.FullName,
                    s.Gender,
                    s.Role,
                    s.IsActive,
                    s.Contact,
                    s.CourseIds,
                    s.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList(),
                    s.Activities.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetSubjects")
        .Produces<List<SubjectDto>>(StatusCodes.Status200OK);

        // GET /api/subjects/{id}
        group.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var s = await db.Subjects
                .AsNoTracking()
                .Include(sub => sub.Activities)
                .FirstOrDefaultAsync(sub => sub.Id == id, ct);

            if (s == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckSubjectUsageAsync(s.Id, ct);
            return Results.Ok(new SubjectDto(
                s.Id,
                s.FullName,
                s.Gender,
                s.Role,
                s.IsActive,
                s.Contact,
                s.CourseIds,
                s.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList(),
                s.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetSubjectById")
        .Produces<SubjectDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/subjects/{id}/profile
        group.MapGet("/{id}/profile", async (
            string id,
            ProfileKpiCalculator kpiCalculator,
            CancellationToken ct) =>
        {
            var profile = await kpiCalculator.CalculateSubjectProfileAsync(id, ct);
            if (profile == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            return Results.Ok(profile);
        })
        .WithName("GetSubjectProfile")
        .Produces<SubjectProfileData>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/subjects
        group.MapPost("/", async (
            CreateSubjectRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return Results.BadRequest(new { message = "Nama subjek wajib diisi." });
            }

            string subjectId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(subjectId))
            {
                var existingIds = await db.Subjects.Select(s => s.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("U", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                subjectId = $"U{maxNum + 1}";
            }
            else
            {
                var exists = await db.Subjects.AnyAsync(s => s.Id == subjectId, ct);
                if (exists) return Results.Conflict(new { message = $"Subjek dengan ID '{subjectId}' sudah ada." });
            }

            var subject = new SubjectPerson
            {
                Id = subjectId,
                FullName = request.FullName.Trim(),
                Gender = request.Gender,
                Role = request.Role ?? SubjectRoles.Instructor,
                IsActive = request.IsActive ?? true,
                Contact = request.Contact?.Trim(),
                CourseIds = request.CourseIds ?? new List<string>(),
                WeeklyAvailabilities = request.WeeklyAvailabilities?.Select(w => new WeeklyAvailability
                {
                    Day = w.Day,
                    From = w.From,
                    To = w.To
                }).ToList() ?? new List<WeeklyAvailability>()
            };

            db.Subjects.Add(subject);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/subjects/{subject.Id}", new SubjectDto(
                subject.Id,
                subject.FullName,
                subject.Gender,
                subject.Role,
                subject.IsActive,
                subject.Contact,
                subject.CourseIds,
                subject.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList(),
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateSubject")
        .Produces<SubjectDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/subjects/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateSubjectRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var subject = await db.Subjects
                .Include(s => s.Activities)
                .FirstOrDefaultAsync(s => s.Id == id, ct);

            if (subject == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.FullName)) subject.FullName = request.FullName.Trim();
            if (!string.IsNullOrWhiteSpace(request.Gender)) subject.Gender = request.Gender;
            if (!string.IsNullOrWhiteSpace(request.Role)) subject.Role = request.Role;
            if (request.IsActive.HasValue) subject.IsActive = request.IsActive.Value;
            if (request.Contact != null) subject.Contact = request.Contact.Trim();
            if (request.CourseIds != null) subject.CourseIds = request.CourseIds;

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckSubjectUsageAsync(subject.Id, ct);
            return Results.Ok(new SubjectDto(
                subject.Id,
                subject.FullName,
                subject.Gender,
                subject.Role,
                subject.IsActive,
                subject.Contact,
                subject.CourseIds,
                subject.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList(),
                subject.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateSubject")
        .Produces<SubjectDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/subjects/{id}
        group.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var subject = await db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (subject == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckSubjectUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Subjects.Remove(subject);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Subjek berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteSubject")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/subjects/{id}/availability
        group.MapPost("/{id}/availability", async (
            string id,
            WeeklyAvailabilityDto item,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var subject = await db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (subject == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            subject.WeeklyAvailabilities.Add(new WeeklyAvailability
            {
                Day = item.Day,
                From = item.From,
                To = item.To
            });

            await db.SaveChangesAsync(ct);

            return Results.Ok(subject.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList());
        })
        .WithName("AddSubjectAvailability")
        .Produces<List<WeeklyAvailabilityDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // PUT /api/subjects/{id}/availability/{index:int}
        group.MapPut("/{id}/availability/{index:int}", async (
            string id,
            int index,
            WeeklyAvailabilityDto item,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var subject = await db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (subject == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            if (index < 0 || index >= subject.WeeklyAvailabilities.Count)
            {
                return Results.BadRequest(new { message = "Indeks ketersediaan tidak valid." });
            }

            subject.WeeklyAvailabilities[index] = new WeeklyAvailability
            {
                Day = item.Day,
                From = item.From,
                To = item.To
            };

            await db.SaveChangesAsync(ct);

            return Results.Ok(subject.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList());
        })
        .WithName("UpdateSubjectAvailability")
        .Produces<List<WeeklyAvailabilityDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/subjects/{id}/availability/{index:int}
        group.MapDelete("/{id}/availability/{index:int}", async (
            string id,
            int index,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var subject = await db.Subjects.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (subject == null) return Results.NotFound(new { message = $"Subjek dengan ID '{id}' tidak ditemukan." });

            if (index < 0 || index >= subject.WeeklyAvailabilities.Count)
            {
                return Results.BadRequest(new { message = "Indeks ketersediaan tidak valid." });
            }

            subject.WeeklyAvailabilities.RemoveAt(index);
            await db.SaveChangesAsync(ct);

            return Results.Ok(subject.WeeklyAvailabilities.Select(w => new WeeklyAvailabilityDto(w.Day, w.From, w.To)).ToList());
        })
        .WithName("DeleteSubjectAvailability")
        .Produces<List<WeeklyAvailabilityDto>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);
    }
}
