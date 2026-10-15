using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Features.Audit;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public record EducationalLevelDto(string Id, string Name, int Order, int StudentCount);

public record CreateEducationalLevelRequest(string? Id, string Name, int? Order);

public record UpdateEducationalLevelRequest(string? Name, int? Order);

public static class EducationalLevelEndpoints
{
    public static void MapEducationalLevelEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/educational-levels").WithTags("EducationalLevels");

        // GET /api/educational-levels
        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var options = await db.EducationalLevels
                .AsNoTracking()
                .OrderBy(e => e.Order)
                .ThenBy(e => e.Name)
                .ToListAsync(ct);

            // Auto-seed defaults if table is empty
            if (options.Count == 0)
            {
                var defaults = new List<EducationalLevelOption>
                {
                    new() { Id = "SD", Name = "SD", Order = 1 },
                    new() { Id = "SMP", Name = "SMP", Order = 2 },
                    new() { Id = "SMA", Name = "SMA", Order = 3 }
                };
                db.EducationalLevels.AddRange(defaults);
                await db.SaveChangesAsync(ct);
                options = defaults;
            }

            var studentUsage = await db.Students
                .AsNoTracking()
                .Where(s => s.EducationalLevel != null)
                .GroupBy(s => s.EducationalLevel!)
                .Select(g => new { Level = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Level, g => g.Count, ct);

            var result = options.Select(o => new EducationalLevelDto(
                o.Id,
                o.Name,
                o.Order,
                studentUsage.TryGetValue(o.Name, out var count) ? count : (studentUsage.TryGetValue(o.Id, out var countId) ? countId : 0)
            )).ToList();

            return Results.Ok(result);
        })
        .WithName("GetEducationalLevels")
        .Produces<List<EducationalLevelDto>>(StatusCodes.Status200OK);

        // POST /api/educational-levels
        group.MapPost("/", async (
            CreateEducationalLevelRequest request,
            AppDbContext db,
            IAuditService auditService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { message = "Nama jenjang tidak boleh kosong." });
            }

            var name = request.Name.Trim();
            var id = string.IsNullOrWhiteSpace(request.Id)
                ? name.ToUpperInvariant()
                : request.Id.Trim().ToUpperInvariant();

            var exists = await db.EducationalLevels.AnyAsync(e => e.Id == id || e.Name.ToLower() == name.ToLower(), ct);
            if (exists)
            {
                return Results.Conflict(new { message = $"Jenjang “{name}” sudah ada dalam daftar." });
            }

            var maxOrder = await db.EducationalLevels.MaxAsync(e => (int?)e.Order, ct) ?? 0;
            var option = new EducationalLevelOption
            {
                Id = id,
                Name = name,
                Order = request.Order ?? (maxOrder + 1)
            };

            db.EducationalLevels.Add(option);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "buat",
                category: "master",
                entityType: "jenjang",
                entityName: option.Name,
                summary: $"Menambahkan opsi jenjang pendidikan: {option.Name}",
                ct: ct);

            return Results.Created($"/api/educational-levels/{option.Id}", new EducationalLevelDto(
                option.Id,
                option.Name,
                option.Order,
                0));
        })
        .WithName("CreateEducationalLevel")
        .Produces<EducationalLevelDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/educational-levels/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateEducationalLevelRequest request,
            AppDbContext db,
            IAuditService auditService,
            CancellationToken ct) =>
        {
            var option = await db.EducationalLevels.FirstOrDefaultAsync(e => e.Id == id, ct);
            if (option == null)
            {
                return Results.NotFound(new { message = $"Opsi jenjang '{id}' tidak ditemukan." });
            }

            var oldName = option.Name;
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                var newName = request.Name.Trim();
                // Check if another option has the same name
                var exists = await db.EducationalLevels.AnyAsync(e => e.Id != id && e.Name.ToLower() == newName.ToLower(), ct);
                if (exists)
                {
                    return Results.Conflict(new { message = $"Jenjang “{newName}” sudah digunakan." });
                }

                option.Name = newName;

                // Also update students who had oldName to newName
                var studentsToUpdate = await db.Students
                    .Where(s => s.EducationalLevel == oldName || s.EducationalLevel == id)
                    .ToListAsync(ct);
                foreach (var s in studentsToUpdate)
                {
                    s.EducationalLevel = newName;
                }
            }

            if (request.Order.HasValue)
            {
                option.Order = request.Order.Value;
            }

            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "master",
                entityType: "jenjang",
                entityName: option.Name,
                summary: $"Memperbarui opsi jenjang: {oldName} -> {option.Name}",
                ct: ct);

            var studentCount = await db.Students.CountAsync(s => s.EducationalLevel == option.Name || s.EducationalLevel == option.Id, ct);

            return Results.Ok(new EducationalLevelDto(
                option.Id,
                option.Name,
                option.Order,
                studentCount));
        })
        .WithName("UpdateEducationalLevel")
        .Produces<EducationalLevelDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status409Conflict);

        // DELETE /api/educational-levels/{id}
        group.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            IAuditService auditService,
            CancellationToken ct) =>
        {
            var option = await db.EducationalLevels.FirstOrDefaultAsync(e => e.Id == id, ct);
            if (option == null)
            {
                return Results.NotFound(new { message = $"Opsi jenjang '{id}' tidak ditemukan." });
            }

            // Set students using this level to null so they don't have dangling invalid level
            var affectedStudents = await db.Students
                .Where(s => s.EducationalLevel == option.Name || s.EducationalLevel == option.Id)
                .ToListAsync(ct);
            foreach (var s in affectedStudents)
            {
                s.EducationalLevel = null;
            }

            db.EducationalLevels.Remove(option);
            await db.SaveChangesAsync(ct);

            await auditService.LogAsync(
                action: "hapus",
                category: "master",
                entityType: "jenjang",
                entityName: option.Name,
                summary: $"Menghapus opsi jenjang pendidikan: {option.Name} (diatur ulang pada {affectedStudents.Count} siswa)",
                ct: ct);

            return Results.Ok(new { message = $"Opsi jenjang “{option.Name}” berhasil dihapus.", affectedStudentCount = affectedStudents.Count });
        })
        .WithName("DeleteEducationalLevel")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}
