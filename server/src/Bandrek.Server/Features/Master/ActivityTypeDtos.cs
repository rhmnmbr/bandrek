namespace Bandrek.Server.Features.Master;

public record ActivityTypeDto(
    string Id,
    string Name,
    string Color,
    bool RequiresTopic,
    bool RequiresStudents,
    int ActivityCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreateActivityTypeRequest(
    string? Id,
    string Name,
    string? Color,
    bool? RequiresTopic,
    bool? RequiresStudents);

public record UpdateActivityTypeRequest(
    string? Name,
    string? Color,
    bool? RequiresTopic,
    bool? RequiresStudents);
