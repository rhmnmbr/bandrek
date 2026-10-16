namespace Bandrek.Server.Data.Entities;

public class Activity
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ActivityTypeId { get; set; }
    public ActivityType? ActivityType { get; set; }

    public string? CourseId { get; set; }
    public Course? Course { get; set; }

    public string? TopicId { get; set; }
    public Topic? Topic { get; set; }

    public string? ClassGroupId { get; set; }
    public ClassGroup? ClassGroup { get; set; }

    public DateOnly Date { get; set; }
    public DateOnly? EndDate { get; set; }
    public string StartTime { get; set; } = string.Empty; // HH:mm
    public string EndTime { get; set; } = string.Empty;   // HH:mm
    public bool IsAllDay { get; set; } = false;

    public string RoomId { get; set; } = string.Empty;
    public Room Room { get; set; } = null!;

    public string? CustomPlace { get; set; }
    public string Notes { get; set; } = string.Empty;

    // Stored status
    public string RawStatus { get; set; } = RawActivityStatuses.Scheduled;

    // Cancellation metadata
    public string? CancellationReason { get; set; }
    public string? CancellationNotes { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }

    // Rescheduling metadata
    public string? RescheduleReason { get; set; }
    public string? RescheduledFromId { get; set; }
    public Activity? RescheduledFrom { get; set; }

    public string? RescheduledToId { get; set; }
    public Activity? RescheduledTo { get; set; }

    // Recurring series metadata
    public string? SeriesId { get; set; }
    public int? SeriesOrder { get; set; }
    public int? SeriesTotal { get; set; }

    // Concurrency token mapped to PostgreSQL xmin (ARCHITECTURE.md D9)
    public uint ConcurrencyToken { get; set; }

    // Audit metadata
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }

    // Navigation properties
    public List<ActivitySubject> Subjects { get; set; } = new();
    public List<ActivityStudent> Students { get; set; } = new();
    public Realization? Realization { get; set; }
}

public class ActivitySubject
{
    public string ActivityId { get; set; } = string.Empty;
    public Activity Activity { get; set; } = null!;

    public string SubjectPersonId { get; set; } = string.Empty;
    public SubjectPerson SubjectPerson { get; set; } = null!;

    public string? Role { get; set; }
}

public class ActivityStudent
{
    public string ActivityId { get; set; } = string.Empty;
    public Activity Activity { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public Student Student { get; set; } = null!;
}
