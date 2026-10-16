using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Features.Realization;
using Bandrek.Server.Services.BusinessRules;
using Bandrek.Server.Services.DateTimeProvider;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Activities;

public static class ActivityEndpoints
{
    private static readonly string[] StandardCancellationReasons =
    [
        "Siswa/peserta berhalangan",
        "Tutor/pengisi berhalangan",
        "Ruangan/fasilitas tidak tersedia",
        "Kendala cuaca/kondisi darurat",
        "Libur bersama/jadwal khusus",
        "Lainnya"
    ];

    private static readonly string[] StandardRescheduleReasons =
    [
        "Permintaan siswa/wali",
        "Penyesuaian jadwal tutor",
        "Bentrok ruangan mendadak",
        "Pergantian materi/kelanjutan sesi",
        "Kondisi darurat/force majeure",
        "Lainnya"
    ];

    public static void MapActivityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/activities").WithTags("Activities");

        // GET /api/activities/cancellation-reasons
        group.MapGet("/cancellation-reasons", () => Results.Ok(StandardCancellationReasons))
            .WithName("GetCancellationReasons")
            .Produces<string[]>(StatusCodes.Status200OK);

        // GET /api/activities/reschedule-reasons
        group.MapGet("/reschedule-reasons", () => Results.Ok(StandardRescheduleReasons))
            .WithName("GetRescheduleReasons")
            .Produces<string[]>(StatusCodes.Status200OK);

        // POST /api/activities/check-conflicts
        group.MapPost("/check-conflicts", async (
            ConflictCheckRequest request,
            ConflictDetector detector,
            CancellationToken ct) =>
        {
            if (!DateOnly.TryParse(request.Date, out var date))
            {
                return Results.BadRequest(new { message = "Format tanggal tidak valid (YYYY-MM-DD)." });
            }

            DateOnly? endDate = null;
            if (!string.IsNullOrWhiteSpace(request.EndDate) && DateOnly.TryParse(request.EndDate, out var ed))
            {
                endDate = ed;
            }

            var result = await detector.DetectAsync(
                date: date,
                startTime: request.StartTime,
                endTime: request.EndTime,
                roomId: request.RoomId,
                subjectIds: request.SubjectIds ?? new List<string>(),
                studentIds: request.StudentIds ?? new List<string>(),
                excludeActivityId: request.ExcludeActivityId,
                endDate: endDate,
                ct: ct);

            return Results.Ok(new ConflictCheckResponse(
                result.HasConflict,
                result.Conflicts.Select(c => new ConflictItemDto(
                    c.Type,
                    c.EntityId,
                    c.EntityName,
                    c.ConflictingActivityId,
                    c.ConflictingActivityName,
                    c.StartTime,
                    c.EndTime,
                    c.Description)).ToList(),
                result.Summary));
        })
        .WithName("CheckActivityConflicts")
        .Produces<ConflictCheckResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest);

        // GET /api/activities/calendar
        group.MapGet("/calendar", async (
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            string? startDate,
            string? endDate,
            string? activityTypeId,
            string? subjectId,
            string? classGroupId,
            string? roomId,
            string? status,
            bool? showCancelled,
            CancellationToken ct) =>
        {
            var query = BuildActivityQuery(db);

            if (DateOnly.TryParse(startDate, out var sDate))
            {
                query = query.Where(a => (a.EndDate ?? a.Date) >= sDate);
            }
            if (DateOnly.TryParse(endDate, out var eDate))
            {
                query = query.Where(a => a.Date <= eDate);
            }

            if (!string.IsNullOrWhiteSpace(activityTypeId)) query = query.Where(a => a.ActivityTypeId == activityTypeId);
            if (!string.IsNullOrWhiteSpace(classGroupId)) query = query.Where(a => a.ClassGroupId == classGroupId);
            if (!string.IsNullOrWhiteSpace(roomId)) query = query.Where(a => a.RoomId == roomId);
            if (!string.IsNullOrWhiteSpace(subjectId)) query = query.Where(a => a.Subjects.Any(s => s.SubjectPersonId == subjectId));

            if (showCancelled != true)
            {
                query = query.Where(a => a.RawStatus != RawActivityStatuses.Cancelled && a.RawStatus != RawActivityStatuses.Rescheduled);
            }

            var activities = await query.OrderBy(a => a.Date).ThenBy(a => a.StartTime).ToListAsync(ct);
            var result = activities.Select(a => MapToDto(a, statusService, dtProvider)).ToList();

            if (!string.IsNullOrWhiteSpace(status) && status != "semua")
            {
                result = result.Where(a => a.Status == status).ToList();
            }

            return Results.Ok(result);
        })
        .WithName("GetCalendarActivities")
        .Produces<List<ActivityDto>>(StatusCodes.Status200OK);

        // GET /api/activities/list
        group.MapGet("/list", async (
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            string? startDate,
            string? endDate,
            string? activityTypeId,
            string? subjectId,
            string? classGroupId,
            string? status,
            bool? onlyPendingRealization,
            string? quickFilter,
            string? q,
            bool? sortDesc,
            CancellationToken ct) =>
        {
            var query = BuildActivityQuery(db);

            if (DateOnly.TryParse(startDate, out var sDate)) query = query.Where(a => (a.EndDate ?? a.Date) >= sDate);
            if (DateOnly.TryParse(endDate, out var eDate)) query = query.Where(a => a.Date <= eDate);
            if (!string.IsNullOrWhiteSpace(activityTypeId)) query = query.Where(a => a.ActivityTypeId == activityTypeId);
            if (!string.IsNullOrWhiteSpace(classGroupId)) query = query.Where(a => a.ClassGroupId == classGroupId);
            if (!string.IsNullOrWhiteSpace(subjectId)) query = query.Where(a => a.Subjects.Any(s => s.SubjectPersonId == subjectId));

            var today = dtProvider.Today;

            // Handle QuickFilters
            if (!string.IsNullOrWhiteSpace(quickFilter))
            {
                switch (quickFilter)
                {
                    case "hari":
                        query = query.Where(a => a.Date <= today && (a.EndDate ?? a.Date) >= today);
                        break;
                    case "minggu":
                    {
                        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                        var startOfWeek = today.AddDays(-diff);
                        var endOfWeek = startOfWeek.AddDays(6);
                        query = query.Where(a => a.Date <= endOfWeek && (a.EndDate ?? a.Date) >= startOfWeek);
                        break;
                    }
                    case "datang":
                        query = query.Where(a => (a.EndDate ?? a.Date) >= today);
                        break;
                    case "perlu":
                        query = query.Where(a => a.RawStatus == RawActivityStatuses.Pending || (a.EndDate ?? a.Date) < today);
                        break;
                }
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(a => a.Name.ToLower().Contains(term) ||
                                         (a.Notes != null && a.Notes.ToLower().Contains(term)));
            }

            query = sortDesc == true
                ? query.OrderByDescending(a => a.Date).ThenByDescending(a => a.StartTime)
                : query.OrderBy(a => a.Date).ThenBy(a => a.StartTime);

            var activities = await query.ToListAsync(ct);
            var result = activities.Select(a => MapToDto(a, statusService, dtProvider)).ToList();

            if (onlyPendingRealization == true)
            {
                result = result.Where(a => a.NeedsRealization).ToList();
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "semua")
            {
                result = result.Where(a => a.Status == status).ToList();
            }

            return Results.Ok(result);
        })
        .WithName("GetActivityList")
        .Produces<List<ActivityDto>>(StatusCodes.Status200OK);

        // GET /api/activities/{id}
        group.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            CancellationToken ct) =>
        {
            var activity = await BuildActivityQuery(db)
                .FirstOrDefaultAsync(a => a.Id == id, ct);

            if (activity == null)
            {
                return Results.NotFound(new { message = $"Kegiatan dengan ID '{id}' tidak ditemukan." });
            }

            return Results.Ok(MapToDto(activity, statusService, dtProvider));
        })
        .WithName("GetActivityById")
        .Produces<ActivityDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // POST /api/activities
        group.MapPost("/", async (
            CreateActivityRequest request,
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Date) ||
                string.IsNullOrWhiteSpace(request.StartTime) ||
                string.IsNullOrWhiteSpace(request.EndTime))
            {
                return Results.BadRequest(new { message = "Nama, tanggal, jam mulai, dan jam selesai wajib diisi." });
            }

            if (!DateOnly.TryParse(request.Date, out var baseDate))
            {
                return Results.BadRequest(new { message = "Format tanggal tidak valid." });
            }

            var createdActivities = new List<Activity>();
            bool isRecurring = request.Recurring != null && request.Recurring.IsActive;

            if (isRecurring)
            {
                var rule = request.Recurring!;
                var seriesId = Guid.NewGuid().ToString("N");
                var dates = GenerateRecurringDates(baseDate, rule);
                int total = dates.Count;

                for (int i = 0; i < total; i++)
                {
                    var d = dates[i];
                    var act = CreateSingleActivityEntity(request, d, i == 0 ? request.Id : null);
                    act.SeriesId = seriesId;
                    act.SeriesOrder = i + 1;
                    act.SeriesTotal = total;
                    db.Activities.Add(act);
                    createdActivities.Add(act);
                }
            }
            else
            {
                var act = CreateSingleActivityEntity(request, baseDate, request.Id);
                db.Activities.Add(act);
                createdActivities.Add(act);
            }

            await db.SaveChangesAsync(ct);

            // Re-fetch first activity with navigation properties
            var firstId = createdActivities[0].Id;
            var saved = await BuildActivityQuery(db).FirstAsync(a => a.Id == firstId, ct);

            await auditService.LogAsync(
                action: "buat",
                category: "kegiatan",
                entityType: "kegiatan",
                entityName: saved.Name,
                summary: $"Menambahkan kegiatan baru: {saved.Name} ({saved.Date:dd MMM yyyy}, {saved.StartTime}-{saved.EndTime})",
                ct: ct);

            return Results.Created($"/api/activities/{saved.Id}", MapToDto(saved, statusService, dtProvider));
        })
        .WithName("CreateActivity")
        .Produces<ActivityDto>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest);

        // PUT /api/activities/{id}
        group.MapPut("/{id}", async (
            string id,
            UpdateActivityRequest request,
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var activity = await db.Activities
                .Include(a => a.Subjects)
                .Include(a => a.Students)
                .FirstOrDefaultAsync(a => a.Id == id, ct);

            if (activity == null) return Results.NotFound(new { message = $"Kegiatan dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) activity.Name = request.Name.Trim();
            if (request.ActivityTypeId != null) activity.ActivityTypeId = string.IsNullOrWhiteSpace(request.ActivityTypeId) ? null : request.ActivityTypeId;
            if (request.CourseId != null) activity.CourseId = string.IsNullOrWhiteSpace(request.CourseId) ? null : request.CourseId;
            if (request.TopicId != null) activity.TopicId = string.IsNullOrWhiteSpace(request.TopicId) ? null : request.TopicId;
            if (request.ClassGroupId != null) activity.ClassGroupId = string.IsNullOrWhiteSpace(request.ClassGroupId) ? null : request.ClassGroupId;
            if (!string.IsNullOrWhiteSpace(request.Date) && DateOnly.TryParse(request.Date, out var d)) activity.Date = d;
            if (request.EndDate != null) activity.EndDate = !string.IsNullOrWhiteSpace(request.EndDate) && DateOnly.TryParse(request.EndDate, out var ed) ? ed : null;
            if (!string.IsNullOrWhiteSpace(request.StartTime)) activity.StartTime = request.StartTime;
            if (!string.IsNullOrWhiteSpace(request.EndTime)) activity.EndTime = request.EndTime;
            if (request.IsAllDay.HasValue) activity.IsAllDay = request.IsAllDay.Value;
            if (!string.IsNullOrWhiteSpace(request.RoomId)) activity.RoomId = request.RoomId;
            if (request.CustomPlace != null) activity.CustomPlace = request.CustomPlace.Trim();
            if (request.Notes != null) activity.Notes = request.Notes.Trim();

            // Update subjects
            if (request.Subjects != null)
            {
                activity.Subjects.Clear();
                foreach (var s in request.Subjects)
                {
                    activity.Subjects.Add(new ActivitySubject
                    {
                        ActivityId = id,
                        SubjectPersonId = s.Id,
                        Role = s.Role
                    });
                }
            }

            // Update students
            if (request.StudentIds != null)
            {
                activity.Students.Clear();
                foreach (var sId in request.StudentIds.Distinct())
                {
                    activity.Students.Add(new ActivityStudent
                    {
                        ActivityId = id,
                        StudentId = sId
                    });
                }
            }

            await db.SaveChangesAsync(ct);

            var saved = await BuildActivityQuery(db).FirstAsync(a => a.Id == id, ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "kegiatan",
                entityType: "kegiatan",
                entityName: saved.Name,
                summary: $"Memperbarui kegiatan: {saved.Name} ({saved.Date:dd MMM yyyy}, {saved.StartTime}-{saved.EndTime})",
                ct: ct);

            return Results.Ok(MapToDto(saved, statusService, dtProvider));
        })
        .WithName("UpdateActivity")
        .Produces<ActivityDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // POST /api/activities/{id}/cancel
        group.MapPost("/{id}/cancel", async (
            string id,
            CancelActivityRequest request,
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var activity = await db.Activities.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (activity == null) return Results.NotFound(new { message = $"Kegiatan dengan ID '{id}' tidak ditemukan." });

            activity.RawStatus = RawActivityStatuses.Cancelled;
            activity.CancellationReason = request.Reason;
            activity.CancellationNotes = request.Notes;
            activity.CancelledAt = DateTimeOffset.UtcNow;

            await db.SaveChangesAsync(ct);

            var saved = await BuildActivityQuery(db).FirstAsync(a => a.Id == id, ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "kegiatan",
                entityType: "kegiatan",
                entityName: saved.Name,
                summary: $"Membatalkan kegiatan: {saved.Name}. Alasan: {request.Reason}",
                ct: ct);

            return Results.Ok(MapToDto(saved, statusService, dtProvider));
        })
        .WithName("CancelActivity")
        .Produces<ActivityDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound);

        // POST /api/activities/{id}/reschedule
        group.MapPost("/{id}/reschedule", async (
            string id,
            RescheduleActivityRequest request,
            AppDbContext db,
            ActivityStatusService statusService,
            IDateTimeProvider dtProvider,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            CancellationToken ct) =>
        {
            var original = await db.Activities
                .Include(a => a.Subjects)
                .Include(a => a.Students)
                .FirstOrDefaultAsync(a => a.Id == id, ct);
            if (original == null) return Results.NotFound(new { message = $"Kegiatan dengan ID '{id}' tidak ditemukan." });

            if (!DateOnly.TryParse(request.NewDate, out var newDate))
            {
                return Results.BadRequest(new { message = "Format tanggal baru tidak valid." });
            }

            string newId = $"keg-{Guid.NewGuid().ToString("N")[..8]}";

            // 1. Create new rescheduled activity
            var newAct = new Activity
            {
                Id = newId,
                Name = request.NewName ?? original.Name,
                ActivityTypeId = original.ActivityTypeId,
                CourseId = original.CourseId,
                TopicId = original.TopicId,
                ClassGroupId = original.ClassGroupId,
                Date = newDate,
                StartTime = request.NewStartTime,
                EndTime = request.NewEndTime,
                IsAllDay = original.IsAllDay,
                RoomId = request.NewRoomId ?? original.RoomId,
                CustomPlace = original.CustomPlace,
                Notes = request.NewNotes ?? original.Notes,
                RawStatus = RawActivityStatuses.Scheduled,
                RescheduledFromId = original.Id
            };

            // Copy subjects or use new subjects
            if (request.NewSubjects != null && request.NewSubjects.Count > 0)
            {
                foreach (var s in request.NewSubjects)
                {
                    newAct.Subjects.Add(new ActivitySubject { ActivityId = newId, SubjectPersonId = s.Id, Role = s.Role });
                }
            }
            else
            {
                foreach (var s in original.Subjects)
                {
                    newAct.Subjects.Add(new ActivitySubject { ActivityId = newId, SubjectPersonId = s.SubjectPersonId, Role = s.Role });
                }
            }

            // Copy students or use new students
            if (request.NewStudentIds != null && request.NewStudentIds.Count > 0)
            {
                foreach (var sid in request.NewStudentIds.Distinct())
                {
                    newAct.Students.Add(new ActivityStudent { ActivityId = newId, StudentId = sid });
                }
            }
            else
            {
                foreach (var s in original.Students)
                {
                    newAct.Students.Add(new ActivityStudent { ActivityId = newId, StudentId = s.StudentId });
                }
            }

            // 2. Mark original as rescheduled
            original.RawStatus = RawActivityStatuses.Rescheduled;
            original.RescheduleReason = request.Reason;
            original.RescheduledToId = newId;

            db.Activities.Add(newAct);
            await db.SaveChangesAsync(ct);

            var savedOrig = await BuildActivityQuery(db).FirstAsync(a => a.Id == original.Id, ct);
            var savedNew = await BuildActivityQuery(db).FirstAsync(a => a.Id == newAct.Id, ct);

            await auditService.LogAsync(
                action: "ubah",
                category: "kegiatan",
                entityType: "kegiatan",
                entityName: original.Name,
                summary: $"Menjadwalkan ulang kegiatan: {original.Name} ke {newDate:dd MMM yyyy} ({request.NewStartTime}-{request.NewEndTime}). Alasan: {request.Reason}",
                ct: ct);

            return Results.Ok(new RescheduleResultDto(
                MapToDto(savedOrig, statusService, dtProvider),
                MapToDto(savedNew, statusService, dtProvider)));
        })
        .WithName("RescheduleActivity")
        .Produces<RescheduleResultDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static IQueryable<Activity> BuildActivityQuery(AppDbContext db)
    {
        return db.Activities
            .AsNoTracking()
            .Include(a => a.Room).ThenInclude(r => r.Place)
            .Include(a => a.ActivityType)
            .Include(a => a.Course)
            .Include(a => a.Topic)
            .Include(a => a.Subjects).ThenInclude(s => s.SubjectPerson)
            .Include(a => a.Students).ThenInclude(s => s.Student)
            .Include(a => a.Realization).ThenInclude(r => r!.ActualTopic);
    }

    private static Activity CreateSingleActivityEntity(CreateActivityRequest request, DateOnly date, string? customId)
    {
        string actId = string.IsNullOrWhiteSpace(customId) ? $"keg-{Guid.NewGuid().ToString("N")[..8]}" : customId;

        DateOnly? endDate = null;
        if (!string.IsNullOrWhiteSpace(request.EndDate) && DateOnly.TryParse(request.EndDate, out var ed))
        {
            endDate = ed >= date ? ed : date;
        }

        var act = new Activity
        {
            Id = actId,
            Name = request.Name.Trim(),
            ActivityTypeId = string.IsNullOrWhiteSpace(request.ActivityTypeId) ? null : request.ActivityTypeId,
            CourseId = string.IsNullOrWhiteSpace(request.CourseId) ? null : request.CourseId,
            TopicId = string.IsNullOrWhiteSpace(request.TopicId) ? null : request.TopicId,
            ClassGroupId = string.IsNullOrWhiteSpace(request.ClassGroupId) ? null : request.ClassGroupId,
            Date = date,
            EndDate = endDate,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsAllDay = request.IsAllDay ?? false,
            RoomId = request.RoomId,
            CustomPlace = request.CustomPlace?.Trim(),
            Notes = request.Notes?.Trim() ?? string.Empty,
            RawStatus = RawActivityStatuses.Scheduled
        };

        if (request.Subjects != null)
        {
            foreach (var s in request.Subjects)
            {
                act.Subjects.Add(new ActivitySubject
                {
                    ActivityId = actId,
                    SubjectPersonId = s.Id,
                    Role = s.Role
                });
            }
        }

        if (request.StudentIds != null)
        {
            foreach (var sid in request.StudentIds.Distinct())
            {
                act.Students.Add(new ActivityStudent
                {
                    ActivityId = actId,
                    StudentId = sid
                });
            }
        }

        return act;
    }

    private static List<DateOnly> GenerateRecurringDates(DateOnly start, RecurringRuleDto rule)
    {
        var dates = new List<DateOnly> { start };
        var current = start;

        int max = rule.TotalMeetings ?? 12;
        DateOnly? limitDate = DateOnly.TryParse(rule.UntilDate, out var ld) ? ld : null;

        while (true)
        {
            if (rule.EndType == "pertemuan" && dates.Count >= max) break;

            current = rule.Frequency switch
            {
                "dua_mingguan" => current.AddDays(14),
                "bulanan" => current.AddMonths(1),
                _ => current.AddDays(7)
            };

            if (rule.EndType == "tanggal" && limitDate.HasValue && current > limitDate.Value) break;

            dates.Add(current);
            if (dates.Count >= 52) break; // Safeguard max 52 occurrences (1 year)
        }

        return dates;
    }

    private static ActivityDto MapToDto(Activity a, ActivityStatusService statusService, IDateTimeProvider dtProvider)
    {
        var today = dtProvider.Today;
        var nowTime = dtProvider.NowTimeString;

        var status = statusService.ComputeStatus(
            a.RawStatus,
            a.Realization != null,
            a.Date,
            a.EndTime,
            today,
            nowTime,
            a.EndDate);

        var allowedActions = statusService.ComputeAllowedActions(
            status,
            a.Date,
            a.StartTime,
            today,
            nowTime);

        var effectiveEndDate = a.EndDate ?? a.Date;
        int daysLate = effectiveEndDate < today ? (today.DayNumber - effectiveEndDate.DayNumber) : 0;
        bool needsRealization = status == ActivityStatuses.PendingRealization;

        string statusLabel = status switch
        {
            ActivityStatuses.Scheduled => "Terjadwal",
            ActivityStatuses.PendingRealization => "Belum Direalisasi",
            ActivityStatuses.Realized => "Terealisasi",
            ActivityStatuses.Cancelled => "Dibatalkan",
            ActivityStatuses.Rescheduled => "Dijadwal Ulang",
            _ => status
        };

        PrimaryInstructorDto? primaryInstructor = null;
        var instructor = a.Subjects.FirstOrDefault(s => !string.IsNullOrEmpty(s.Role) && s.Role == SubjectRoles.Instructor);
        if (instructor != null)
        {
            primaryInstructor = new PrimaryInstructorDto(
                instructor.SubjectPersonId,
                instructor.SubjectPerson?.FullName ?? instructor.SubjectPersonId);
        }

        RealizationDto? realDto = null;
        if (a.Realization != null)
        {
            realDto = new RealizationDto(
                a.Realization.ActivityId,
                a.Realization.ActualStartTime,
                a.Realization.ActualEndTime,
                a.Realization.ActualTopicId,
                a.Realization.ActualTopic?.Name,
                a.Realization.CompletionStatus,
                a.Realization.Notes,
                a.Realization.StudentAttendances,
                a.Realization.StudentNotes,
                a.Realization.SubjectAttendances,
                a.Realization.SubjectNotes,
                a.Realization.FilledBy,
                a.Realization.FilledAt.ToString("yyyy-MM-dd HH:mm"));
        }

        CancellationInfoDto? cancelDto = null;
        if (!string.IsNullOrEmpty(a.CancellationReason))
        {
            cancelDto = new CancellationInfoDto(
                a.CancellationReason,
                a.CancellationNotes ?? "",
                a.CancelledAt?.ToString("yyyy-MM-dd HH:mm") ?? "",
                "Operator");
        }

        RescheduleInfoDto? rescheduleDto = null;
        if (!string.IsNullOrEmpty(a.RescheduleReason))
        {
            rescheduleDto = new RescheduleInfoDto(
                a.RescheduleReason,
                "",
                "",
                "Operator");
        }

        return new ActivityDto(
            Id: a.Id,
            Name: a.Name,
            ActivityTypeId: a.ActivityTypeId,
            CourseId: a.CourseId,
            TopicId: a.TopicId,
            ClassGroupId: a.ClassGroupId,
            Date: a.Date.ToString("yyyy-MM-dd"),
            EndDate: a.EndDate?.ToString("yyyy-MM-dd"),
            StartTime: a.StartTime,
            EndTime: a.EndTime,
            IsAllDay: a.IsAllDay,
            RoomId: a.RoomId,
            CustomPlace: a.CustomPlace,
            Subjects: a.Subjects.Select(s => new ActivitySubjectDto(s.SubjectPersonId, s.Role, s.SubjectPerson?.FullName)).ToList(),
            StudentIds: a.Students.Select(s => s.StudentId).ToList(),
            Notes: a.Notes,
            Status: status,
            RawStatus: a.RawStatus,
            Realization: realDto,
            Cancellation: cancelDto,
            Reschedule: rescheduleDto,
            RescheduledFromId: a.RescheduledFromId,
            RescheduledToId: a.RescheduledToId,
            SeriesId: a.SeriesId,
            SeriesIndex: a.SeriesOrder,
            TotalSeries: a.SeriesTotal,
            AllowedActions: allowedActions,
            PlaceId: a.Room?.PlaceId ?? "",
            PlaceName: a.Room?.Place?.Name ?? "",
            RoomName: a.Room?.Name ?? "",
            ActivityTypeName: a.ActivityType?.Name ?? "",
            ActivityTypeColor: a.ActivityType?.Color ?? "pembelajaran",
            CourseName: a.Course?.Name,
            TopicName: a.Topic?.Name,
            StudentCount: a.Students.Count,
            PrimaryInstructor: primaryInstructor,
            NeedsRealization: needsRealization,
            DaysLate: daysLate,
            StatusLabel: statusLabel,
            ConcurrencyToken: a.ConcurrencyToken);
    }
}
