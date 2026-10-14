namespace Bandrek.Server.Data.Entities;

public class Realization
{
    public string ActivityId { get; set; } = string.Empty;
    public Activity Activity { get; set; } = null!;

    public string ActualStartTime { get; set; } = string.Empty;
    public string ActualEndTime { get; set; } = string.Empty;

    public string? ActualTopicId { get; set; }
    public Topic? ActualTopic { get; set; }

    public string? CompletionStatus { get; set; } = CompletionStatuses.Completed;
    public string Notes { get; set; } = string.Empty;

    // Attendance mapped per student ID: studentId -> "hadir" | "sakit" | "izin" | "alpa"
    public Dictionary<string, string> StudentAttendances { get; set; } = new();
    public Dictionary<string, string> StudentNotes { get; set; } = new();

    // Attendance mapped per subject ID: subjectPersonId -> "hadir" | "sakit" | "izin" | "alpa"
    public Dictionary<string, string> SubjectAttendances { get; set; } = new();
    public Dictionary<string, string> SubjectNotes { get; set; } = new();

    public string FilledBy { get; set; } = string.Empty;
    public DateTimeOffset FilledAt { get; set; } = DateTimeOffset.UtcNow;
}
