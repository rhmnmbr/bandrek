using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Bandrek.Server.Features.Activities;
using Bandrek.Server.Features.Audit;
using Bandrek.Server.Features.Auth;
using Bandrek.Server.Features.LearningMatrix;
using Bandrek.Server.Features.Master;
using Bandrek.Server.Features.Realization;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Bandrek.Server.Tests;

public class E2EWorkflowIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public E2EWorkflowIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthAndSystemInfo_ReturnsHealthyStatusAndMetadata()
    {
        // 1. Health check
        var healthRes = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, healthRes.StatusCode);
        using var healthDoc = await JsonDocument.ParseAsync(await healthRes.Content.ReadAsStreamAsync());
        Assert.Equal("healthy", healthDoc.RootElement.GetProperty("status").GetString());

        // 2. System info
        var infoRes = await _client.GetAsync("/api/system/info");
        Assert.Equal(HttpStatusCode.OK, infoRes.StatusCode);
        using var infoDoc = await JsonDocument.ParseAsync(await infoRes.Content.ReadAsStreamAsync());
        var root = infoDoc.RootElement;
        Assert.Equal("Bandrek Bimbel", root.GetProperty("name").GetString());
        Assert.Equal("1.0.0", root.GetProperty("serverVersion").GetString());
        Assert.Equal("Asia/Jakarta", root.GetProperty("timezone").GetString());
    }

    [Fact]
    public async Task FullOperatorWorkflow_Login_MasterData_Scheduling_Realization_Matrix()
    {
        // 1. Operator Login
        var loginRes = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("operator", "Operator123!"));
        Assert.Equal(HttpStatusCode.OK, loginRes.StatusCode);
        var authSession = await loginRes.Content.ReadFromJsonAsync<AuthSessionResponse>(JsonOptions);
        Assert.NotNull(authSession);
        Assert.NotEmpty(authSession.Token);
        Assert.Equal("operator", authSession.User.Role);

        // Prepare authenticated client request headers
        using var authRequest = new HttpRequestMessage(HttpMethod.Get, "/api/auth/session");
        authRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authSession.Token);
        var sessionRes = await _client.SendAsync(authRequest);
        Assert.Equal(HttpStatusCode.OK, sessionRes.StatusCode);
        var sessionUser = await sessionRes.Content.ReadFromJsonAsync<UserDto>(JsonOptions);
        Assert.NotNull(sessionUser);
        Assert.Equal("operator", sessionUser.Username);

        // 2. Query Master Data
        var studentsRes = await _client.GetAsync("/api/students");
        Assert.Equal(HttpStatusCode.OK, studentsRes.StatusCode);
        var students = await studentsRes.Content.ReadFromJsonAsync<List<StudentDto>>(JsonOptions);
        Assert.NotNull(students);
        Assert.NotEmpty(students);

        var coursesRes = await _client.GetAsync("/api/courses");
        Assert.Equal(HttpStatusCode.OK, coursesRes.StatusCode);
        var courses = await coursesRes.Content.ReadFromJsonAsync<List<CourseDto>>(JsonOptions);
        Assert.NotNull(courses);
        Assert.NotEmpty(courses);

        var roomsRes = await _client.GetAsync("/api/rooms");
        Assert.Equal(HttpStatusCode.OK, roomsRes.StatusCode);
        var rooms = await roomsRes.Content.ReadFromJsonAsync<List<RoomDto>>(JsonOptions);
        Assert.NotNull(rooms);
        Assert.NotEmpty(rooms);

        // 3. Check Conflict against existing e01 (2026-08-05 in R1)
        var conflictRes = await _client.PostAsJsonAsync("/api/activities/check-conflicts", new ConflictCheckRequest(
            Date: "2026-08-05",
            StartTime: "15:00",
            EndTime: "16:30",
            RoomId: "R1",
            SubjectIds: new List<string> { "U4" },
            StudentIds: new List<string> { "S2", "S6" },
            ExcludeActivityId: null
        ));
        Assert.Equal(HttpStatusCode.OK, conflictRes.StatusCode);
        var conflictCheck = await conflictRes.Content.ReadFromJsonAsync<ConflictCheckResponse>(JsonOptions);
        Assert.NotNull(conflictCheck);
        Assert.True(conflictCheck.HasConflict);

        // 4. Create an Activity in non-conflicting time slot
        var createActivityReq = new CreateActivityRequest(
            Id: null,
            Name: "Kelas Tambahan E2E Workflow",
            ActivityTypeId: "J1",
            CourseId: "M1",
            TopicId: "T1",
            ClassGroupId: "K1",
            Date: "2026-11-20",
            StartTime: "14:00",
            EndTime: "15:30",
            IsAllDay: false,
            RoomId: "R2",
            CustomPlace: null,
            Subjects: new List<ActivitySubjectDto> { new("U4", "Pengisi") },
            StudentIds: new List<string> { "S1", "S2" },
            Notes: "Testing automated full workflow",
            Recurring: null
        );

        var createRes = await _client.PostAsJsonAsync("/api/activities", createActivityReq);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);
        var createdActivity = await createRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(createdActivity);
        Assert.Equal("Kelas Tambahan E2E Workflow", createdActivity.Name);
        Assert.Equal("terjadwal", createdActivity.Status);

        // 5. Reschedule the Activity
        var rescheduleReq = new RescheduleActivityRequest(
            Reason: "Permintaan Siswa",
            Notes: "Digeser 1 hari",
            NewDate: "2026-11-21",
            NewStartTime: "15:00",
            NewEndTime: "16:30",
            NewRoomId: "R2",
            NewName: "Kelas Tambahan E2E Workflow (Jadwal Ulang)",
            NewSubjects: null,
            NewStudentIds: null,
            NewNotes: "Rescheduled session"
        );

        var rescheduleRes = await _client.PostAsJsonAsync($"/api/activities/{createdActivity.Id}/reschedule", rescheduleReq);
        Assert.Equal(HttpStatusCode.OK, rescheduleRes.StatusCode);
        var rescheduleResult = await rescheduleRes.Content.ReadFromJsonAsync<RescheduleResultDto>(JsonOptions);
        Assert.NotNull(rescheduleResult);
        Assert.Equal("dijadwal_ulang", rescheduleResult.OriginalActivity.Status);
        Assert.Equal("2026-11-21", rescheduleResult.NewActivity.Date);
        Assert.Equal("15:00", rescheduleResult.NewActivity.StartTime);

        var rescheduledId = rescheduleResult.NewActivity.Id;

        // 6. Record Realization for the rescheduled activity
        var realizationReq = new SaveRealizationRequest(
            StartTime: "15:05",
            EndTime: "16:35",
            ActualTopicId: "T1",
            CompletionStatus: "tuntas",
            Notes: "Selesai tepat waktu",
            StudentAttendances: new Dictionary<string, string>
            {
                { "S1", "hadir" },
                { "S2", "izin" }
            },
            StudentNotes: new Dictionary<string, string>(),
            SubjectAttendances: new Dictionary<string, string>
            {
                { "U4", "hadir" }
            },
            SubjectNotes: new Dictionary<string, string>(),
            RecordedBy: "Operator E2E"
        );

        var saveRealizationRes = await _client.PostAsJsonAsync($"/api/activities/{rescheduledId}/realization", realizationReq);
        Assert.Equal(HttpStatusCode.OK, saveRealizationRes.StatusCode);
        var realizationResult = await saveRealizationRes.Content.ReadFromJsonAsync<RealizationDto>(JsonOptions);
        Assert.NotNull(realizationResult);
        Assert.Equal("tuntas", realizationResult.CompletionStatus);

        // Verify the activity status is updated to terealisasi
        var updatedActRes = await _client.GetAsync($"/api/activities/{rescheduledId}");
        Assert.Equal(HttpStatusCode.OK, updatedActRes.StatusCode);
        var updatedAct = await updatedActRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(updatedAct);
        Assert.Equal("terealisasi", updatedAct.Status);

        // 7. Verify Learning Matrix
        var matrixRes = await _client.GetAsync("/api/learning-matrix/M1?classId=K1");
        Assert.Equal(HttpStatusCode.OK, matrixRes.StatusCode);
        using var matrixDoc = await JsonDocument.ParseAsync(await matrixRes.Content.ReadAsStreamAsync());
        var matrixRoot = matrixDoc.RootElement;
        Assert.Equal("M1", matrixRoot.GetProperty("courseId").GetString());
        Assert.True(matrixRoot.GetProperty("columns").GetArrayLength() > 0);
        Assert.True(matrixRoot.GetProperty("rows").GetArrayLength() > 0);

        // 8. Bulk Manual Checklist Workflow
        var bulkMarkReq = new BulkMarkManualChecklistRequest(new List<MarkManualChecklistRequest>
        {
            new("S3", "T1", "2026-11-21", "Lulus pre-test", "Operator E2E"),
            new("S4", "T1", "2026-11-21", "Lulus pre-test", "Operator E2E")
        });
        var bulkMarkRes = await _client.PostAsJsonAsync("/api/learning-matrix/manual/bulk", bulkMarkReq);
        Assert.Equal(HttpStatusCode.OK, bulkMarkRes.StatusCode);
        var markedItems = await bulkMarkRes.Content.ReadFromJsonAsync<List<ManualChecklistDto>>(JsonOptions);
        Assert.NotNull(markedItems);
        Assert.Equal(2, markedItems.Count);

        // Clean up manual checklists
        var bulkDeleteReq = new BulkDeleteManualChecklistRequest(new List<ManualChecklistKeyDto>
        {
            new("S3", "T1"),
            new("S4", "T1")
        });
        var bulkDeleteRes = await _client.PostAsJsonAsync("/api/learning-matrix/manual/bulk-delete", bulkDeleteReq);
        Assert.Equal(HttpStatusCode.OK, bulkDeleteRes.StatusCode);

        // 9. Audit Logging
        var logReq = new AuditLogDto(
            Id: Guid.NewGuid().ToString("N"),
            Timestamp: DateTimeOffset.UtcNow,
            UserId: "usr-02",
            OperatorName: "Operator E2E",
            OperatorUsername: "operator",
            OperatorRole: "operator",
            Action: "workflow_test",
            Category: "kegiatan",
            EntityType: "kegiatan",
            EntityName: rescheduledId,
            Summary: "Automated end-to-end integration test completed",
            DiffsJson: null,
            IpAddress: "127.0.0.1"
        );
        var auditRes = await _client.PostAsJsonAsync("/api/audit-logs", logReq);
        Assert.Equal(HttpStatusCode.Created, auditRes.StatusCode);

        // Query Audit Logs
        var auditLogsRes = await _client.GetAsync("/api/audit-logs?category=kegiatan");
        Assert.Equal(HttpStatusCode.OK, auditLogsRes.StatusCode);
        var auditLogs = await auditLogsRes.Content.ReadFromJsonAsync<List<AuditLogDto>>(JsonOptions);
        Assert.NotNull(auditLogs);
        Assert.Contains(auditLogs, a => a.EntityName == rescheduledId);
    }
}
