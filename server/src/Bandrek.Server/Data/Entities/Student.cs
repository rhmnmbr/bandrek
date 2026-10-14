namespace Bandrek.Server.Data.Entities;

public class Student
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string EducationalLevel { get; set; } = EducationalLevels.SD;
    public bool IsActive { get; set; } = true;
    public DateOnly BirthDate { get; set; }
    public string Gender { get; set; } = Genders.Male;
    public string? SchoolOrigin { get; set; }
    public string? GuardianName { get; set; }
    public string? GuardianPhone { get; set; }
    public DateOnly? JoinedDate { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public List<ClassGroupStudent> ClassGroups { get; set; } = new();
    public List<ActivityStudent> Activities { get; set; } = new();
    public List<ManualChecklist> ManualChecklists { get; set; } = new();
}
