namespace Bandrek.Server.Features.Realization;

public record RealizationDto(
    string ActivityId,
    string StartTime,
    string EndTime,
    string? ActualTopicId,
    string? ActualTopicName,
    string? CompletionStatus,
    string? Notes,
    Dictionary<string, string> StudentAttendances,
    Dictionary<string, string> StudentNotes,
    Dictionary<string, string> SubjectAttendances,
    Dictionary<string, string> SubjectNotes,
    string RecordedBy,
    string RecordedAt);

public record SaveRealizationRequest(
    string StartTime,
    string EndTime,
    string? ActualTopicId,
    string? CompletionStatus,
    string? Notes,
    Dictionary<string, string> StudentAttendances,
    Dictionary<string, string>? StudentNotes,
    Dictionary<string, string> SubjectAttendances,
    Dictionary<string, string>? SubjectNotes,
    string RecordedBy);
