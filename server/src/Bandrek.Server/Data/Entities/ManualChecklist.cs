namespace Bandrek.Server.Data.Entities;

public class ManualChecklist
{
    public string Id { get; set; } = string.Empty;

    public string StudentId { get; set; } = string.Empty;
    public Student Student { get; set; } = null!;

    public string TopicId { get; set; } = string.Empty;
    public Topic Topic { get; set; } = null!;

    public DateOnly? Date { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string RecordedBy { get; set; } = string.Empty;
    public DateTimeOffset RecordedAt { get; set; } = DateTimeOffset.UtcNow;
    public string Source { get; set; } = "manual";
}
