namespace Bandrek.Server.Features.Master;

public record WeeklyAvailabilityDto(
    string Day,
    string From,
    string To);

public record SubjectDto(
    string Id,
    string FullName,
    string Gender,
    string Role,
    bool IsActive,
    string? Contact,
    List<string> CourseIds,
    List<WeeklyAvailabilityDto> WeeklyAvailabilities,
    int ActivityCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreateSubjectRequest(
    string? Id,
    string FullName,
    string Gender,
    string? Role,
    bool? IsActive,
    string? Contact,
    List<string>? CourseIds,
    List<WeeklyAvailabilityDto>? WeeklyAvailabilities);

public record UpdateSubjectRequest(
    string? FullName,
    string? Gender,
    string? Role,
    bool? IsActive,
    string? Contact,
    List<string>? CourseIds);
