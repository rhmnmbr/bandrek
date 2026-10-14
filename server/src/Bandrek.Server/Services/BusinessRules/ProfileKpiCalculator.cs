using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Services.BusinessRules;

public class StudentCourseCoverage
{
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public int DeliveredTopics { get; set; }
    public int TotalTopics { get; set; }
    public int Percentage { get; set; }
}

public class StudentMissedTopic
{
    public string CourseId { get; set; } = string.Empty;
    public string TopicId { get; set; } = string.Empty;
    public string TopicName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class StudentProfileData
{
    public Student Student { get; set; } = null!;
    public int TotalActivities { get; set; }
    public int PresentCount { get; set; }
    public int SickCount { get; set; }
    public int PermittedCount { get; set; }
    public int AbsentCount { get; set; }
    public int AttendanceRate { get; set; } // percentage
    public List<StudentCourseCoverage> Coverage { get; set; } = new();
    public List<StudentMissedTopic> MissedTopics { get; set; } = new();
}

public class SubjectWorkloadDay
{
    public string DayName { get; set; } = string.Empty;
    public string Hours { get; set; } = "0 jam";
    public int ActivitiesCount { get; set; }
    public bool ExceedsComfortLimit { get; set; }
}

public class SubjectProfileData
{
    public SubjectPerson Subject { get; set; } = null!;
    public int TotalActivities { get; set; }
    public int TeachingHoursThisWeek { get; set; }
    public int PendingRealizationsCount { get; set; }
    public List<SubjectWorkloadDay> WeeklyWorkload { get; set; } = new();
}

public class ProfileKpiCalculator
{
    private readonly AppDbContext _db;

    public ProfileKpiCalculator(AppDbContext db)
    {
        _db = db;
    }

    public async Task<StudentProfileData?> CalculateStudentProfileAsync(string studentId, CancellationToken ct = default)
    {
        var student = await _db.Students
            .AsNoTracking()
            .Include(s => s.ClassGroups).ThenInclude(cg => cg.ClassGroup)
            .FirstOrDefaultAsync(s => s.Id == studentId, ct);

        if (student == null) return null;

        // Fetch realizations involving this student via ActivityStudents relation
        var activityIds = await _db.ActivityStudents
            .Where(ast => ast.StudentId == studentId)
            .Select(ast => ast.ActivityId)
            .ToListAsync(ct);

        var realizations = await _db.Realizations
            .AsNoTracking()
            .Include(r => r.Activity)
            .Where(r => activityIds.Contains(r.ActivityId))
            .ToListAsync(ct);

        int present = 0, sick = 0, permitted = 0, absent = 0;
        foreach (var r in realizations)
        {
            if (r.StudentAttendances.TryGetValue(studentId, out var st))
            {
                switch (st)
                {
                    case AttendanceStatuses.Present: present++; break;
                    case AttendanceStatuses.Sick: sick++; break;
                    case AttendanceStatuses.Permitted: permitted++; break;
                    case AttendanceStatuses.Absent: absent++; break;
                }
            }
        }

        int totalAttended = present + sick + permitted + absent;
        int rate = totalAttended > 0 ? (int)Math.Round((double)present / totalAttended * 100) : 0;

        // Calculate course coverages
        var courses = await _db.Courses
            .AsNoTracking()
            .Include(c => c.Topics)
            .Where(c => c.IsActive)
            .ToListAsync(ct);

        var manualChecks = await _db.ManualChecklists
            .AsNoTracking()
            .Where(cm => cm.StudentId == studentId)
            .Select(cm => cm.TopicId)
            .ToListAsync(ct);
        var manualSet = manualChecks.ToHashSet();

        var deliveredTopicIds = realizations
            .Where(r => r.StudentAttendances.TryGetValue(studentId, out var s) && s == AttendanceStatuses.Present)
            .Select(r => r.ActualTopicId ?? r.Activity?.TopicId)
            .Where(tid => !string.IsNullOrEmpty(tid))
            .Concat(manualSet)
            .ToHashSet();

        var coverages = new List<StudentCourseCoverage>();
        var missedTopics = new List<StudentMissedTopic>();

        foreach (var c in courses)
        {
            var activeTopics = c.Topics.Where(t => t.IsActive).ToList();
            int total = activeTopics.Count;
            int delivered = activeTopics.Count(t => deliveredTopicIds.Contains(t.Id));
            int pct = total > 0 ? (int)Math.Round((double)delivered / total * 100) : 0;

            coverages.Add(new StudentCourseCoverage
            {
                CourseId = c.Id,
                CourseName = c.Name,
                DeliveredTopics = delivered,
                TotalTopics = total,
                Percentage = pct
            });

            // Missed topics
            foreach (var t in activeTopics)
            {
                if (!deliveredTopicIds.Contains(t.Id))
                {
                    missedTopics.Add(new StudentMissedTopic
                    {
                        CourseId = c.Id,
                        TopicId = t.Id,
                        TopicName = t.Name,
                        Reason = "Belum terjadwal atau belum hadir"
                    });
                }
            }
        }

        return new StudentProfileData
        {
            Student = student,
            TotalActivities = totalAttended,
            PresentCount = present,
            SickCount = sick,
            PermittedCount = permitted,
            AbsentCount = absent,
            AttendanceRate = rate,
            Coverage = coverages,
            MissedTopics = missedTopics
        };
    }

    public async Task<SubjectProfileData?> CalculateSubjectProfileAsync(string subjectId, CancellationToken ct = default)
    {
        var subject = await _db.Subjects
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == subjectId, ct);

        if (subject == null) return null;

        var totalActivities = await _db.ActivitySubjects
            .CountAsync(a => a.SubjectPersonId == subjectId, ct);

        var pendingCount = await _db.Activities
            .CountAsync(a => a.RawStatus == RawActivityStatuses.Pending &&
                             a.Subjects.Any(s => s.SubjectPersonId == subjectId), ct);

        return new SubjectProfileData
        {
            Subject = subject,
            TotalActivities = totalActivities,
            TeachingHoursThisWeek = 0,
            PendingRealizationsCount = pendingCount,
            WeeklyWorkload = new List<SubjectWorkloadDay>()
        };
    }
}
