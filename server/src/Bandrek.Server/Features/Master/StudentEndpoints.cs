using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class StudentEndpoints
{
    public static void MapStudentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/students").WithTags("Students");

        // GET /api/students
        group.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? status,
            string? educationalLevel,
            string? classGroupId,
            string? q,
            bool? desc,
            CancellationToken ct) =>
        {
            var query = db.Students
                .AsNoTracking()
                .Include(s => s.ClassGroups).ThenInclude(cg => cg.ClassGroup)
                .Include(s => s.Activities)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "semua")
            {
                if (status == "aktif") query = query.Where(s => s.IsActive);
                else if (status == "nonaktif") query = query.Where(s => !s.IsActive);
            }

            if (!string.IsNullOrWhiteSpace(educationalLevel) && educationalLevel != "semua")
            {
                query = query.Where(s => s.EducationalLevel == educationalLevel);
            }

            if (!string.IsNullOrWhiteSpace(classGroupId))
            {
                query = query.Where(s => s.ClassGroups.Any(cg => cg.ClassGroupId == classGroupId));
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(s => s.FullName.ToLower().Contains(term) ||
                                         (s.SchoolOrigin != null && s.SchoolOrigin.ToLower().Contains(term)) ||
                                         (s.GuardianName != null && s.GuardianName.ToLower().Contains(term)));
            }

            query = desc == true
                ? query.OrderByDescending(s => s.FullName)
                : query.OrderBy(s => s.FullName);

            var students = await query.ToListAsync(ct);
            var result = new List<StudentDto>();

            foreach (var s in students)
            {
                var usage = await usageChecker.CheckStudentUsageAsync(s.Id, ct);
                result.Add(new StudentDto(
                    s.Id,
                    s.FullName,
                    s.EducationalLevel,
                    s.IsActive,
                    s.BirthDate.ToString("yyyy-MM-dd"),
                    s.Gender,
                    s.SchoolOrigin,
                    s.GuardianName,
                    s.GuardianPhone,
                    s.JoinedDate?.ToString("yyyy-MM-dd"),
                    s.Notes,
                    s.ClassGroups.Select(cg => cg.ClassGroupId).ToList(),
                    s.ClassGroups.Select(cg => cg.ClassGroup.Name).ToList(),
                    s.Activities.Count,
                    s.ClassGroups.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetStudents")
        .Produces<List<StudentDto>>(StatusCodes.Status200OK);

        // GET /api/students/{id}
        group.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var s = await db.Students
                .AsNoTracking()
                .Include(st => st.ClassGroups).ThenInclude(cg => cg.ClassGroup)
                .Include(st => st.Activities)
                .FirstOrDefaultAsync(st => st.Id == id, ct);

            if (s == null) return Results.NotFound(new { message = $"Siswa dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckStudentUsageAsync(s.Id, ct);
            return Results.Ok(new StudentDto(
                s.Id,
                s.FullName,
                s.EducationalLevel,
                s.IsActive,
                s.BirthDate.ToString("yyyy-MM-dd"),
                s.Gender,
                s.SchoolOrigin,
                s.GuardianName,
                s.GuardianPhone,
                s.JoinedDate?.ToString("yyyy-MM-dd"),
                s.Notes,
                s.ClassGroups.Select(cg => cg.ClassGroupId).ToList(),
                s.ClassGroups.Select(cg => cg.ClassGroup.Name).ToList(),
                s.Activities.Count,
                s.ClassGroups.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetStudentById")
        .Produces<StudentDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/students/{id}/profile
        group.MapGet("/{id}/profile", async (
            string id,
            ProfileKpiCalculator kpiCalculator,
            CancellationToken ct) =>
        {
            var profile = await kpiCalculator.CalculateStudentProfileAsync(id, ct);
            if (profile == null) return Results.NotFound(new { message = $"Siswa dengan ID '{id}' tidak ditemukan." });

            return Results.Ok(profile);
        })
        .WithName("GetStudentProfile")
        .Produces<StudentProfileData>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/students
        group.MapPost("/", async (
            CreateStudentRequest request,
            AppDbContext db,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return Results.BadRequest(new { message = "Nama siswa wajib diisi." });
            }

            string studentId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(studentId))
            {
                // Auto generate sequential ID "S{number}"
                var existingIds = await db.Students.Select(s => s.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("S", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                studentId = $"S{maxNum + 1}";
            }
            else
            {
                var exists = await db.Students.AnyAsync(s => s.Id == studentId, ct);
                if (exists) return Results.Conflict(new { message = $"Siswa dengan ID '{studentId}' sudah ada." });
            }

            var student = new Student
            {
                Id = studentId,
                FullName = request.FullName.Trim(),
                EducationalLevel = string.IsNullOrWhiteSpace(request.EducationalLevel) ? null : request.EducationalLevel.Trim(),
                IsActive = request.IsActive ?? true,
                BirthDate = DateOnly.TryParse(request.BirthDate, out var bd) ? bd : DateOnly.FromDateTime(DateTime.Today),
                Gender = request.Gender,
                SchoolOrigin = request.SchoolOrigin?.Trim(),
                GuardianName = request.GuardianName?.Trim(),
                GuardianPhone = request.GuardianPhone?.Trim(),
                JoinedDate = DateOnly.TryParse(request.JoinedDate, out var jd) ? jd : DateOnly.FromDateTime(DateTime.Today),
                Notes = request.Notes?.Trim()
            };

            db.Students.Add(student);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "buat",
                category: "siswa",
                entityType: "siswa",
                entityName: student.FullName,
                summary: $"Menambahkan siswa baru: {student.FullName}",
                ct: ct);

            return Results.Created($"/api/students/{student.Id}", new StudentDto(
                student.Id,
                student.FullName,
                student.EducationalLevel,
                student.IsActive,
                student.BirthDate.ToString("yyyy-MM-dd"),
                student.Gender,
                student.SchoolOrigin,
                student.GuardianName,
                student.GuardianPhone,
                student.JoinedDate?.ToString("yyyy-MM-dd"),
                student.Notes,
                new List<string>(),
                new List<string>(),
                0,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateStudent")
        .Produces<StudentDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/students/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateStudentRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var student = await db.Students
                .Include(s => s.ClassGroups).ThenInclude(cg => cg.ClassGroup)
                .Include(s => s.Activities)
                .FirstOrDefaultAsync(s => s.Id == id, ct);

            if (student == null) return Results.NotFound(new { message = $"Siswa dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.FullName)) student.FullName = request.FullName.Trim();
            if (request.EducationalLevel != null) student.EducationalLevel = string.IsNullOrWhiteSpace(request.EducationalLevel) ? null : request.EducationalLevel.Trim();
            if (request.IsActive.HasValue) student.IsActive = request.IsActive.Value;
            if (!string.IsNullOrWhiteSpace(request.BirthDate) && DateOnly.TryParse(request.BirthDate, out var bd)) student.BirthDate = bd;
            if (!string.IsNullOrWhiteSpace(request.Gender)) student.Gender = request.Gender;
            if (request.SchoolOrigin != null) student.SchoolOrigin = request.SchoolOrigin.Trim();
            if (request.GuardianName != null) student.GuardianName = request.GuardianName.Trim();
            if (request.GuardianPhone != null) student.GuardianPhone = request.GuardianPhone.Trim();
            if (!string.IsNullOrWhiteSpace(request.JoinedDate) && DateOnly.TryParse(request.JoinedDate, out var jd)) student.JoinedDate = jd;
            if (request.Notes != null) student.Notes = request.Notes.Trim();

            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "siswa",
                entityType: "siswa",
                entityName: student.FullName,
                summary: $"Memperbarui data siswa: {student.FullName}",
                ct: ct);

            var usage = await usageChecker.CheckStudentUsageAsync(student.Id, ct);
            return Results.Ok(new StudentDto(
                student.Id,
                student.FullName,
                student.EducationalLevel,
                student.IsActive,
                student.BirthDate.ToString("yyyy-MM-dd"),
                student.Gender,
                student.SchoolOrigin,
                student.GuardianName,
                student.GuardianPhone,
                student.JoinedDate?.ToString("yyyy-MM-dd"),
                student.Notes,
                student.ClassGroups.Select(cg => cg.ClassGroupId).ToList(),
                student.ClassGroups.Select(cg => cg.ClassGroup.Name).ToList(),
                student.Activities.Count,
                student.ClassGroups.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateStudent")
        .Produces<StudentDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/students/{id}
        group.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var student = await db.Students.FirstOrDefaultAsync(s => s.Id == id, ct);
            if (student == null) return Results.NotFound(new { message = $"Siswa dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckStudentUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Students.Remove(student);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "hapus",
                category: "siswa",
                entityType: "siswa",
                entityName: student.FullName,
                summary: $"Menghapus siswa: {student.FullName}",
                ct: ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Siswa berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteStudent")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);
    }
}
