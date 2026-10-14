namespace Bandrek.Server.Data.Entities;

public class AuditLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
    public string? UserId { get; set; }
    public string OperatorName { get; set; } = string.Empty;
    public string OperatorUsername { get; set; } = string.Empty;
    public string OperatorRole { get; set; } = UserRoles.Operator;
    public string Action { get; set; } = "ubah";
    public string Category { get; set; } = "kegiatan";
    public string EntityType { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string? DiffsJson { get; set; }
    public string? IpAddress { get; set; }
}
