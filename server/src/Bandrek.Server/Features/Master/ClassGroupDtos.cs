namespace Bandrek.Server.Features.Master;

public record ClassGroupDto(
    string Id,
    string Name,
    string? EducationalLevel,
    string? Description,
    List<string> StudentIds,
    List<string> StudentNames,
    int StudentCount,
    int ActivityCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreateClassGroupRequest(
    string? Id,
    string Name,
    string? EducationalLevel,
    string? Description,
    List<string>? StudentIds);

public record UpdateClassGroupRequest(
    string? Name,
    string? EducationalLevel,
    string? Description);

public record UpdateClassMemberRequest(
    string StudentId,
    bool Add);
