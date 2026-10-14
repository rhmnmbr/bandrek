using Bandrek.Server.Data;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Bandrek.Server.Tests;

public class BusinessRulesIntegrationTests
{
    private const string ConnectionString = "Host=localhost;Port=5432;Database=bandrek_db;Username=postgres;Password=postgrespassword";

    private AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task ConflictDetector_OverlappingRoom_DetectsConflict()
    {
        using var db = CreateDbContext();
        var sut = new ConflictDetector(db);

        // e01 is on 2026-08-05, 15:00 - 16:30, room R1
        var result = await sut.DetectAsync(
            date: new DateOnly(2026, 8, 5),
            startTime: "15:30",
            endTime: "17:00",
            roomId: "R1",
            subjectIds: [],
            studentIds: []);

        Assert.True(result.HasConflict);
        Assert.Contains(result.Conflicts, c => c.Type == "ruangan" && c.EntityId == "R1");
    }

    [Fact]
    public async Task ConflictDetector_SelfExclude_IgnoresSelf()
    {
        using var db = CreateDbContext();
        var sut = new ConflictDetector(db);

        // When excluding e01 itself
        var result = await sut.DetectAsync(
            date: new DateOnly(2026, 8, 5),
            startTime: "15:00",
            endTime: "16:30",
            roomId: "R1",
            subjectIds: [],
            studentIds: [],
            excludeActivityId: "e01");

        Assert.DoesNotContain(result.Conflicts, c => c.ConflictingActivityId == "e01");
    }

    [Fact]
    public async Task ConflictDetector_NonOverlappingTime_ReturnsNoConflict()
    {
        using var db = CreateDbContext();
        var sut = new ConflictDetector(db);

        // Early morning time where no activities exist
        var result = await sut.DetectAsync(
            date: new DateOnly(2026, 8, 5),
            startTime: "04:00",
            endTime: "05:00",
            roomId: "R1",
            subjectIds: ["U4"],
            studentIds: ["S2"]);

        Assert.False(result.HasConflict);
        Assert.Empty(result.Conflicts);
    }

    [Fact]
    public async Task MasterUsageChecker_UsedEntities_CannotBeDeleted()
    {
        using var db = CreateDbContext();
        var sut = new MasterUsageChecker(db);

        // Student S2 is enrolled in activities & classes
        var studentResult = await sut.CheckStudentUsageAsync("S2");
        Assert.False(studentResult.CanDelete);
        Assert.NotEmpty(studentResult.UsageDetails);

        // Subject U4 is assigned to activities
        var subjectResult = await sut.CheckSubjectUsageAsync("U4");
        Assert.False(subjectResult.CanDelete);

        // Course M1 has topics and activities
        var courseResult = await sut.CheckCourseUsageAsync("M1");
        Assert.False(courseResult.CanDelete);

        // Place P1 has rooms
        var placeResult = await sut.CheckPlaceUsageAsync("P1");
        Assert.False(placeResult.CanDelete);
    }

    [Fact]
    public async Task MasterUsageChecker_UnusedEntity_CanBeDeleted()
    {
        using var db = CreateDbContext();
        var sut = new MasterUsageChecker(db);

        var result = await sut.CheckStudentUsageAsync("sis-non-existent-999");
        Assert.True(result.CanDelete);
        Assert.Null(result.Reason);
        Assert.Empty(result.UsageDetails);
    }

    [Fact]
    public async Task LearningMatrixEngine_ComputesMatrix_AccurateColumnsAndLaggingCalculation()
    {
        using var db = CreateDbContext();
        var sut = new LearningMatrixEngine(db);

        var matrix = await sut.ComputeAsync("M1");

        Assert.Equal("M1", matrix.CourseId);
        Assert.Equal(10, matrix.Columns.Count); // 10 active topics for Matematika (M1)
        Assert.True(matrix.Rows.Count >= 70); // at least 70 active students

        // Lagging threshold: 40% of 10 = 4 (min 2)
        Assert.Equal(4, matrix.LaggingThresholdCount);

        // Verify all lagging students have missing topics >= 4
        foreach (var student in matrix.LaggingStudents)
        {
            Assert.True(student.MissingTopicsCount >= 4);
            Assert.Equal(10, student.TotalTopicsCount);
        }

        // Verify cells dictionary has rows for active students
        Assert.True(matrix.Cells.Count >= 70);

        // Verify column summaries
        Assert.Equal(10, matrix.ColumnSummaries.Count);
        foreach (var summary in matrix.ColumnSummaries.Values)
        {
            Assert.Equal(70, summary.TotalStudents);
            Assert.InRange(summary.Percentage, 0, 100);
        }

        // Also verify showInactive: true includes all 80 students
        var allStudentsMatrix = await sut.ComputeAsync("M1", showInactive: true);
        Assert.Equal(80, allStudentsMatrix.Rows.Count);
    }

    [Fact]
    public async Task ProfileKpiCalculator_StudentAndSubject_CalculatesAccurately()
    {
        using var db = CreateDbContext();
        var sut = new ProfileKpiCalculator(db);

        var studentProfile = await sut.CalculateStudentProfileAsync("S2");
        Assert.NotNull(studentProfile);
        Assert.Equal("S2", studentProfile.Student.Id);
        Assert.InRange(studentProfile.AttendanceRate, 0, 100);
        Assert.Equal(6, studentProfile.Coverage.Count); // 6 courses

        var subjectProfile = await sut.CalculateSubjectProfileAsync("U4");
        Assert.NotNull(subjectProfile);
        Assert.Equal("U4", subjectProfile.Subject.Id);
        Assert.True(subjectProfile.TotalActivities > 0);
    }
}
