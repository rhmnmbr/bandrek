namespace Bandrek.Server.Data.Entities;

public class ClassGroup
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? EducationalLevel { get; set; }
    public string? Description { get; set; }

    // Navigation properties
    public List<ClassGroupStudent> Students { get; set; } = new();
    public List<Activity> Activities { get; set; } = new();
}

public class ClassGroupStudent
{
    public string ClassGroupId { get; set; } = string.Empty;
    public ClassGroup ClassGroup { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public Student Student { get; set; } = null!;
}
