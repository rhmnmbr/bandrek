namespace Bandrek.Server.Features.LearningMatrix;

public record MarkManualChecklistRequest(
    string StudentId,
    string TopicId,
    string? Date,
    string? Notes,
    string? RecordedBy);

public record BulkMarkManualChecklistRequest(
    List<MarkManualChecklistRequest> Items);

public record ManualChecklistKeyDto(
    string StudentId,
    string TopicId);

public record BulkDeleteManualChecklistRequest(
    List<ManualChecklistKeyDto> Keys);

public record BulkDeleteResultDto(int DeletedCount);

public record ManualChecklistDto(
    string Id,
    string StudentId,
    string TopicId,
    string? Date,
    string? Notes,
    string RecordedBy,
    DateTimeOffset RecordedAt);
