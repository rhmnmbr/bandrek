using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Services.BusinessRules;

public class LearningMatrixHistoryItem
{
    public string ActivityId { get; set; } = string.Empty;
    public string ActivityName { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty; // YYYY-MM-DD
    public string? AttendanceStatus { get; set; }
    public string? CompletionStatus { get; set; }
    public bool HasRealization { get; set; }
}

public class LearningMatrixCell
{
    public string StudentId { get; set; } = string.Empty;
    public string TopicId { get; set; } = string.Empty;
    public string State { get; set; } = "kosong"; // kosong | terjadwal | tersampaikan | selesai_manual | sakit | izin | alpa
    public string? ActivityId { get; set; }
    public string? Date { get; set; }
    public string? CompletionStatus { get; set; }
    public string? ManualChecklistId { get; set; }
    public string? ManualNotes { get; set; }
    public string? ManualRecordedBy { get; set; }
    public string? ManualRecordedAt { get; set; }
    public List<LearningMatrixHistoryItem> History { get; set; } = new();
}

public class LearningMatrixColumn
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public List<string> EducationalLevels { get; set; } = new();
    public int OrderIndex { get; set; }
    public string? LatestScheduledDate { get; set; }
}

public class LearningMatrixRow
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? EducationalLevel { get; set; }
    public bool IsActive { get; set; }
    public List<string> ClassGroupIds { get; set; } = new();
    public List<string> ClassGroupNames { get; set; } = new();
}

public class LearningMatrixColumnSummary
{
    public string TopicId { get; set; } = string.Empty;
    public int DeliveredCount { get; set; }
    public int TotalStudents { get; set; }
    public int Percentage { get; set; }
}

public class LaggingStudentItem
{
    public string StudentId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int MissingTopicsCount { get; set; }
    public int TotalTopicsCount { get; set; }
    public int MissingPercentage { get; set; }
}

public class MostLaggingTopicItem
{
    public string TopicId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int MissingCount { get; set; }
    public string? LatestScheduledDate { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class LearningMatrixResult
{
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public List<LearningMatrixColumn> Columns { get; set; } = new();
    public List<LearningMatrixRow> Rows { get; set; } = new();
    public Dictionary<string, Dictionary<string, LearningMatrixCell>> Cells { get; set; } = new();
    public Dictionary<string, LearningMatrixColumnSummary> ColumnSummaries { get; set; } = new();
    public List<LaggingStudentItem> LaggingStudents { get; set; } = new();
    public int LaggingThresholdCount { get; set; }
    public MostLaggingTopicItem? MostLaggingTopic { get; set; }
    public int PendingRealizationCount { get; set; }
}

public class LearningMatrixEngine
{
    private readonly AppDbContext _db;

    public LearningMatrixEngine(AppDbContext db)
    {
        _db = db;
    }

    public async Task<LearningMatrixResult> ComputeAsync(
        string courseId,
        string? classGroupId = null,
        string? searchQuery = null,
        bool showInactive = false,
        CancellationToken ct = default)
    {
        var course = await _db.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId, ct);
        var courseName = course?.Name ?? "Mata Pelajaran";

        // 1. Fetch active topics ordered by OrderIndex
        var topics = await _db.Topics
            .AsNoTracking()
            .Where(t => t.CourseId == courseId && t.IsActive)
            .OrderBy(t => t.OrderIndex)
            .ToListAsync(ct);

        // 2. Fetch all activities referencing these topics
        var topicIds = topics.Select(t => t.Id).ToHashSet();
        var activities = await _db.Activities
            .AsNoTracking()
            .Include(a => a.Realization)
            .Include(a => a.Students)
            .Where(a => (a.TopicId != null && topicIds.Contains(a.TopicId)) ||
                        (a.Realization != null && a.Realization.ActualTopicId != null && topicIds.Contains(a.Realization.ActualTopicId)))
            .Where(a => a.RawStatus != RawActivityStatuses.Cancelled && a.RawStatus != RawActivityStatuses.Rescheduled)
            .ToListAsync(ct);

        // 3. Build Column metadata
        var columns = new List<LearningMatrixColumn>();
        for (int i = 0; i < topics.Count; i++)
        {
            var t = topics[i];
            var latestDate = activities
                .Where(a => a.TopicId == t.Id || a.Realization?.ActualTopicId == t.Id)
                .OrderByDescending(a => a.Date)
                .Select(a => a.Date.ToString("yyyy-MM-dd"))
                .FirstOrDefault();

            columns.Add(new LearningMatrixColumn
            {
                Id = t.Id,
                CourseId = t.CourseId,
                Name = t.Name,
                EducationalLevels = t.EducationalLevels,
                OrderIndex = i + 1,
                LatestScheduledDate = latestDate
            });
        }

        // 4. Fetch students matching filter
        var studentsQuery = _db.Students.AsNoTracking().AsQueryable();
        if (!showInactive)
        {
            studentsQuery = studentsQuery.Where(s => s.IsActive);
        }

        if (!string.IsNullOrEmpty(classGroupId))
        {
            studentsQuery = studentsQuery.Where(s => s.ClassGroups.Any(cg => cg.ClassGroupId == classGroupId));
        }

        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            var q = searchQuery.Trim().ToLower();
            studentsQuery = studentsQuery.Where(s => s.FullName.ToLower().Contains(q));
        }

        var students = await studentsQuery
            .Include(s => s.ClassGroups).ThenInclude(cg => cg.ClassGroup)
            .OrderBy(s => s.FullName)
            .ToListAsync(ct);

        var rows = students.Select(s => new LearningMatrixRow
        {
            Id = s.Id,
            FullName = s.FullName,
            EducationalLevel = s.EducationalLevel,
            IsActive = s.IsActive,
            ClassGroupIds = s.ClassGroups.Select(cg => cg.ClassGroupId).ToList(),
            ClassGroupNames = s.ClassGroups.Select(cg => cg.ClassGroup.Name).ToList()
        }).ToList();

        var studentIds = students.Select(s => s.Id).ToHashSet();

        // 5. Initialize cells [studentId][topicId]
        var cells = new Dictionary<string, Dictionary<string, LearningMatrixCell>>();
        foreach (var s in rows)
        {
            cells[s.Id] = new Dictionary<string, LearningMatrixCell>();
            foreach (var col in columns)
            {
                cells[s.Id][col.Id] = new LearningMatrixCell
                {
                    StudentId = s.Id,
                    TopicId = col.Id,
                    State = "kosong"
                };
            }
        }

        // 6. Fill cells from Activities & Realizations
        foreach (var act in activities)
        {
            var effectiveTopicId = act.Realization?.ActualTopicId ?? act.TopicId;
            if (string.IsNullOrEmpty(effectiveTopicId) || !topicIds.Contains(effectiveTopicId)) continue;

            string dateStr = act.Date.ToString("yyyy-MM-dd");

            if (act.Realization != null && act.RawStatus == RawActivityStatuses.Realized)
            {
                // Activities that are realized
                var allParticipants = act.Students.Select(s => s.StudentId)
                    .Concat(act.Realization.StudentAttendances.Keys)
                    .Distinct();

                foreach (var sId in allParticipants)
                {
                    if (!studentIds.Contains(sId)) continue;
                    act.Realization.StudentAttendances.TryGetValue(sId, out var attStatus);

                    var cell = cells[sId][effectiveTopicId];
                    cell.History.Add(new LearningMatrixHistoryItem
                    {
                        ActivityId = act.Id,
                        ActivityName = act.Name,
                        Date = dateStr,
                        AttendanceStatus = attStatus,
                        CompletionStatus = act.Realization.CompletionStatus,
                        HasRealization = true
                    });

                    // Priority rules: tersampaikan / selesai_manual > terjadwal > alpa > izin > sakit > kosong
                    if (attStatus == AttendanceStatuses.Present)
                    {
                        cell.State = "tersampaikan";
                        cell.ActivityId = act.Id;
                        cell.Date = dateStr;
                        cell.CompletionStatus = act.Realization.CompletionStatus;
                    }
                    else if (cell.State != "tersampaikan" && cell.State != "selesai_manual")
                    {
                        if (attStatus == AttendanceStatuses.Absent && cell.State != "terjadwal")
                        {
                            cell.State = "alpa";
                            cell.ActivityId = act.Id;
                            cell.Date = dateStr;
                            cell.CompletionStatus = act.Realization.CompletionStatus;
                        }
                        else if (attStatus == AttendanceStatuses.Permitted && cell.State != "terjadwal" && cell.State != "alpa")
                        {
                            cell.State = "izin";
                            cell.ActivityId = act.Id;
                            cell.Date = dateStr;
                            cell.CompletionStatus = act.Realization.CompletionStatus;
                        }
                        else if (attStatus == AttendanceStatuses.Sick && cell.State != "terjadwal" && cell.State != "alpa" && cell.State != "izin")
                        {
                            cell.State = "sakit";
                            cell.ActivityId = act.Id;
                            cell.Date = dateStr;
                            cell.CompletionStatus = act.Realization.CompletionStatus;
                        }
                    }
                }
            }
            else
            {
                // Scheduled / Pending activities
                foreach (var ast in act.Students)
                {
                    if (!studentIds.Contains(ast.StudentId)) continue;
                    var cell = cells[ast.StudentId][effectiveTopicId];
                    cell.History.Add(new LearningMatrixHistoryItem
                    {
                        ActivityId = act.Id,
                        ActivityName = act.Name,
                        Date = dateStr,
                        AttendanceStatus = null,
                        CompletionStatus = null,
                        HasRealization = false
                    });

                    if (cell.State != "tersampaikan" && cell.State != "selesai_manual")
                    {
                        cell.State = "terjadwal";
                        cell.ActivityId = act.Id;
                        cell.Date = dateStr;
                    }
                }
            }
        }

        // Sort history descending by date
        foreach (var s in rows)
        {
            foreach (var col in columns)
            {
                cells[s.Id][col.Id].History.Sort((a, b) => string.CompareOrdinal(b.Date, a.Date));
            }
        }

        // 7. Fill cells from ManualChecklists
        var manualChecklists = await _db.ManualChecklists
            .AsNoTracking()
            .Where(cm => topicIds.Contains(cm.TopicId) && studentIds.Contains(cm.StudentId))
            .ToListAsync(ct);

        foreach (var cm in manualChecklists)
        {
            var cell = cells[cm.StudentId][cm.TopicId];
            if (cell.State != "tersampaikan")
            {
                cell.State = "selesai_manual";
                cell.Date = cm.Date?.ToString("yyyy-MM-dd");
                cell.ManualChecklistId = cm.Id;
                cell.ManualNotes = cm.Notes;
                cell.ManualRecordedBy = cm.RecordedBy;
                cell.ManualRecordedAt = cm.RecordedAt.ToString("yyyy-MM-dd HH:mm");
            }
        }

        // 8. Column summaries ("Menerima")
        var columnSummaries = new Dictionary<string, LearningMatrixColumnSummary>();
        int totalStudents = rows.Count;
        foreach (var col in columns)
        {
            int delivered = 0;
            foreach (var s in rows)
            {
                var st = cells[s.Id][col.Id].State;
                if (st == "tersampaikan" || st == "selesai_manual")
                {
                    delivered++;
                }
            }
            columnSummaries[col.Id] = new LearningMatrixColumnSummary
            {
                TopicId = col.Id,
                DeliveredCount = delivered,
                TotalStudents = totalStudents,
                Percentage = totalStudents > 0 ? (int)Math.Round((double)delivered / totalStudents * 100) : 0
            };
        }

        // 9. Lagging students (missing >= 40% of topics, minimum 2)
        int totalTopics = columns.Count;
        int minMissingThreshold = Math.Max(2, (int)Math.Ceiling(0.4 * totalTopics));
        var laggingStudents = new List<LaggingStudentItem>();

        foreach (var s in rows)
        {
            int missingCount = 0;
            foreach (var col in columns)
            {
                var st = cells[s.Id][col.Id].State;
                if (st != "tersampaikan" && st != "selesai_manual")
                {
                    missingCount++;
                }
            }

            if (missingCount >= minMissingThreshold)
            {
                laggingStudents.Add(new LaggingStudentItem
                {
                    StudentId = s.Id,
                    FullName = s.FullName,
                    MissingTopicsCount = missingCount,
                    TotalTopicsCount = totalTopics,
                    MissingPercentage = totalTopics > 0 ? (int)Math.Round((double)missingCount / totalTopics * 100) : 0
                });
            }
        }
        laggingStudents.Sort((a, b) => b.MissingTopicsCount.CompareTo(a.MissingTopicsCount));

        // 10. Most lagging topic with tie-breaker
        MostLaggingTopicItem? mostLaggingTopic = null;
        if (columns.Count > 0 && totalStudents > 0)
        {
            var topicStats = columns.Select(col =>
            {
                var delivered = columnSummaries[col.Id].DeliveredCount;
                var missing = totalStudents - delivered;
                return new
                {
                    col.Id,
                    col.Name,
                    col.OrderIndex,
                    col.LatestScheduledDate,
                    MissingCount = missing
                };
            }).ToList();

            bool allEqual = topicStats.All(t => t.MissingCount == topicStats[0].MissingCount);
            var sorted = topicStats
                .OrderByDescending(t => t.MissingCount)
                .ThenBy(t => t.LatestScheduledDate ?? "9999-99-99")
                .ThenBy(t => t.OrderIndex)
                .ToList();

            var top = sorted[0];
            if (allEqual && top.MissingCount == 0)
            {
                mostLaggingTopic = new MostLaggingTopicItem
                {
                    TopicId = "",
                    Name = "Semua tuntas",
                    MissingCount = 0,
                    LatestScheduledDate = null,
                    Reason = "Semua materi telah tersampaikan ke seluruh siswa"
                };
            }
            else if (allEqual)
            {
                mostLaggingTopic = new MostLaggingTopicItem
                {
                    TopicId = "",
                    Name = "Semua merata",
                    MissingCount = top.MissingCount,
                    LatestScheduledDate = null,
                    Reason = $"tiap materi belum diterima {top.MissingCount} siswa"
                };
            }
            else if (top.MissingCount > 0)
            {
                mostLaggingTopic = new MostLaggingTopicItem
                {
                    TopicId = top.Id,
                    Name = top.Name,
                    MissingCount = top.MissingCount,
                    LatestScheduledDate = top.LatestScheduledDate,
                    Reason = $"belum diterima {top.MissingCount} dari {totalStudents} siswa"
                };
            }
        }

        // Count pending realizations
        var pendingCount = await _db.Activities
            .CountAsync(a => a.RawStatus == RawActivityStatuses.Pending, ct);

        return new LearningMatrixResult
        {
            CourseId = courseId,
            CourseName = courseName,
            Columns = columns,
            Rows = rows,
            Cells = cells,
            ColumnSummaries = columnSummaries,
            LaggingStudents = laggingStudents,
            LaggingThresholdCount = minMissingThreshold,
            MostLaggingTopic = mostLaggingTopic,
            PendingRealizationCount = pendingCount
        };
    }
}
