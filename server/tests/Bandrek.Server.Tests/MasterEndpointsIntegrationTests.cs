using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Bandrek.Server.Features.Auth;
using Bandrek.Server.Features.Master;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Bandrek.Server.Tests;

public class MasterEndpointsIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public MasterEndpointsIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    // ==========================================
    // 1. AUTH ENDPOINTS
    // ==========================================
    [Fact]
    public async Task Login_ValidAdminCredentials_ReturnsTokenAndUser()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("admin", "Admin123!"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authSession = await response.Content.ReadFromJsonAsync<AuthSessionResponse>(JsonOptions);
        Assert.NotNull(authSession);
        Assert.NotEmpty(authSession.Token);
        Assert.Equal("admin", authSession.User.Username);
        Assert.Equal("admin", authSession.User.Role);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest("admin", "WrongPassword!"));
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_ReturnsUserList()
    {
        var response = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var users = await response.Content.ReadFromJsonAsync<List<UserDto>>(JsonOptions);
        Assert.NotNull(users);
        Assert.Contains(users, u => u.Username == "admin");
        Assert.Contains(users, u => u.Username == "operator");
    }

    // ==========================================
    // 2. STUDENT ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetStudents_ReturnsStudentsList()
    {
        var response = await _client.GetAsync("/api/students");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var students = await response.Content.ReadFromJsonAsync<List<StudentDto>>(JsonOptions);
        Assert.NotNull(students);
        Assert.NotEmpty(students);
    }

    [Fact]
    public async Task GetStudentById_ExistingId_ReturnsStudent()
    {
        var response = await _client.GetAsync("/api/students/S1");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var student = await response.Content.ReadFromJsonAsync<StudentDto>(JsonOptions);
        Assert.NotNull(student);
        Assert.Equal("S1", student.Id);
        Assert.Equal("Cahya Dwi Puspitasari", student.FullName);
    }

    [Fact]
    public async Task GetStudentProfile_ExistingId_ReturnsProfile()
    {
        var response = await _client.GetAsync("/api/students/S2/profile");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
        Assert.True(doc.RootElement.TryGetProperty("student", out _));
        Assert.True(doc.RootElement.TryGetProperty("attendanceRate", out _));
        Assert.True(doc.RootElement.TryGetProperty("coverage", out _));
    }

    [Fact]
    public async Task Student_CrudLifecycle_WorksCorrectly()
    {
        // 1. Create
        var createReq = new CreateStudentRequest(
            Id: "S_TEST_99",
            FullName: "Test Student 99",
            EducationalLevel: "SMP",
            IsActive: true,
            BirthDate: "2012-05-10",
            Gender: "L",
            SchoolOrigin: "SMP 1",
            GuardianName: "Wali Test",
            GuardianPhone: "08123456789",
            JoinedDate: "2026-09-01",
            Notes: "Testing student");

        var createRes = await _client.PostAsJsonAsync("/api/students", createReq);
        Assert.Equal(HttpStatusCode.Created, createRes.StatusCode);

        // 2. Update
        var updateReq = new UpdateStudentRequest(
            FullName: "Test Student 99 Updated",
            EducationalLevel: null,
            IsActive: null,
            BirthDate: null,
            Gender: null,
            SchoolOrigin: null,
            GuardianName: null,
            GuardianPhone: null,
            JoinedDate: null,
            Notes: "Updated notes");

        var updateRes = await _client.PutAsJsonAsync("/api/students/S_TEST_99", updateReq);
        Assert.Equal(HttpStatusCode.OK, updateRes.StatusCode);
        var updatedStudent = await updateRes.Content.ReadFromJsonAsync<StudentDto>(JsonOptions);
        Assert.Equal("Test Student 99 Updated", updatedStudent?.FullName);

        // 3. Delete
        var deleteRes = await _client.DeleteAsync("/api/students/S_TEST_99");
        Assert.Equal(HttpStatusCode.OK, deleteRes.StatusCode);
    }

    [Fact]
    public async Task DeleteStudent_UsedStudent_ReturnsConflict()
    {
        // Student S2 is used in activities and class groups
        var response = await _client.DeleteAsync("/api/students/S2");
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    // ==========================================
    // 3. SUBJECT ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetSubjects_ReturnsSubjectsList()
    {
        var response = await _client.GetAsync("/api/subjects");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var subjects = await response.Content.ReadFromJsonAsync<List<SubjectDto>>(JsonOptions);
        Assert.NotNull(subjects);
        Assert.Equal(12, subjects.Count);
    }

    [Fact]
    public async Task SubjectAvailability_AddAndRemove_WorksCorrectly()
    {
        var availItem = new WeeklyAvailabilityDto("Senin", "08:00", "11:00");
        var addRes = await _client.PostAsJsonAsync("/api/subjects/U4/availability", availItem);
        Assert.Equal(HttpStatusCode.OK, addRes.StatusCode);

        var list = await addRes.Content.ReadFromJsonAsync<List<WeeklyAvailabilityDto>>(JsonOptions);
        Assert.NotNull(list);
        Assert.Contains(list, a => a.Day == "Senin" && a.From == "08:00");

        // Remove the newly added item (last index)
        int lastIndex = list.Count - 1;
        var deleteRes = await _client.DeleteAsync($"/api/subjects/U4/availability/{lastIndex}");
        Assert.Equal(HttpStatusCode.OK, deleteRes.StatusCode);
    }

    // ==========================================
    // 4. CLASS GROUP ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetClasses_ReturnsClassesList()
    {
        var response = await _client.GetAsync("/api/classes");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var classes = await response.Content.ReadFromJsonAsync<List<ClassGroupDto>>(JsonOptions);
        Assert.NotNull(classes);
        Assert.Equal(8, classes.Count);
    }

    [Fact]
    public async Task ClassGroup_MemberAddAndRemove_WorksCorrectly()
    {
        // Add student S1 to class K1
        var addRes = await _client.PostAsJsonAsync("/api/classes/K1/members", new UpdateClassMemberRequest("S1", true));
        Assert.Equal(HttpStatusCode.OK, addRes.StatusCode);
        var resDto = await addRes.Content.ReadFromJsonAsync<ClassGroupDto>(JsonOptions);
        Assert.NotNull(resDto);
        Assert.Contains("S1", resDto.StudentIds);

        // Remove student S1 from class K1
        var remRes = await _client.PostAsJsonAsync("/api/classes/K1/members", new UpdateClassMemberRequest("S1", false));
        Assert.Equal(HttpStatusCode.OK, remRes.StatusCode);
        var remDto = await remRes.Content.ReadFromJsonAsync<ClassGroupDto>(JsonOptions);
        Assert.NotNull(remDto);
        Assert.DoesNotContain("S1", remDto.StudentIds);
    }

    // ==========================================
    // 5. COURSE & TOPIC ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetCoursesAndTopics_ReturnsAccurateData()
    {
        var courseRes = await _client.GetAsync("/api/courses");
        Assert.Equal(HttpStatusCode.OK, courseRes.StatusCode);

        var courses = await courseRes.Content.ReadFromJsonAsync<List<CourseDto>>(JsonOptions);
        Assert.NotNull(courses);
        Assert.Equal(6, courses.Count);

        var topicRes = await _client.GetAsync("/api/courses/M1/topics");
        Assert.Equal(HttpStatusCode.OK, topicRes.StatusCode);

        var topics = await topicRes.Content.ReadFromJsonAsync<List<TopicDto>>(JsonOptions);
        Assert.NotNull(topics);
        Assert.Equal(10, topics.Count);
    }

    [Fact]
    public async Task ReorderTopics_UpdatesOrderIndex()
    {
        var topicRes = await _client.GetAsync("/api/courses/M1/topics");
        var topics = await topicRes.Content.ReadFromJsonAsync<List<TopicDto>>(JsonOptions);
        Assert.NotNull(topics);

        // Reverse topic IDs
        var reversedIds = topics.Select(t => t.Id).Reverse().ToList();
        var reorderRes = await _client.PostAsJsonAsync("/api/courses/M1/topics/reorder", new ReorderTopicsRequest(reversedIds));
        Assert.Equal(HttpStatusCode.OK, reorderRes.StatusCode);

        var updated = await reorderRes.Content.ReadFromJsonAsync<List<TopicDto>>(JsonOptions);
        Assert.NotNull(updated);
        Assert.Equal(reversedIds[0], updated[0].Id);
        Assert.Equal(1, updated[0].OrderIndex);

        // Restore original order
        var originalIds = topics.Select(t => t.Id).ToList();
        await _client.PostAsJsonAsync("/api/courses/M1/topics/reorder", new ReorderTopicsRequest(originalIds));
    }

    // ==========================================
    // 6. PLACE & ROOM ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetPlacesAndRooms_ReturnsAccurateData()
    {
        var placeRes = await _client.GetAsync("/api/places");
        Assert.Equal(HttpStatusCode.OK, placeRes.StatusCode);

        var places = await placeRes.Content.ReadFromJsonAsync<List<PlaceDto>>(JsonOptions);
        Assert.NotNull(places);
        Assert.Equal(3, places.Count);

        var roomRes = await _client.GetAsync("/api/places/P1/rooms");
        Assert.Equal(HttpStatusCode.OK, roomRes.StatusCode);

        var rooms = await roomRes.Content.ReadFromJsonAsync<List<RoomDto>>(JsonOptions);
        Assert.NotNull(rooms);
        Assert.NotEmpty(rooms);
    }

    // ==========================================
    // 7. ACTIVITY TYPE ENDPOINTS
    // ==========================================
    [Fact]
    public async Task GetActivityTypes_ReturnsTypesList()
    {
        var response = await _client.GetAsync("/api/activity-types");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var types = await response.Content.ReadFromJsonAsync<List<ActivityTypeDto>>(JsonOptions);
        Assert.NotNull(types);
        Assert.Equal(5, types.Count);
    }
}
