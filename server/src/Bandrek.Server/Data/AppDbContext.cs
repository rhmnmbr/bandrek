using System.Text.Json;
using Bandrek.Server.Data.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Bandrek.Server.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<SubjectPerson> Subjects => Set<SubjectPerson>();
    public DbSet<ClassGroup> ClassGroups => Set<ClassGroup>();
    public DbSet<ClassGroupStudent> ClassGroupStudents => Set<ClassGroupStudent>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<ActivityType> ActivityTypes => Set<ActivityType>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<ActivitySubject> ActivitySubjects => Set<ActivitySubject>();
    public DbSet<ActivityStudent> ActivityStudents => Set<ActivityStudent>();
    public DbSet<Realization> Realizations => Set<Realization>();
    public DbSet<ManualChecklist> ManualChecklists => Set<ManualChecklist>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EducationalLevelOption> EducationalLevels => Set<EducationalLevelOption>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        var dictConverter = new ValueConverter<Dictionary<string, string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new Dictionary<string, string>()
                : JsonSerializer.Deserialize<Dictionary<string, string>>(v, jsonOptions) ?? new Dictionary<string, string>()
        );

        var listStringConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
        );

        var availabilityConverter = new ValueConverter<List<WeeklyAvailability>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<WeeklyAvailability>()
                : JsonSerializer.Deserialize<List<WeeklyAvailability>>(v, jsonOptions) ?? new List<WeeklyAvailability>()
        );

        var dictComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<Dictionary<string, string>>(
            (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.OrderBy(kv => kv.Key).SequenceEqual(c2.OrderBy(kv => kv.Key))),
            c => c.Aggregate(0, (a, p) => HashCode.Combine(a, p.Key.GetHashCode(), p.Value.GetHashCode())),
            c => new Dictionary<string, string>(c)
        );

        var listStringComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
            (c1, c2) => (c1 == null && c2 == null) || (c1 != null && c2 != null && c1.SequenceEqual(c2)),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()
        );

        var availabilityComparer = new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<WeeklyAvailability>>(
            (c1, c2) => JsonSerializer.Serialize(c1, jsonOptions) == JsonSerializer.Serialize(c2, jsonOptions),
            c => JsonSerializer.Serialize(c, jsonOptions).GetHashCode(),
            c => JsonSerializer.Deserialize<List<WeeklyAvailability>>(JsonSerializer.Serialize(c, jsonOptions), jsonOptions) ?? new List<WeeklyAvailability>()
        );

        // -------------------------------------------------------------
        // Student
        // -------------------------------------------------------------
        builder.Entity<Student>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.FullName).HasMaxLength(200).IsRequired();
            b.Property(s => s.EducationalLevel).HasMaxLength(50).IsRequired(false);
            b.Property(s => s.Gender).HasMaxLength(10).IsRequired();
            b.Property(s => s.SchoolOrigin).HasMaxLength(200);
            b.Property(s => s.GuardianName).HasMaxLength(200);
            b.Property(s => s.GuardianPhone).HasMaxLength(50);
        });

        // -------------------------------------------------------------
        // EducationalLevelOption
        // -------------------------------------------------------------
        builder.Entity<EducationalLevelOption>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Name).HasMaxLength(50).IsRequired();
        });

        // -------------------------------------------------------------
        // SubjectPerson
        // -------------------------------------------------------------
        builder.Entity<SubjectPerson>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.FullName).HasMaxLength(200).IsRequired();
            b.Property(s => s.Gender).HasMaxLength(10).IsRequired();
            b.Property(s => s.Role).HasMaxLength(50).IsRequired();
            b.Property(s => s.Contact).HasMaxLength(100);
            b.Property(s => s.CourseIds)
                .HasConversion(listStringConverter, listStringComparer)
                .HasColumnType("jsonb");
            b.Property(s => s.WeeklyAvailabilities)
                .HasConversion(availabilityConverter, availabilityComparer)
                .HasColumnType("jsonb");
        });

        // -------------------------------------------------------------
        // ClassGroup & ClassGroupStudent
        // -------------------------------------------------------------
        builder.Entity<ClassGroup>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
            b.Property(c => c.EducationalLevel).HasMaxLength(20);
        });

        builder.Entity<ClassGroupStudent>(b =>
        {
            b.HasKey(cs => new { cs.ClassGroupId, cs.StudentId });
            b.HasOne(cs => cs.ClassGroup)
                .WithMany(c => c.Students)
                .HasForeignKey(cs => cs.ClassGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(cs => cs.Student)
                .WithMany(s => s.ClassGroups)
                .HasForeignKey(cs => cs.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // -------------------------------------------------------------
        // Course & Topic
        // -------------------------------------------------------------
        builder.Entity<Course>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(100).IsRequired();
        });

        builder.Entity<Topic>(b =>
        {
            b.HasKey(t => t.Id);
            b.Property(t => t.Name).HasMaxLength(200).IsRequired();
            b.Property(t => t.EducationalLevels)
                .HasConversion(listStringConverter, listStringComparer)
                .HasColumnType("jsonb");

            b.HasOne(t => t.Course)
                .WithMany(c => c.Topics)
                .HasForeignKey(t => t.CourseId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // -------------------------------------------------------------
        // Place & Room
        // -------------------------------------------------------------
        builder.Entity<Place>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).HasMaxLength(100).IsRequired();
        });

        builder.Entity<Room>(b =>
        {
            b.HasKey(r => r.Id);
            b.Property(r => r.Name).HasMaxLength(100).IsRequired();
            b.HasOne(r => r.Place)
                .WithMany(p => p.Rooms)
                .HasForeignKey(r => r.PlaceId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // -------------------------------------------------------------
        // ActivityType
        // -------------------------------------------------------------
        builder.Entity<ActivityType>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Name).HasMaxLength(100).IsRequired();
            b.Property(a => a.Color).HasMaxLength(50).IsRequired();
        });

        // -------------------------------------------------------------
        // Activity, ActivitySubject, ActivityStudent
        // -------------------------------------------------------------
        builder.Entity<Activity>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Name).HasMaxLength(200).IsRequired();
            b.Property(a => a.StartTime).HasMaxLength(10).IsRequired();
            b.Property(a => a.EndTime).HasMaxLength(10).IsRequired();
            b.Property(a => a.RawStatus).HasMaxLength(50).IsRequired();
            b.Property(a => a.CustomPlace).HasMaxLength(200);

            // Optimistic concurrency using PostgreSQL xmin (ARCHITECTURE.md D9)
            b.Property(a => a.ConcurrencyToken)
                .HasColumnName("xmin")
                .HasColumnType("xid")
                .ValueGeneratedOnAddOrUpdate()
                .IsConcurrencyToken();

            b.HasOne(a => a.ActivityType)
                .WithMany(t => t.Activities)
                .HasForeignKey(a => a.ActivityTypeId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(a => a.Course)
                .WithMany(c => c.Activities)
                .HasForeignKey(a => a.CourseId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(a => a.Topic)
                .WithMany(t => t.PlannedActivities)
                .HasForeignKey(a => a.TopicId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(a => a.ClassGroup)
                .WithMany(c => c.Activities)
                .HasForeignKey(a => a.ClassGroupId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(a => a.Room)
                .WithMany(r => r.Activities)
                .HasForeignKey(a => a.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(a => a.RescheduledFrom)
                .WithMany()
                .HasForeignKey(a => a.RescheduledFromId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(a => a.RescheduledTo)
                .WithMany()
                .HasForeignKey(a => a.RescheduledToId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<ActivitySubject>(b =>
        {
            b.HasKey(asub => new { asub.ActivityId, asub.SubjectPersonId });
            b.Property(asub => asub.Role).HasMaxLength(50);

            b.HasOne(asub => asub.Activity)
                .WithMany(a => a.Subjects)
                .HasForeignKey(asub => asub.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(asub => asub.SubjectPerson)
                .WithMany(s => s.Activities)
                .HasForeignKey(asub => asub.SubjectPersonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ActivityStudent>(b =>
        {
            b.HasKey(ast => new { ast.ActivityId, ast.StudentId });

            b.HasOne(ast => ast.Activity)
                .WithMany(a => a.Students)
                .HasForeignKey(ast => ast.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(ast => ast.Student)
                .WithMany(s => s.Activities)
                .HasForeignKey(ast => ast.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // -------------------------------------------------------------
        // Realization
        // -------------------------------------------------------------
        builder.Entity<Realization>(b =>
        {
            b.HasKey(r => r.ActivityId);
            b.Property(r => r.ActualStartTime).HasMaxLength(10).IsRequired();
            b.Property(r => r.ActualEndTime).HasMaxLength(10).IsRequired();
            b.Property(r => r.CompletionStatus).HasMaxLength(50);
            b.Property(r => r.FilledBy).HasMaxLength(100);

            b.Property(r => r.StudentAttendances)
                .HasConversion(dictConverter, dictComparer)
                .HasColumnType("jsonb");

            b.Property(r => r.StudentNotes)
                .HasConversion(dictConverter, dictComparer)
                .HasColumnType("jsonb");

            b.Property(r => r.SubjectAttendances)
                .HasConversion(dictConverter, dictComparer)
                .HasColumnType("jsonb");

            b.Property(r => r.SubjectNotes)
                .HasConversion(dictConverter, dictComparer)
                .HasColumnType("jsonb");

            b.HasOne(r => r.Activity)
                .WithOne(a => a.Realization)
                .HasForeignKey<Realization>(r => r.ActivityId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(r => r.ActualTopic)
                .WithMany(t => t.RealizedActivities)
                .HasForeignKey(r => r.ActualTopicId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // -------------------------------------------------------------
        // ManualChecklist
        // -------------------------------------------------------------
        builder.Entity<ManualChecklist>(b =>
        {
            b.HasKey(m => m.Id);
            b.Property(m => m.RecordedBy).HasMaxLength(100);
            b.Property(m => m.Source).HasMaxLength(50);

            b.HasOne(m => m.Student)
                .WithMany(s => s.ManualChecklists)
                .HasForeignKey(m => m.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(m => m.Topic)
                .WithMany(t => t.ManualChecklists)
                .HasForeignKey(m => m.TopicId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // -------------------------------------------------------------
        // AuditLog
        // -------------------------------------------------------------
        builder.Entity<AuditLog>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.Action).HasMaxLength(50).IsRequired();
            b.Property(a => a.Category).HasMaxLength(50).IsRequired();
            b.Property(a => a.EntityType).HasMaxLength(100).IsRequired();
            b.Property(a => a.EntityName).HasMaxLength(200);
            b.Property(a => a.OperatorUsername).HasMaxLength(100);
            b.Property(a => a.OperatorRole).HasMaxLength(50);
            b.Property(a => a.DiffsJson).HasColumnType("jsonb");
        });

        // -------------------------------------------------------------
        // Global DateTimeOffset UTC normalization for PostgreSQL
        // -------------------------------------------------------------
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTimeOffset))
                {
                    property.SetValueConverter(new ValueConverter<DateTimeOffset, DateTimeOffset>(
                        v => v.ToUniversalTime(),
                        v => v.ToUniversalTime()));
                }
                else if (property.ClrType == typeof(DateTimeOffset?))
                {
                    property.SetValueConverter(new ValueConverter<DateTimeOffset?, DateTimeOffset?>(
                        v => v.HasValue ? v.Value.ToUniversalTime() : v,
                        v => v.HasValue ? v.Value.ToUniversalTime() : v));
                }
            }
        }
    }
}
