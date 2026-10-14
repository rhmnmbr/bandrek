using System.Text.Json;
using Bandrek.Server.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Data.Seeding;

public class DataSeeder
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<DataSeeder> _logger;
    private readonly IWebHostEnvironment _env;

    public DataSeeder(
        AppDbContext db,
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger<DataSeeder> logger,
        IWebHostEnvironment env)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _env = env;
    }

    public async Task SeedAsync(bool forceReset = false)
    {
        if (forceReset)
        {
            _logger.LogWarning("Resetting existing database data before seeding...");
            await ClearExistingDataAsync();
        }

        // 1. Seed Roles and Default Users
        await SeedUsersAndRolesAsync();

        // Check if database is already seeded
        if (await _db.Students.AnyAsync())
        {
            _logger.LogInformation("Database already contains data. Skipping domain data seed.");
            return;
        }

        // 2. Locate and load seed.json
        var seedPath = Path.Combine(_env.ContentRootPath, "Data", "Seeding", "seed.json");
        if (!File.Exists(seedPath))
        {
            seedPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seeding", "seed.json");
        }

        if (!File.Exists(seedPath))
        {
            _logger.LogError("seed.json not found at {Path}", seedPath);
            return;
        }

        _logger.LogInformation("Loading seed data from {Path}...", seedPath);
        var jsonText = await File.ReadAllTextAsync(seedPath);
        using var doc = JsonDocument.Parse(jsonText);
        var root = doc.RootElement;

        // 3. Seed Places and Rooms
        await SeedPlacesAndRoomsAsync(root);

        // 4. Seed Courses and Topics
        await SeedCoursesAndTopicsAsync(root);

        // 5. Seed Activity Types
        await SeedActivityTypesAsync(root);

        // 6. Seed Students
        await SeedStudentsAsync(root);

        // 7. Seed Subjects
        await SeedSubjectsAsync(root);

        // 8. Seed Class Groups and Students
        await SeedClassGroupsAsync(root);

        // 9. Seed Manual Checklists
        await SeedManualChecklistsAsync(root);

        // 10. Seed Activities and Realizations
        await SeedActivitiesAsync(root);

        _logger.LogInformation("Database seeding completed successfully!");
    }

    private async Task ClearExistingDataAsync()
    {
        _db.Realizations.RemoveRange(_db.Realizations);
        _db.ActivityStudents.RemoveRange(_db.ActivityStudents);
        _db.ActivitySubjects.RemoveRange(_db.ActivitySubjects);
        _db.Activities.RemoveRange(_db.Activities);
        _db.ManualChecklists.RemoveRange(_db.ManualChecklists);
        _db.ClassGroupStudents.RemoveRange(_db.ClassGroupStudents);
        _db.ClassGroups.RemoveRange(_db.ClassGroups);
        _db.Subjects.RemoveRange(_db.Subjects);
        _db.Students.RemoveRange(_db.Students);
        _db.ActivityTypes.RemoveRange(_db.ActivityTypes);
        _db.Topics.RemoveRange(_db.Topics);
        _db.Courses.RemoveRange(_db.Courses);
        _db.Rooms.RemoveRange(_db.Rooms);
        _db.Places.RemoveRange(_db.Places);
        _db.AuditLogs.RemoveRange(_db.AuditLogs);

        await _db.SaveChangesAsync();
    }

    private async Task SeedUsersAndRolesAsync()
    {
        string[] roles = [UserRoles.Admin, UserRoles.Operator];
        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Default Admin User
        var admin = await _userManager.FindByNameAsync("admin");
        if (admin == null)
        {
            admin = new AppUser
            {
                UserName = "admin",
                FullName = "Administrator",
                Role = UserRoles.Admin,
                IsActive = true
            };
            var result = await _userManager.CreateAsync(admin, "Admin123!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(admin, UserRoles.Admin);
                _logger.LogInformation("Created default admin user 'admin' (password: Admin123!).");
            }
        }

        // Default Operator User
        var op = await _userManager.FindByNameAsync("operator");
        if (op == null)
        {
            op = new AppUser
            {
                UserName = "operator",
                FullName = "Operator Bimbel",
                Role = UserRoles.Operator,
                IsActive = true
            };
            var result = await _userManager.CreateAsync(op, "Operator123!");
            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(op, UserRoles.Operator);
                _logger.LogInformation("Created default operator user 'operator' (password: Operator123!).");
            }
        }
    }

    private async Task SeedPlacesAndRoomsAsync(JsonElement root)
    {
        if (root.TryGetProperty("tempat", out var placesArray))
        {
            foreach (var elem in placesArray.EnumerateArray())
            {
                var place = new Place
                {
                    Id = elem.GetProperty("id").GetString()!,
                    Name = elem.GetProperty("nama").GetString()!
                };
                _db.Places.Add(place);
            }
            await _db.SaveChangesAsync();
        }

        if (root.TryGetProperty("ruangan", out var roomsArray))
        {
            foreach (var elem in roomsArray.EnumerateArray())
            {
                var room = new Room
                {
                    Id = elem.GetProperty("id").GetString()!,
                    PlaceId = elem.GetProperty("tempat").GetString()!,
                    Name = elem.GetProperty("nama").GetString()!,
                    Capacity = elem.TryGetProperty("kapasitas", out var cap) ? cap.GetInt32() : 12
                };
                _db.Rooms.Add(room);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedCoursesAndTopicsAsync(JsonElement root)
    {
        if (root.TryGetProperty("mapel", out var coursesArray))
        {
            foreach (var elem in coursesArray.EnumerateArray())
            {
                var course = new Course
                {
                    Id = elem.GetProperty("id").GetString()!,
                    Name = elem.GetProperty("nama").GetString()!,
                    IsActive = !elem.TryGetProperty("aktif", out var act) || act.GetBoolean()
                };
                _db.Courses.Add(course);
            }
            await _db.SaveChangesAsync();
        }

        if (root.TryGetProperty("materi", out var topicsArray))
        {
            foreach (var elem in topicsArray.EnumerateArray())
            {
                var levels = new List<string>();
                if (elem.TryGetProperty("jenjang", out var jArray) && jArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var j in jArray.EnumerateArray())
                    {
                        var s = j.GetString();
                        if (!string.IsNullOrEmpty(s)) levels.Add(s);
                    }
                }

                var topic = new Topic
                {
                    Id = elem.GetProperty("id").GetString()!,
                    CourseId = elem.GetProperty("mapel").GetString()!,
                    Name = elem.GetProperty("nama").GetString()!,
                    EducationalLevels = levels,
                    IsActive = !elem.TryGetProperty("aktif", out var act) || act.GetBoolean(),
                    OrderIndex = elem.TryGetProperty("urutan", out var ord) ? ord.GetInt32() : 1
                };
                _db.Topics.Add(topic);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedActivityTypesAsync(JsonElement root)
    {
        if (root.TryGetProperty("jenis", out var typesArray))
        {
            foreach (var elem in typesArray.EnumerateArray())
            {
                var type = new ActivityType
                {
                    Id = elem.GetProperty("id").GetString()!,
                    Name = elem.GetProperty("nama").GetString()!,
                    Color = elem.TryGetProperty("warna", out var w) ? w.GetString() ?? "pembelajaran" : "pembelajaran",
                    RequiresTopic = elem.TryGetProperty("materiWajib", out var mw) && mw.GetBoolean(),
                    RequiresStudents = !elem.TryGetProperty("siswaWajib", out var sw) || sw.GetBoolean()
                };
                _db.ActivityTypes.Add(type);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedStudentsAsync(JsonElement root)
    {
        if (root.TryGetProperty("siswa", out var studentsArray))
        {
            foreach (var elem in studentsArray.EnumerateArray())
            {
                var student = new Student
                {
                    Id = elem.GetProperty("id").GetString()!,
                    FullName = elem.GetProperty("nama").GetString()!,
                    EducationalLevel = elem.GetProperty("jenjang").GetString() ?? EducationalLevels.SD,
                    IsActive = elem.GetProperty("aktif").GetBoolean(),
                    BirthDate = DateOnly.Parse(elem.GetProperty("lahir").GetString()!),
                    Gender = elem.GetProperty("kelamin").GetString() ?? Genders.Male,
                    SchoolOrigin = elem.TryGetProperty("asal", out var asal) ? asal.GetString() : null,
                    GuardianName = elem.TryGetProperty("waliNama", out var wn) ? wn.GetString() : null,
                    GuardianPhone = elem.TryGetProperty("waliWa", out var ww) ? ww.GetString() : null,
                    JoinedDate = elem.TryGetProperty("bergabung", out var bg) && !string.IsNullOrEmpty(bg.GetString())
                        ? DateOnly.Parse(bg.GetString()!)
                        : null,
                    Notes = elem.TryGetProperty("catatan", out var cat) ? cat.GetString() : null
                };
                _db.Students.Add(student);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedSubjectsAsync(JsonElement root)
    {
        if (root.TryGetProperty("subjek", out var subjectsArray))
        {
            foreach (var elem in subjectsArray.EnumerateArray())
            {
                var courseIds = new List<string>();
                if (elem.TryGetProperty("mapel", out var mArray) && mArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var m in mArray.EnumerateArray())
                    {
                        var s = m.GetString();
                        if (!string.IsNullOrEmpty(s)) courseIds.Add(s);
                    }
                }

                var availabilities = new List<WeeklyAvailability>();
                if (elem.TryGetProperty("ketersediaan", out var kArray) && kArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var k in kArray.EnumerateArray())
                    {
                        availabilities.Add(new WeeklyAvailability
                        {
                            Day = k.GetProperty("hari").GetString() ?? "Senin",
                            From = k.GetProperty("dari").GetString() ?? "08:00",
                            To = k.GetProperty("sampai").GetString() ?? "12:00"
                        });
                    }
                }

                var subject = new SubjectPerson
                {
                    Id = elem.GetProperty("id").GetString()!,
                    FullName = elem.GetProperty("nama").GetString()!,
                    Gender = elem.GetProperty("kelamin").GetString() ?? Genders.Male,
                    Role = elem.TryGetProperty("peran", out var p) ? p.GetString() ?? SubjectRoles.Instructor : SubjectRoles.Instructor,
                    IsActive = !elem.TryGetProperty("aktif", out var act) || act.GetBoolean(),
                    Contact = elem.TryGetProperty("kontak", out var c) ? c.GetString() : null,
                    CourseIds = courseIds,
                    WeeklyAvailabilities = availabilities
                };
                _db.Subjects.Add(subject);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedClassGroupsAsync(JsonElement root)
    {
        if (root.TryGetProperty("kelas", out var classArray))
        {
            foreach (var elem in classArray.EnumerateArray())
            {
                var classId = elem.GetProperty("id").GetString()!;
                var classGroup = new ClassGroup
                {
                    Id = classId,
                    Name = elem.GetProperty("nama").GetString()!,
                    EducationalLevel = elem.TryGetProperty("jenjang", out var j) ? j.GetString() : null,
                    Description = elem.TryGetProperty("keterangan", out var d) ? d.GetString() : null
                };
                _db.ClassGroups.Add(classGroup);

                if (elem.TryGetProperty("anggota", out var members) && members.ValueKind == JsonValueKind.Array)
                {
                    foreach (var m in members.EnumerateArray())
                    {
                        var studentId = m.GetString();
                        if (!string.IsNullOrEmpty(studentId))
                        {
                            _db.ClassGroupStudents.Add(new ClassGroupStudent
                            {
                                ClassGroupId = classId,
                                StudentId = studentId
                            });
                        }
                    }
                }
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedManualChecklistsAsync(JsonElement root)
    {
        if (root.TryGetProperty("ceklisManual", out var cmArray))
        {
            foreach (var elem in cmArray.EnumerateArray())
            {
                var cm = new ManualChecklist
                {
                    Id = elem.GetProperty("id").GetString()!,
                    StudentId = elem.GetProperty("siswa").GetString()!,
                    TopicId = elem.GetProperty("materi").GetString()!,
                    Date = elem.TryGetProperty("tanggal", out var t) && !string.IsNullOrEmpty(t.GetString())
                        ? DateOnly.Parse(t.GetString()!)
                        : null,
                    Notes = elem.TryGetProperty("catatan", out var c) ? c.GetString() ?? "" : "",
                    RecordedBy = elem.TryGetProperty("oleh", out var o) ? o.GetString() ?? "Sistem" : "Sistem",
                    RecordedAt = elem.TryGetProperty("dicatat", out var d) && !string.IsNullOrEmpty(d.GetString())
                        ? (DateTimeOffset.TryParse(d.GetString()!, out var parsedD) ? parsedD.ToUniversalTime() : DateTimeOffset.UtcNow)
                        : DateTimeOffset.UtcNow,
                    Source = "manual"
                };
                _db.ManualChecklists.Add(cm);
            }
            await _db.SaveChangesAsync();
        }
    }

    private async Task SeedActivitiesAsync(JsonElement root)
    {
        if (!root.TryGetProperty("kegiatan", out var activitiesArray)) return;

        // Step A: Insert Activity master records without reschedule self-references
        var pendingReschedules = new List<(string Id, string? FromId, string? ToId)>();
        var realizationsToInsert = new List<Realization>();
        var subjectsToInsert = new List<ActivitySubject>();
        var studentsToInsert = new List<ActivityStudent>();

        foreach (var elem in activitiesArray.EnumerateArray())
        {
            var actId = elem.GetProperty("id").GetString()!;

            var courseId = elem.TryGetProperty("mapel", out var m) && m.ValueKind == JsonValueKind.String
                ? m.GetString()
                : null;
            var topicId = elem.TryGetProperty("materi", out var t) && t.ValueKind == JsonValueKind.String
                ? t.GetString()
                : null;
            var classId = elem.TryGetProperty("kelas", out var cl) && cl.ValueKind == JsonValueKind.String
                ? cl.GetString()
                : null;

            var rawStatus = elem.TryGetProperty("status", out var st)
                ? st.GetString() ?? RawActivityStatuses.Scheduled
                : RawActivityStatuses.Scheduled;

            string? cancelReason = null;
            string? cancelNotes = null;
            DateTimeOffset? cancelAt = null;

            if (elem.TryGetProperty("pembatalan", out var pb) && pb.ValueKind == JsonValueKind.Object)
            {
                cancelReason = pb.TryGetProperty("alasan", out var r) ? r.GetString() : null;
                cancelNotes = pb.TryGetProperty("keterangan", out var kn) ? kn.GetString() : null;
                if (pb.TryGetProperty("pada", out var pd) && !string.IsNullOrEmpty(pd.GetString()))
                {
                    if (DateTimeOffset.TryParse(pd.GetString()!, out var parsedDate))
                    {
                        cancelAt = parsedDate.ToUniversalTime();
                    }
                }
            }

            string? rescheduleReason = null;
            if (elem.TryGetProperty("penjadwalanUlang", out var pu) && pu.ValueKind == JsonValueKind.Object)
            {
                rescheduleReason = pu.TryGetProperty("alasan", out var r) ? r.GetString() : null;
            }

            var fromId = elem.TryGetProperty("jadwalUlangDari", out var jd) && jd.ValueKind == JsonValueKind.String
                ? jd.GetString()
                : null;
            var toId = elem.TryGetProperty("jadwalUlangKe", out var jk) && jk.ValueKind == JsonValueKind.String
                ? jk.GetString()
                : null;

            if (!string.IsNullOrEmpty(fromId) || !string.IsNullOrEmpty(toId))
            {
                pendingReschedules.Add((actId, fromId, toId));
            }

            var activity = new Activity
            {
                Id = actId,
                Name = elem.GetProperty("nama").GetString()!,
                ActivityTypeId = elem.GetProperty("jenis").GetString()!,
                CourseId = courseId,
                TopicId = topicId,
                ClassGroupId = classId,
                Date = DateOnly.Parse(elem.GetProperty("tanggal").GetString()!),
                StartTime = elem.GetProperty("mulai").GetString()!,
                EndTime = elem.GetProperty("selesai").GetString()!,
                IsAllDay = elem.TryGetProperty("sepanjangHari", out var allday) && allday.GetBoolean(),
                RoomId = elem.GetProperty("ruangan").GetString()!,
                CustomPlace = elem.TryGetProperty("tempatCustom", out var tc) ? tc.GetString() : null,
                Notes = elem.TryGetProperty("catatan", out var cat) ? cat.GetString() ?? "" : "",
                RawStatus = rawStatus,
                CancellationReason = cancelReason,
                CancellationNotes = cancelNotes,
                CancelledAt = cancelAt,
                RescheduleReason = rescheduleReason,
                SeriesId = elem.TryGetProperty("seriId", out var sid) ? sid.GetString() : null,
                SeriesOrder = elem.TryGetProperty("urutanSeri", out var so) && so.ValueKind == JsonValueKind.Number ? so.GetInt32() : null,
                SeriesTotal = elem.TryGetProperty("totalSeri", out var stt) && stt.ValueKind == JsonValueKind.Number ? stt.GetInt32() : null,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _db.Activities.Add(activity);

            // Collect Subjects
            if (elem.TryGetProperty("subjek", out var subArray) && subArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var s in subArray.EnumerateArray())
                {
                    subjectsToInsert.Add(new ActivitySubject
                    {
                        ActivityId = actId,
                        SubjectPersonId = s.GetProperty("id").GetString()!,
                        Role = s.TryGetProperty("peran", out var p) ? p.GetString() ?? SubjectRoles.Instructor : SubjectRoles.Instructor
                    });
                }
            }

            // Collect Students
            if (elem.TryGetProperty("siswa", out var sArray) && sArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var s in sArray.EnumerateArray())
                {
                    var sId = s.GetString();
                    if (!string.IsNullOrEmpty(sId))
                    {
                        studentsToInsert.Add(new ActivityStudent
                        {
                            ActivityId = actId,
                            StudentId = sId
                        });
                    }
                }
            }

            // Collect Realization
            if (elem.TryGetProperty("realisasi", out var realElem) && realElem.ValueKind == JsonValueKind.Object)
            {
                var actualTopic = realElem.TryGetProperty("materi", out var rtm) && rtm.ValueKind == JsonValueKind.String
                    ? rtm.GetString()
                    : null;

                var studentAtt = new Dictionary<string, string>();
                if (realElem.TryGetProperty("kehadiran", out var attObj) && attObj.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in attObj.EnumerateObject())
                    {
                        studentAtt[prop.Name] = prop.Value.GetString() ?? AttendanceStatuses.Present;
                    }
                }

                var studentNotes = new Dictionary<string, string>();
                if (realElem.TryGetProperty("catatanSiswa", out var snObj) && snObj.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in snObj.EnumerateObject())
                    {
                        studentNotes[prop.Name] = prop.Value.GetString() ?? "";
                    }
                }

                var subjectAtt = new Dictionary<string, string>();
                if (realElem.TryGetProperty("kehadiranSubjek", out var saObj) && saObj.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in saObj.EnumerateObject())
                    {
                        subjectAtt[prop.Name] = prop.Value.GetString() ?? AttendanceStatuses.Present;
                    }
                }

                var subjectNotes = new Dictionary<string, string>();
                if (realElem.TryGetProperty("catatanSubjek", out var subnObj) && subnObj.ValueKind == JsonValueKind.Object)
                {
                    foreach (var prop in subnObj.EnumerateObject())
                    {
                        subjectNotes[prop.Name] = prop.Value.GetString() ?? "";
                    }
                }

                DateTimeOffset filledAt = DateTimeOffset.UtcNow;
                if (realElem.TryGetProperty("diisiPada", out var dp) && !string.IsNullOrEmpty(dp.GetString()))
                {
                    if (DateTimeOffset.TryParse(dp.GetString()!, out var parsedTime))
                    {
                        filledAt = parsedTime.ToUniversalTime();
                    }
                }

                realizationsToInsert.Add(new Realization
                {
                    ActivityId = actId,
                    ActualStartTime = realElem.TryGetProperty("mulai", out var rm) ? rm.GetString() ?? activity.StartTime : activity.StartTime,
                    ActualEndTime = realElem.TryGetProperty("selesai", out var rs) ? rs.GetString() ?? activity.EndTime : activity.EndTime,
                    ActualTopicId = actualTopic,
                    CompletionStatus = realElem.TryGetProperty("ketuntasan", out var kt) ? kt.GetString() : CompletionStatuses.Completed,
                    Notes = realElem.TryGetProperty("catatan", out var rcat) ? rcat.GetString() ?? "" : "",
                    StudentAttendances = studentAtt,
                    StudentNotes = studentNotes,
                    SubjectAttendances = subjectAtt,
                    SubjectNotes = subjectNotes,
                    FilledBy = realElem.TryGetProperty("diisiOleh", out var dio) ? dio.GetString() ?? "Operator" : "Operator",
                    FilledAt = filledAt
                });
            }
        }

        // Save primary activity rows first
        await _db.SaveChangesAsync();

        // Step B: Save Subjects & Students join rows
        _db.ActivitySubjects.AddRange(subjectsToInsert);
        _db.ActivityStudents.AddRange(studentsToInsert);
        _db.Realizations.AddRange(realizationsToInsert);
        await _db.SaveChangesAsync();

        // Step C: Apply reschedule links
        if (pendingReschedules.Count > 0)
        {
            var activities = await _db.Activities.ToListAsync();
            var actMap = activities.ToDictionary(a => a.Id);

            foreach (var (id, fromId, toId) in pendingReschedules)
            {
                if (actMap.TryGetValue(id, out var act))
                {
                    if (!string.IsNullOrEmpty(fromId) && actMap.ContainsKey(fromId))
                    {
                        act.RescheduledFromId = fromId;
                    }
                    if (!string.IsNullOrEmpty(toId) && actMap.ContainsKey(toId))
                    {
                        act.RescheduledToId = toId;
                    }
                }
            }
            await _db.SaveChangesAsync();
        }
    }
}
