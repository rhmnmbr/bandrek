namespace Bandrek.Server.Data.Entities;

public class ActivityType
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "pembelajaran";
    public bool RequiresTopic { get; set; } = true;
    public bool RequiresStudents { get; set; } = true;

    // Navigation properties
    public List<Activity> Activities { get; set; } = new();
}
