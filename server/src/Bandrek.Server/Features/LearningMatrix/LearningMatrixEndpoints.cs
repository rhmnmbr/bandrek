using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.LearningMatrix;

public static class LearningMatrixEndpoints
{
    public static void MapLearningMatrixEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/learning-matrix").WithTags("LearningMatrix");

        // GET /api/learning-matrix/{courseId}
        group.MapGet("/{courseId}", async (
            string courseId,
            LearningMatrixEngine engine,
            string? classGroupId,
            string? q,
            bool? showInactive,
            CancellationToken ct) =>
        {
            var result = await engine.ComputeAsync(
                courseId: courseId,
                classGroupId: classGroupId,
                searchQuery: q,
                showInactive: showInactive ?? false,
                ct: ct);

            return Results.Ok(result);
        })
        .WithName("GetLearningMatrix")
        .Produces<LearningMatrixResult>(StatusCodes.Status200OK);

        // POST /api/learning-matrix/manual
        group.MapPost("/manual", async (
            MarkManualChecklistRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.StudentId) || string.IsNullOrWhiteSpace(request.TopicId))
            {
                return Results.BadRequest(new { message = "ID Siswa dan ID Materi wajib diisi." });
            }

            // Check if checklist already exists
            var existing = await db.ManualChecklists
                .FirstOrDefaultAsync(cm => cm.StudentId == request.StudentId && cm.TopicId == request.TopicId, ct);

            DateOnly? checklistDate = DateOnly.TryParse(request.Date, out var d) ? d : null;

            if (existing != null)
            {
                existing.Date = checklistDate;
                existing.Notes = request.Notes ?? string.Empty;
                existing.RecordedBy = request.RecordedBy ?? "Operator";
                existing.RecordedAt = DateTimeOffset.UtcNow;
            }
            else
            {
                existing = new ManualChecklist
                {
                    Id = Guid.NewGuid().ToString("N"),
                    StudentId = request.StudentId,
                    TopicId = request.TopicId,
                    Date = checklistDate,
                    Notes = request.Notes ?? string.Empty,
                    RecordedBy = request.RecordedBy ?? "Operator",
                    RecordedAt = DateTimeOffset.UtcNow
                };
                db.ManualChecklists.Add(existing);
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new ManualChecklistDto(
                existing.Id,
                existing.StudentId,
                existing.TopicId,
                existing.Date?.ToString("yyyy-MM-dd"),
                existing.Notes,
                existing.RecordedBy,
                existing.RecordedAt));
        })
        .WithName("MarkManualChecklist")
        .Produces<ManualChecklistDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);

        // DELETE /api/learning-matrix/manual/{id}
        group.MapDelete("/manual/{id}", async (
            string id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var existing = await db.ManualChecklists.FirstOrDefaultAsync(cm => cm.Id == id, ct);
            if (existing == null)
            {
                return Results.NotFound(new { message = "Rekaman ceklis manual tidak ditemukan." });
            }

            db.ManualChecklists.Remove(existing);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new MessageResponseDto("Rekaman ceklis manual berhasil dihapus."));
        })
        .WithName("DeleteManualChecklist")
        .Produces<MessageResponseDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // POST /api/learning-matrix/manual/bulk
        group.MapPost("/manual/bulk", async (
            BulkMarkManualChecklistRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var result = new List<ManualChecklistDto>();

            foreach (var item in request.Items)
            {
                if (string.IsNullOrWhiteSpace(item.StudentId) || string.IsNullOrWhiteSpace(item.TopicId)) continue;

                var existing = await db.ManualChecklists
                    .FirstOrDefaultAsync(cm => cm.StudentId == item.StudentId && cm.TopicId == item.TopicId, ct);

                DateOnly? checklistDate = DateOnly.TryParse(item.Date, out var d) ? d : null;

                if (existing != null)
                {
                    existing.Date = checklistDate;
                    existing.Notes = item.Notes ?? string.Empty;
                    existing.RecordedBy = item.RecordedBy ?? "Operator";
                    existing.RecordedAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    existing = new ManualChecklist
                    {
                        Id = Guid.NewGuid().ToString("N"),
                        StudentId = item.StudentId,
                        TopicId = item.TopicId,
                        Date = checklistDate,
                        Notes = item.Notes ?? string.Empty,
                        RecordedBy = item.RecordedBy ?? "Operator",
                        RecordedAt = DateTimeOffset.UtcNow
                    };
                    db.ManualChecklists.Add(existing);
                }

                result.Add(new ManualChecklistDto(
                    existing.Id,
                    existing.StudentId,
                    existing.TopicId,
                    existing.Date?.ToString("yyyy-MM-dd"),
                    existing.Notes,
                    existing.RecordedBy,
                    existing.RecordedAt));
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(result);
        })
        .WithName("BulkMarkManualChecklist")
        .Produces<List<ManualChecklistDto>>(StatusCodes.Status200OK);

        // POST /api/learning-matrix/manual/bulk-delete
        group.MapPost("/manual/bulk-delete", async (
            BulkDeleteManualChecklistRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            int deletedCount = 0;
            foreach (var key in request.Keys)
            {
                var existing = await db.ManualChecklists
                    .Where(cm => cm.StudentId == key.StudentId && cm.TopicId == key.TopicId)
                    .ToListAsync(ct);

                if (existing.Count > 0)
                {
                    db.ManualChecklists.RemoveRange(existing);
                    deletedCount += existing.Count;
                }
            }

            await db.SaveChangesAsync(ct);

            return Results.Ok(new BulkDeleteResultDto(deletedCount));
        })
        .WithName("BulkDeleteManualChecklist")
        .Produces<BulkDeleteResultDto>(StatusCodes.Status200OK);
    }
}
