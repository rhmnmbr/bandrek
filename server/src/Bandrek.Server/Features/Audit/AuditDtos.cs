namespace Bandrek.Server.Features.Audit;

public record AuditLogDto(
    string Id,
    DateTimeOffset Timestamp,
    string? UserId,
    string OperatorName,
    string OperatorUsername,
    string OperatorRole,
    string Action,
    string Category,
    string EntityType,
    string EntityName,
    string Summary,
    string? DiffsJson,
    string? IpAddress);
