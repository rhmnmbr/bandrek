using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Realization;

public static class RealizationEndpoints
{
    public static void MapRealizationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api").WithTags("Realization");

        // GET /api/activities/{id}/realization
        group.MapGet("/activities/{id}/realization", async (
            string id,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var r = await db.Realizations
                .AsNoTracking()
                .Include(real => real.ActualTopic)
                .FirstOrDefaultAsync(real => real.ActivityId == id, ct);

            if (r == null)
            {
                return Results.NotFound(new { message = $"Realisasi untuk kegiatan '{id}' belum diisi." });
            }

            return Results.Ok(new RealizationDto(
                r.ActivityId,
                r.ActualStartTime,
                r.ActualEndTime,
                r.ActualTopicId,
                r.ActualTopic?.Name,
                r.CompletionStatus,
                r.Notes,
                r.StudentAttendances,
                r.StudentNotes,
                r.SubjectAttendances,
                r.SubjectNotes,
                r.FilledBy,
                r.FilledAt.ToString("yyyy-MM-dd HH:mm")));
        })
        .WithName("GetActivityRealization");

        // POST /api/activities/{id}/realization
        group.MapPost("/activities/{id}/realization", async (
            string id,
            SaveRealizationRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var activity = await db.Activities
                .Include(a => a.Realization)
                .FirstOrDefaultAsync(a => a.Id == id, ct);

            if (activity == null)
            {
                return Results.NotFound(new { message = $"Kegiatan dengan ID '{id}' tidak ditemukan." });
            }

            var realization = activity.Realization;
            bool isNew = realization == null;

            if (isNew)
            {
                realization = new Data.Entities.Realization
                {
                    ActivityId = id,
                    ActualStartTime = request.StartTime,
                    ActualEndTime = request.EndTime,
                    ActualTopicId = string.IsNullOrWhiteSpace(request.ActualTopicId) ? activity.TopicId : request.ActualTopicId,
                    CompletionStatus = request.CompletionStatus ?? CompletionStatuses.Completed,
                    Notes = request.Notes ?? string.Empty,
                    StudentAttendances = request.StudentAttendances ?? new Dictionary<string, string>(),
                    StudentNotes = request.StudentNotes ?? new Dictionary<string, string>(),
                    SubjectAttendances = request.SubjectAttendances ?? new Dictionary<string, string>(),
                    SubjectNotes = request.SubjectNotes ?? new Dictionary<string, string>(),
                    FilledBy = request.RecordedBy ?? "Operator",
                    FilledAt = DateTimeOffset.UtcNow
                };
                db.Realizations.Add(realization);
            }
            else
            {
                realization!.ActualStartTime = request.StartTime;
                realization.ActualEndTime = request.EndTime;
                realization.ActualTopicId = string.IsNullOrWhiteSpace(request.ActualTopicId) ? activity.TopicId : request.ActualTopicId;
                realization.CompletionStatus = request.CompletionStatus ?? CompletionStatuses.Completed;
                realization.Notes = request.Notes ?? string.Empty;
                realization.StudentAttendances = request.StudentAttendances ?? new Dictionary<string, string>();
                realization.StudentNotes = request.StudentNotes ?? new Dictionary<string, string>();
                realization.SubjectAttendances = request.SubjectAttendances ?? new Dictionary<string, string>();
                realization.SubjectNotes = request.SubjectNotes ?? new Dictionary<string, string>();
                realization.FilledBy = request.RecordedBy ?? "Operator";
                realization.FilledAt = DateTimeOffset.UtcNow;
            }

            // Update Activity rawStatus to realized
            activity.RawStatus = RawActivityStatuses.Realized;

            await db.SaveChangesAsync(ct);

            // Fetch actual topic name
            string? topicName = null;
            if (!string.IsNullOrEmpty(realization.ActualTopicId))
            {
                var t = await db.Topics.AsNoTracking().FirstOrDefaultAsync(top => top.Id == realization.ActualTopicId, ct);
                topicName = t?.Name;
            }

            return Results.Ok(new RealizationDto(
                realization.ActivityId,
                realization.ActualStartTime,
                realization.ActualEndTime,
                realization.ActualTopicId,
                topicName,
                realization.CompletionStatus,
                realization.Notes,
                realization.StudentAttendances,
                realization.StudentNotes,
                realization.SubjectAttendances,
                realization.SubjectNotes,
                realization.FilledBy,
                realization.FilledAt.ToString("yyyy-MM-dd HH:mm")));
        })
        .WithName("SaveActivityRealization");

        // GET /api/realization/pending-count
        group.MapGet("/realization/pending-count", async (
            AppDbContext db,
            CancellationToken ct) =>
        {
            var count = await db.Activities
                .CountAsync(a => a.RawStatus == RawActivityStatuses.Pending, ct);

            return Results.Ok(new { count });
        })
        .WithName("GetPendingRealizationCount");
    }
}
