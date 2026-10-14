namespace Bandrek.Server.Features.Master;

public record TopicDto(
    string Id,
    string CourseId,
    string Name,
    List<string> EducationalLevels,
    bool IsActive,
    int OrderIndex,
    int ActivityCount,
    int ManualChecklistCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CourseDto(
    string Id,
    string Name,
    bool IsActive,
    List<TopicDto> Topics,
    int TopicCount,
    int ActivityCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreateCourseRequest(
    string? Id,
    string Name,
    bool? IsActive);

public record UpdateCourseRequest(
    string? Name,
    bool? IsActive);

public record CreateTopicRequest(
    string? Id,
    string CourseId,
    string Name,
    List<string>? EducationalLevels,
    bool? IsActive,
    int? OrderIndex);

public record UpdateTopicRequest(
    string? Name,
    List<string>? EducationalLevels,
    bool? IsActive,
    int? OrderIndex);

public record ReorderTopicsRequest(
    List<string> OrderedTopicIds);
