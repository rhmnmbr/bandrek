using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Services.BusinessRules;

public class ConflictItem
{
    public string Type { get; set; } = "ruangan"; // "ruangan" | "subjek" | "siswa"
    public string EntityId { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string ConflictingActivityId { get; set; } = string.Empty;
    public string ConflictingActivityName { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ConflictDetectionResult
{
    public bool HasConflict { get; set; }
    public List<ConflictItem> Conflicts { get; set; } = new();
    public string Summary { get; set; } = "Tidak ada bentrok jadwal.";
}

public class ConflictDetector
{
    private readonly AppDbContext _db;

    public ConflictDetector(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ConflictDetectionResult> DetectAsync(
        DateOnly date,
        string startTime,
        string endTime,
        string roomId,
        IEnumerable<string> subjectIds,
        IEnumerable<string> studentIds,
        string? excludeActivityId = null,
        CancellationToken ct = default)
    {
        var subjectIdSet = subjectIds.ToHashSet();
        var studentIdSet = studentIds.ToHashSet();

        // 1. Fetch potential overlapping activities on the same date
        var candidateActivities = await _db.Activities
            .AsNoTracking()
            .Include(a => a.Room)
            .Include(a => a.Subjects).ThenInclude(s => s.SubjectPerson)
            .Include(a => a.Students).ThenInclude(s => s.Student)
            .Where(a => a.Date == date &&
                        a.RawStatus != RawActivityStatuses.Cancelled &&
                        a.RawStatus != RawActivityStatuses.Rescheduled &&
                        (excludeActivityId == null || a.Id != excludeActivityId) &&
                        a.StartTime.CompareTo(endTime) < 0 &&
                        a.EndTime.CompareTo(startTime) > 0)
            .ToListAsync(ct);

        var conflicts = new List<ConflictItem>();

        // Fetch room info if present
        string roomName = "Ruangan";
        if (!string.IsNullOrEmpty(roomId))
        {
            var room = await _db.Rooms.AsNoTracking().FirstOrDefaultAsync(r => r.Id == roomId, ct);
            if (room != null) roomName = room.Name;
        }

        foreach (var act in candidateActivities)
        {
            // A. Room Conflict
            if (!string.IsNullOrEmpty(roomId) && act.RoomId == roomId)
            {
                conflicts.Add(new ConflictItem
                {
                    Type = "ruangan",
                    EntityId = roomId,
                    EntityName = act.Room?.Name ?? roomName,
                    ConflictingActivityId = act.Id,
                    ConflictingActivityName = act.Name,
                    StartTime = act.StartTime,
                    EndTime = act.EndTime,
                    Description = $"Ruangan \"{act.Room?.Name ?? roomName}\" sudah dipakai oleh \"{act.Name}\" ({act.StartTime} - {act.EndTime})"
                });
            }

            // B. Subject Conflict
            foreach (var asub in act.Subjects)
            {
                if (subjectIdSet.Contains(asub.SubjectPersonId))
                {
                    var sName = asub.SubjectPerson?.FullName ?? "Subjek";
                    conflicts.Add(new ConflictItem
                    {
                        Type = "subjek",
                        EntityId = asub.SubjectPersonId,
                        EntityName = sName,
                        ConflictingActivityId = act.Id,
                        ConflictingActivityName = act.Name,
                        StartTime = act.StartTime,
                        EndTime = act.EndTime,
                        Description = $"{sName} sudah terjadwal di \"{act.Name}\" ({act.StartTime} - {act.EndTime})"
                    });
                }
            }

            // C. Student Conflict
            foreach (var ast in act.Students)
            {
                if (studentIdSet.Contains(ast.StudentId))
                {
                    var stName = ast.Student?.FullName ?? "Siswa";
                    conflicts.Add(new ConflictItem
                    {
                        Type = "siswa",
                        EntityId = ast.StudentId,
                        EntityName = stName,
                        ConflictingActivityId = act.Id,
                        ConflictingActivityName = act.Name,
                        StartTime = act.StartTime,
                        EndTime = act.EndTime,
                        Description = $"{stName} sudah dijadwalkan di \"{act.Name}\" ({act.StartTime} - {act.EndTime})"
                    });
                }
            }
        }

        bool hasConflict = conflicts.Count > 0;
        string summary = "Tidak ada bentrok jadwal.";
        if (hasConflict)
        {
            var rCount = conflicts.Count(c => c.Type == "ruangan");
            var subCount = conflicts.Count(c => c.Type == "subjek");
            var stCount = conflicts.Count(c => c.Type == "siswa");

            var parts = new List<string>();
            if (rCount > 0) parts.Add($"{rCount} bentrok ruangan");
            if (subCount > 0) parts.Add($"{subCount} bentrok pengisi/subjek");
            if (stCount > 0) parts.Add($"{stCount} bentrok siswa");

            summary = $"Ditemukan bentrok jadwal: {string.Join(", ", parts)}.";
        }

        return new ConflictDetectionResult
        {
            HasConflict = hasConflict,
            Conflicts = conflicts,
            Summary = summary
        };
    }
}
