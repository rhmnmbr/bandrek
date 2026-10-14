namespace Bandrek.Server.Data.Entities;

public class WeeklyAvailability
{
    public string Day { get; set; } = string.Empty; // e.g. "Senin"
    public string From { get; set; } = string.Empty; // e.g. "08:00"
    public string To { get; set; } = string.Empty;   // e.g. "12:00"
}

public class SubjectPerson
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Gender { get; set; } = Genders.Male;
    public string Role { get; set; } = SubjectRoles.Instructor;
    public bool IsActive { get; set; } = true;
    public string? Contact { get; set; }
    public List<string> CourseIds { get; set; } = new();
    public List<WeeklyAvailability> WeeklyAvailabilities { get; set; } = new();

    // Navigation properties
    public List<ActivitySubject> Activities { get; set; } = new();
}
