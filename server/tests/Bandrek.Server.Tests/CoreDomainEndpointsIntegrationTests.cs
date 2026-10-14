using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Bandrek.Server.Features.Activities;
using Bandrek.Server.Features.Audit;
using Bandrek.Server.Features.LearningMatrix;
using Bandrek.Server.Features.Realization;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Bandrek.Server.Tests;

public class CoreDomainEndpointsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public CoreDomainEndpointsIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    // ==========================================
    // 1. CALENDAR & ACTIVITY LIST ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetCalendarActivities_DateRange_ReturnsActivities()
    {
        var response = await _client.GetAsync("/api/activities/calendar?startDate=2026-08-01&endDate=2026-08-31&showCancelled=true");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var list = await response.Content.ReadFromJsonAsync<List<ActivityDto>>(JsonOptions);
        Assert.NotNull(list);
        Assert.NotEmpty(list);
        Assert.All(list, a => Assert.StartsWith("2026-08", a.Date));
    }

    [Fact]
    public async Task GetActivityList_ReturnsPaginatedOrFilteredList()
    {
        var response = await _client.GetAsync("/api/activities/list?quickFilter=datang");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var list = await response.Content.ReadFromJsonAsync<List<ActivityDto>>(JsonOptions);
        Assert.NotNull(list);
    }

    [Fact]
    public async Task GetActivityById_ExistingId_ReturnsFullDetails()
    {
        var response = await _client.GetAsync("/api/activities/e01");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var activity = await response.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(activity);
        Assert.Equal("e01", activity.Id);
        Assert.Equal("R1", activity.RoomId);
        Assert.Equal("M1", activity.CourseId);
        Assert.NotEmpty(activity.Subjects);
        Assert.NotEmpty(activity.StudentIds);
        Assert.NotNull(activity.Realization);
    }

    [Fact]
    public async Task CheckConflicts_OverlappingTimes_DetectsConflict()
    {
        var req = new ConflictCheckRequest(
            Date: "2026-08-05",
            StartTime: "15:00",
            EndTime: "16:30",
            RoomId: "R1",
            SubjectIds: new List<string> { "U4" },
            StudentIds: new List<string> { "S2" },
            ExcludeActivityId: null);

        var response = await _client.PostAsJsonAsync("/api/activities/check-conflicts", req);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var res = await response.Content.ReadFromJsonAsync<ConflictCheckResponse>(JsonOptions);
        Assert.NotNull(res);
        Assert.True(res.HasConflict);
        Assert.NotEmpty(res.Conflicts);
    }

    [Fact]
    public async Task CheckConflicts_SelfExclude_ReturnsNoConflict()
    {
        var req = new ConflictCheckRequest(
            Date: "2026-08-05",
            StartTime: "15:00",
            EndTime: "16:30",
            RoomId: "R1",
            SubjectIds: new List<string> { "U4" },
            StudentIds: new List<string> { "S2" },
            ExcludeActivityId: "e01");

        var response = await _client.PostAsJsonAsync("/api/activities/check-conflicts", req);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var res = await response.Content.ReadFromJsonAsync<ConflictCheckResponse>(JsonOptions);
        Assert.NotNull(res);
        Assert.DoesNotContain(res.Conflicts, c => c.ConflictingActivityId == "e01");
    }

    [Fact]
    public async Task CreateActivity_SingleAndRecurring_WorksCorrectly()
    {
        // 1. Single activity
        var singleReq = new CreateActivityRequest(
            Id: null,
            Name: "Single Test Activity",
            ActivityTypeId: "J1",
            CourseId: "M1",
            TopicId: "T1",
            ClassGroupId: "K1",
            Date: "2026-10-01",
            StartTime: "09:00",
            EndTime: "10:30",
            IsAllDay: false,
            RoomId: "R1",
            CustomPlace: null,
            Subjects: new List<ActivitySubjectDto> { new("U4", "Pengisi") },
            StudentIds: new List<string> { "S1", "S2" },
            Notes: "Single test notes",
            Recurring: null);

        var singleRes = await _client.PostAsJsonAsync("/api/activities", singleReq);
        Assert.Equal(HttpStatusCode.Created, singleRes.StatusCode);
        var createdSingle = await singleRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(createdSingle);
        Assert.Equal("Single Test Activity", createdSingle.Name);

        // 2. Recurring series (4 weekly meetings)
        var recurringReq = new CreateActivityRequest(
            Id: null,
            Name: "Recurring Test Series",
            ActivityTypeId: "J1",
            CourseId: "M1",
            TopicId: "T1",
            ClassGroupId: "K1",
            Date: "2026-10-05",
            StartTime: "13:00",
            EndTime: "14:30",
            IsAllDay: false,
            RoomId: "R2",
            CustomPlace: null,
            Subjects: new List<ActivitySubjectDto> { new("U4", "Pengisi") },
            StudentIds: new List<string> { "S1" },
            Notes: "Recurring series",
            Recurring: new RecurringRuleDto(
                IsActive: true,
                Frequency: "mingguan",
                EndType: "pertemuan",
                TotalMeetings: 4,
                UntilDate: null));

        var recRes = await _client.PostAsJsonAsync("/api/activities", recurringReq);
        Assert.Equal(HttpStatusCode.Created, recRes.StatusCode);
        var createdRec = await recRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(createdRec);
        Assert.NotNull(createdRec.SeriesId);
        Assert.Equal(4, createdRec.TotalSeries);
    }

    [Fact]
    public async Task CancelAndRescheduleActivity_WorksCorrectly()
    {
        // 1. Create a dummy activity to cancel & reschedule
        var actReq = new CreateActivityRequest(
            Id: null,
            Name: "Activity To Cancel",
            ActivityTypeId: "J1",
            CourseId: "M1",
            TopicId: "T1",
            ClassGroupId: null,
            Date: "2026-10-15",
            StartTime: "10:00",
            EndTime: "11:30",
            IsAllDay: false,
            RoomId: "R1",
            CustomPlace: null,
            Subjects: new List<ActivitySubjectDto> { new("U4", "Pengisi") },
            StudentIds: new List<string> { "S1" },
            Notes: "To be cancelled",
            Recurring: null);

        var actRes = await _client.PostAsJsonAsync("/api/activities", actReq);
        Assert.Equal(HttpStatusCode.Created, actRes.StatusCode);
        var createdAct = await actRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(createdAct);
        var actId = createdAct.Id;

        // 2. Cancel activity
        var cancelReq = new CancelActivityRequest(
            Reason: "Tutor/pengisi berhalangan",
            Notes: "Sedang sakit mendadak",
            RescheduleAlso: false);

        var cancelRes = await _client.PostAsJsonAsync($"/api/activities/{actId}/cancel", cancelReq);
        Assert.Equal(HttpStatusCode.OK, cancelRes.StatusCode);
        var cancelledAct = await cancelRes.Content.ReadFromJsonAsync<ActivityDto>(JsonOptions);
        Assert.NotNull(cancelledAct);
        Assert.Equal("dibatalkan", cancelledAct.Status);
        Assert.Equal("Tutor/pengisi berhalangan", cancelledAct.Cancellation?.Reason);

        // 3. Reschedule activity
        var rescheduleReq = new RescheduleActivityRequest(
            Reason: "Penyesuaian jadwal tutor",
            Notes: "Digeser ke tanggal 20",
            NewDate: "2026-10-20",
            NewStartTime: "10:00",
            NewEndTime: "11:30",
            NewRoomId: "R1",
            NewName: "Activity To Cancel (Jadwal Ulang)",
            NewSubjects: null,
            NewStudentIds: null,
            NewNotes: "Rescheduled session");

        var reschedRes = await _client.PostAsJsonAsync($"/api/activities/{actId}/reschedule", rescheduleReq);
        Assert.Equal(HttpStatusCode.OK, reschedRes.StatusCode);

        var resultDto = await reschedRes.Content.ReadFromJsonAsync<RescheduleResultDto>(JsonOptions);
        Assert.NotNull(resultDto);
        Assert.Equal("dijadwal_ulang", resultDto.OriginalActivity.Status);
        Assert.Equal("terjadwal", resultDto.NewActivity.Status);
        Assert.Equal("2026-10-20", resultDto.NewActivity.Date);
        Assert.Equal(resultDto.OriginalActivity.Id, resultDto.NewActivity.RescheduledFromId);
    }

    [Fact]
    public async Task GetStandardReasons_ReturnsList()
    {
        var cancelRes = await _client.GetAsync("/api/activities/cancellation-reasons");
        Assert.Equal(HttpStatusCode.OK, cancelRes.StatusCode);
        var cancelReasons = await cancelRes.Content.ReadFromJsonAsync<List<string>>(JsonOptions);
        Assert.NotNull(cancelReasons);
        Assert.NotEmpty(cancelReasons);

        var reschedRes = await _client.GetAsync("/api/activities/reschedule-reasons");
        Assert.Equal(HttpStatusCode.OK, reschedRes.StatusCode);
        var reschedReasons = await reschedRes.Content.ReadFromJsonAsync<List<string>>(JsonOptions);
        Assert.NotNull(reschedReasons);
        Assert.NotEmpty(reschedReasons);
    }

    // ==========================================
    // 2. REALIZATION ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetAndSaveRealization_WorksCorrectly()
    {
        // 1. Get existing realization for e01
        var getRes = await _client.GetAsync("/api/activities/e01/realization");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);
        var real = await getRes.Content.ReadFromJsonAsync<RealizationDto>(JsonOptions);
        Assert.NotNull(real);
        Assert.Equal("15:00", real.StartTime);
        Assert.NotEmpty(real.StudentAttendances);

        // 2. Save / update realization
        var saveReq = new SaveRealizationRequest(
            StartTime: "15:00",
            EndTime: "16:35",
            ActualTopicId: "T1",
            CompletionStatus: "tuntas",
            Notes: "Pertemuan selesai dengan sangat baik",
            StudentAttendances: new Dictionary<string, string>
            {
                ["S2"] = "hadir",
                ["S6"] = "hadir"
            },
            StudentNotes: new Dictionary<string, string>
            {
                ["S2"] = "Aktif berdiskusi"
            },
            SubjectAttendances: new Dictionary<string, string>
            {
                ["U4"] = "hadir"
            },
            SubjectNotes: new Dictionary<string, string>(),
            RecordedBy: "Admin");

        var saveRes = await _client.PostAsJsonAsync("/api/activities/e01/realization", saveReq);
        Assert.Equal(HttpStatusCode.OK, saveRes.StatusCode);

        var savedReal = await saveRes.Content.ReadFromJsonAsync<RealizationDto>(JsonOptions);
        Assert.NotNull(savedReal);
        Assert.Equal("tuntas", savedReal.CompletionStatus);
        Assert.Equal("Pertemuan selesai dengan sangat baik", savedReal.Notes);
    }

    [Fact]
    public async Task GetPendingRealizationCount_ReturnsCount()
    {
        var response = await _client.GetAsync("/api/realization/pending-count");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        Assert.True(doc.RootElement.TryGetProperty("count", out var countElem));
        Assert.True(countElem.GetInt32() >= 0);
    }

    // ==========================================
    // 3. LEARNING MATRIX ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetLearningMatrix_ReturnsMatrixData()
    {
        var response = await _client.GetAsync("/api/learning-matrix/M1");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        Assert.Equal("M1", doc.RootElement.GetProperty("courseId").GetString());
        Assert.True(doc.RootElement.GetProperty("columns").GetArrayLength() > 0);
        Assert.True(doc.RootElement.GetProperty("rows").GetArrayLength() > 0);
    }

    [Fact]
    public async Task ManualChecklist_SingleAndBulkMutations_WorksCorrectly()
    {
        // 1. Single mark
        var markReq = new MarkManualChecklistRequest(
            StudentId: "S1",
            TopicId: "T2",
            Date: "2026-09-10",
            Notes: "Belajar mandiri",
            RecordedBy: "Operator");

        var markRes = await _client.PostAsJsonAsync("/api/learning-matrix/manual", markReq);
        Assert.Equal(HttpStatusCode.OK, markRes.StatusCode);

        var checkItem = await markRes.Content.ReadFromJsonAsync<ManualChecklistDto>(JsonOptions);
        Assert.NotNull(checkItem);
        Assert.Equal("S1", checkItem.StudentId);
        Assert.Equal("T2", checkItem.TopicId);

        // 2. Delete single
        var delRes = await _client.DeleteAsync($"/api/learning-matrix/manual/{checkItem.Id}");
        Assert.Equal(HttpStatusCode.OK, delRes.StatusCode);

        // 3. Bulk mark
        var bulkMarkReq = new BulkMarkManualChecklistRequest(new List<MarkManualChecklistRequest>
        {
            new("S1", "T3", "2026-09-11", "Bulk test 1", "Admin"),
            new("S1", "T4", "2026-09-11", "Bulk test 2", "Admin")
        });

        var bulkMarkRes = await _client.PostAsJsonAsync("/api/learning-matrix/manual/bulk", bulkMarkReq);
        Assert.Equal(HttpStatusCode.OK, bulkMarkRes.StatusCode);

        // 4. Bulk delete
        var bulkDelReq = new BulkDeleteManualChecklistRequest(new List<ManualChecklistKeyDto>
        {
            new("S1", "T3"),
            new("S1", "T4")
        });

        var bulkDelRes = await _client.PostAsJsonAsync("/api/learning-matrix/manual/bulk-delete", bulkDelReq);
        Assert.Equal(HttpStatusCode.OK, bulkDelRes.StatusCode);
    }

    // ==========================================
    // 4. AUDIT LOG ENDPOINTS
    // ==========================================
    [Fact]
    public async Task AuditLogs_GetAndCreate_WorksCorrectly()
    {
        var logReq = new AuditLogDto(
            Id: Guid.NewGuid().ToString("N"),
            Timestamp: DateTimeOffset.UtcNow,
            UserId: "usr-01",
            OperatorName: "Administrator",
            OperatorUsername: "admin",
            OperatorRole: "admin",
            Action: "ubah",
            Category: "kegiatan",
            EntityType: "kegiatan",
            EntityName: "e01",
            Summary: "Mengubah realisasi kegiatan",
            DiffsJson: null,
            IpAddress: "127.0.0.1");

        var createRes = await _client.PostAsJsonAsync("/api/audit-logs", logReq);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        var getRes = await _client.GetAsync("/api/audit-logs?category=kegiatan");
        Assert.Equal(HttpStatusCode.OK, getRes.StatusCode);

        var logs = await getRes.Content.ReadFromJsonAsync<List<AuditLogDto>>(JsonOptions);
        Assert.NotNull(logs);
        Assert.Contains(logs, l => l.EntityName == "e01");
    }
}
