namespace Bandrek.Server.Features.Master;

public record StudentDto(
    string Id,
    string FullName,
    string EducationalLevel,
    bool IsActive,
    string BirthDate,
    string Gender,
    string? SchoolOrigin,
    string? GuardianName,
    string? GuardianPhone,
    string? JoinedDate,
    string? Notes,
    List<string> ClassGroupIds,
    List<string> ClassGroupNames,
    int ActivityCount,
    int ClassCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreateStudentRequest(
    string? Id,
    string FullName,
    string EducationalLevel,
    bool? IsActive,
    string BirthDate,
    string Gender,
    string? SchoolOrigin,
    string? GuardianName,
    string? GuardianPhone,
    string? JoinedDate,
    string? Notes);

public record UpdateStudentRequest(
    string? FullName,
    string? EducationalLevel,
    bool? IsActive,
    string? BirthDate,
    string? Gender,
    string? SchoolOrigin,
    string? GuardianName,
    string? GuardianPhone,
    string? JoinedDate,
    string? Notes);
