namespace Bandrek.Server.Data.Entities;

public class Course
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public List<Topic> Topics { get; set; } = new();
    public List<Activity> Activities { get; set; } = new();
}

public class Topic
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public Course Course { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public List<string> EducationalLevels { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public int OrderIndex { get; set; } = 1;

    // Navigation properties
    public List<Activity> PlannedActivities { get; set; } = new();
    public List<Realization> RealizedActivities { get; set; } = new();
    public List<ManualChecklist> ManualChecklists { get; set; } = new();
}
