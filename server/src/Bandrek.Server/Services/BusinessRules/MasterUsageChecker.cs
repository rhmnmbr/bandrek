using Bandrek.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Services.BusinessRules;

public class MasterUsageResult
{
    public bool CanDelete { get; set; }
    public string? Reason { get; set; }
    public int UsageCount { get; set; }
    public List<string> UsageDetails { get; set; } = new();
}

public class MasterUsageChecker
{
    private readonly AppDbContext _db;

    public MasterUsageChecker(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MasterUsageResult> CheckStudentUsageAsync(string studentId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var activityCount = await _db.ActivityStudents.CountAsync(a => a.StudentId == studentId, ct);
        if (activityCount > 0) details.Add($"Terdaftar di {activityCount} kegiatan");

        var classCount = await _db.ClassGroupStudents.CountAsync(c => c.StudentId == studentId, ct);
        if (classCount > 0) details.Add($"Terdaftar sebagai anggota di {classCount} kelas");

        var cmCount = await _db.ManualChecklists.CountAsync(cm => cm.StudentId == studentId, ct);
        if (cmCount > 0) details.Add($"Memiliki {cmCount} rekaman ceklis manual matriks");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Siswa tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckSubjectUsageAsync(string subjectId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var count = await _db.ActivitySubjects.CountAsync(a => a.SubjectPersonId == subjectId, ct);
        if (count > 0) details.Add($"Terlibat dalam {count} kegiatan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Subjek tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckClassGroupUsageAsync(string classGroupId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var count = await _db.Activities.CountAsync(a => a.ClassGroupId == classGroupId, ct);
        if (count > 0) details.Add($"Dipakai sebagai sumber impor di {count} kegiatan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Kelas tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckCourseUsageAsync(string courseId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var topicCount = await _db.Topics.CountAsync(t => t.CourseId == courseId, ct);
        if (topicCount > 0) details.Add($"Memiliki {topicCount} materi pembelajaran");

        var activityCount = await _db.Activities.CountAsync(a => a.CourseId == courseId, ct);
        if (activityCount > 0) details.Add($"Dipakai di {activityCount} kegiatan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Mata pelajaran tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckTopicUsageAsync(string topicId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var activityCount = await _db.Activities.CountAsync(
            a => a.TopicId == topicId || (a.Realization != null && a.Realization.ActualTopicId == topicId), ct);
        if (activityCount > 0) details.Add($"Tercatat di {activityCount} kegiatan");

        var cmCount = await _db.ManualChecklists.CountAsync(cm => cm.TopicId == topicId, ct);
        if (cmCount > 0) details.Add($"Tercatat di {cmCount} ceklis manual matriks");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Materi tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckPlaceUsageAsync(string placeId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var roomCount = await _db.Rooms.CountAsync(r => r.PlaceId == placeId, ct);
        if (roomCount > 0) details.Add($"Memiliki {roomCount} ruangan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Tempat tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckRoomUsageAsync(string roomId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var count = await _db.Activities.CountAsync(a => a.RoomId == roomId, ct);
        if (count > 0) details.Add($"Dipakai di {count} kegiatan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Ruangan tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }

    public async Task<MasterUsageResult> CheckActivityTypeUsageAsync(string typeId, CancellationToken ct = default)
    {
        var details = new List<string>();

        var count = await _db.Activities.CountAsync(a => a.ActivityTypeId == typeId, ct);
        if (count > 0) details.Add($"Dipakai di {count} kegiatan");

        bool canDelete = details.Count == 0;
        return new MasterUsageResult
        {
            CanDelete = canDelete,
            Reason = canDelete ? null : $"Jenis kegiatan tidak dapat dihapus karena masih digunakan: {string.Join("; ", details)}.",
            UsageCount = details.Count,
            UsageDetails = details
        };
    }
}
