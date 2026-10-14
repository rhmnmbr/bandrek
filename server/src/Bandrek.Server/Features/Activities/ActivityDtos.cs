using Bandrek.Server.Features.Realization;

namespace Bandrek.Server.Features.Activities;

public record ActivitySubjectDto(
    string Id,
    string Role,
    string? Name = null);

public record PrimaryInstructorDto(
    string Id,
    string Name);

public record CancellationInfoDto(
    string Reason,
    string Notes,
    string At,
    string? By);

public record RescheduleInfoDto(
    string Reason,
    string Notes,
    string At,
    string? By);

public record RecurringRuleDto(
    bool IsActive,
    string Frequency, // "mingguan" | "dua_mingguan" | "bulanan"
    string EndType,   // "pertemuan" | "tanggal"
    int? TotalMeetings,
    string? UntilDate);

public record ConflictItemDto(
    string Type,
    string EntityId,
    string EntityName,
    string ConflictingActivityId,
    string ConflictingActivityName,
    string StartTime,
    string EndTime,
    string Description);

public record ConflictCheckRequest(
    string Date,
    string StartTime,
    string EndTime,
    string RoomId,
    List<string> SubjectIds,
    List<string> StudentIds,
    string? ExcludeActivityId);

public record ConflictCheckResponse(
    bool HasConflict,
    List<ConflictItemDto> Conflicts,
    string Summary);

public record ActivityDto(
    string Id,
    string Name,
    string ActivityTypeId,
    string? CourseId,
    string? TopicId,
    string? ClassGroupId,
    string Date,
    string StartTime,
    string EndTime,
    bool IsAllDay,
    string RoomId,
    string? CustomPlace,
    List<ActivitySubjectDto> Subjects,
    List<string> StudentIds,
    string Notes,
    string Status,
    string RawStatus,
    RealizationDto? Realization,
    CancellationInfoDto? Cancellation,
    RescheduleInfoDto? Reschedule,
    string? RescheduledFromId,
    string? RescheduledToId,
    string? SeriesId,
    int? SeriesIndex,
    int? TotalSeries,
    List<string> AllowedActions,
    string PlaceId,
    string PlaceName,
    string RoomName,
    string ActivityTypeName,
    string ActivityTypeColor,
    string? CourseName,
    string? TopicName,
    int StudentCount,
    PrimaryInstructorDto? PrimaryInstructor,
    bool NeedsRealization,
    int DaysLate,
    string StatusLabel,
    uint ConcurrencyToken);

public record CreateActivityRequest(
    string? Id,
    string Name,
    string ActivityTypeId,
    string? CourseId,
    string? TopicId,
    string? ClassGroupId,
    string Date,
    string StartTime,
    string EndTime,
    bool? IsAllDay,
    string RoomId,
    string? CustomPlace,
    List<ActivitySubjectDto> Subjects,
    List<string> StudentIds,
    string? Notes,
    RecurringRuleDto? Recurring);

public record UpdateActivityRequest(
    string? Name,
    string? ActivityTypeId,
    string? CourseId,
    string? TopicId,
    string? ClassGroupId,
    string? Date,
    string? StartTime,
    string? EndTime,
    bool? IsAllDay,
    string? RoomId,
    string? CustomPlace,
    List<ActivitySubjectDto>? Subjects,
    List<string>? StudentIds,
    string? Notes,
    uint? ConcurrencyToken);

public record CancelActivityRequest(
    string Reason,
    string? Notes,
    bool? RescheduleAlso);

public record RescheduleActivityRequest(
    string Reason,
    string? Notes,
    string NewDate,
    string NewStartTime,
    string NewEndTime,
    string? NewRoomId,
    string? NewName,
    List<ActivitySubjectDto>? NewSubjects,
    List<string>? NewStudentIds,
    string? NewNotes);

public record RescheduleResultDto(
    ActivityDto OriginalActivity,
    ActivityDto NewActivity);
