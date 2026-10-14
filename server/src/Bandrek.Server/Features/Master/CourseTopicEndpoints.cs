using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class CourseTopicEndpoints
{
    public static void MapCourseTopicEndpoints(this IEndpointRouteBuilder app)
    {
        var courseGroup = app.MapGroup("/api/courses").WithTags("Courses");
        var topicGroup = app.MapGroup("/api/topics").WithTags("Topics");

        // GET /api/courses
        courseGroup.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? isActive,
            string? q,
            CancellationToken ct) =>
        {
            var query = db.Courses
                .AsNoTracking()
                .Include(c => c.Topics)
                .Include(c => c.Activities)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(isActive) && isActive != "semua")
            {
                bool activeBool = isActive == "aktif" || isActive == "true";
                query = query.Where(c => c.IsActive == activeBool);
            }

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(term));
            }

            var courses = await query.OrderBy(c => c.Name).ToListAsync(ct);
            var result = new List<CourseDto>();

            foreach (var c in courses)
            {
                var usage = await usageChecker.CheckCourseUsageAsync(c.Id, ct);
                var topics = c.Topics.OrderBy(t => t.OrderIndex).Select(t => new TopicDto(
                    t.Id,
                    t.CourseId,
                    t.Name,
                    t.EducationalLevels,
                    t.IsActive,
                    t.OrderIndex,
                    0,
                    0,
                    true,
                    null,
                    new List<string>())).ToList();

                result.Add(new CourseDto(
                    c.Id,
                    c.Name,
                    c.IsActive,
                    topics,
                    c.Topics.Count,
                    c.Activities.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetCourses")
        .Produces<List<CourseDto>>(StatusCodes.Status200OK);

        // GET /api/courses/{id}
        courseGroup.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var c = await db.Courses
                .AsNoTracking()
                .Include(course => course.Topics)
                .Include(course => course.Activities)
                .FirstOrDefaultAsync(course => course.Id == id, ct);

            if (c == null) return Results.NotFound(new { message = $"Mata pelajaran dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckCourseUsageAsync(c.Id, ct);
            var topics = new List<TopicDto>();

            foreach (var t in c.Topics.OrderBy(t => t.OrderIndex))
            {
                var tUsage = await usageChecker.CheckTopicUsageAsync(t.Id, ct);
                topics.Add(new TopicDto(
                    t.Id,
                    t.CourseId,
                    t.Name,
                    t.EducationalLevels,
                    t.IsActive,
                    t.OrderIndex,
                    0,
                    0,
                    tUsage.CanDelete,
                    tUsage.Reason,
                    tUsage.UsageDetails));
            }

            return Results.Ok(new CourseDto(
                c.Id,
                c.Name,
                c.IsActive,
                topics,
                c.Topics.Count,
                c.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetCourseById")
        .Produces<CourseDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/courses
        courseGroup.MapPost("/", async (
            CreateCourseRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { message = "Nama mata pelajaran wajib diisi." });
            }

            string courseId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(courseId))
            {
                var existingIds = await db.Courses.Select(c => c.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("M", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                courseId = $"M{maxNum + 1}";
            }
            else
            {
                var exists = await db.Courses.AnyAsync(c => c.Id == courseId, ct);
                if (exists) return Results.Conflict(new { message = $"Mata pelajaran dengan ID '{courseId}' sudah ada." });
            }

            var course = new Course
            {
                Id = courseId,
                Name = request.Name.Trim(),
                IsActive = request.IsActive ?? true
            };

            db.Courses.Add(course);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/courses/{course.Id}", new CourseDto(
                course.Id,
                course.Name,
                course.IsActive,
                new List<TopicDto>(),
                0,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateCourse")
        .Produces<CourseDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/courses/{id}
        courseGroup.MapPut("/{id}", async (
            string id,
            UpdateCourseRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var course = await db.Courses
                .Include(c => c.Topics)
                .Include(c => c.Activities)
                .FirstOrDefaultAsync(c => c.Id == id, ct);

            if (course == null) return Results.NotFound(new { message = $"Mata pelajaran dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) course.Name = request.Name.Trim();
            if (request.IsActive.HasValue) course.IsActive = request.IsActive.Value;

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckCourseUsageAsync(course.Id, ct);
            return Results.Ok(new CourseDto(
                course.Id,
                course.Name,
                course.IsActive,
                course.Topics.Select(t => new TopicDto(
                    t.Id,
                    t.CourseId,
                    t.Name,
                    t.EducationalLevels,
                    t.IsActive,
                    t.OrderIndex,
                    0,
                    0,
                    true,
                    null,
                    new List<string>())).ToList(),
                course.Topics.Count,
                course.Activities.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateCourse")
        .Produces<CourseDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/courses/{id}
        courseGroup.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var course = await db.Courses.FirstOrDefaultAsync(c => c.Id == id, ct);
            if (course == null) return Results.NotFound(new { message = $"Mata pelajaran dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckCourseUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Courses.Remove(course);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Mata pelajaran berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteCourse")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/topics
        topicGroup.MapGet("/", async (
            AppDbContext db,
            string? courseId,
            CancellationToken ct) =>
        {
            var query = db.Topics.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(courseId))
            {
                query = query.Where(t => t.CourseId == courseId);
            }

            var topics = await query.OrderBy(t => t.CourseId).ThenBy(t => t.OrderIndex).ToListAsync(ct);
            return Results.Ok(topics.Select(t => new TopicDto(
                t.Id,
                t.CourseId,
                t.Name,
                t.EducationalLevels,
                t.IsActive,
                t.OrderIndex,
                0,
                0,
                true,
                null,
                new List<string>())).ToList());
        })
        .WithName("GetAllTopics")
        .Produces<List<TopicDto>>(StatusCodes.Status200OK);

        // GET /api/courses/{courseId}/topics
        courseGroup.MapGet("/{courseId}/topics", async (
            string courseId,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var topics = await db.Topics
                .AsNoTracking()
                .Where(t => t.CourseId == courseId)
                .OrderBy(t => t.OrderIndex)
                .ToListAsync(ct);

            var result = new List<TopicDto>();
            foreach (var t in topics)
            {
                var usage = await usageChecker.CheckTopicUsageAsync(t.Id, ct);
                result.Add(new TopicDto(
                    t.Id,
                    t.CourseId,
                    t.Name,
                    t.EducationalLevels,
                    t.IsActive,
                    t.OrderIndex,
                    0,
                    0,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetTopicsByCourse")
        .Produces<List<TopicDto>>(StatusCodes.Status200OK);

        // POST /api/topics
        topicGroup.MapPost("/", async (
            CreateTopicRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.CourseId))
            {
                return Results.BadRequest(new { message = "Nama materi dan ID mata pelajaran wajib diisi." });
            }

            string topicId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(topicId))
            {
                var existingIds = await db.Topics.Select(t => t.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("T", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                topicId = $"T{maxNum + 1}";
            }
            else
            {
                var exists = await db.Topics.AnyAsync(t => t.Id == topicId, ct);
                if (exists) return Results.Conflict(new { message = $"Materi dengan ID '{topicId}' sudah ada." });
            }

            int order = request.OrderIndex ?? 1;
            if (!request.OrderIndex.HasValue)
            {
                var maxOrder = await db.Topics
                    .Where(t => t.CourseId == request.CourseId)
                    .MaxAsync(t => (int?)t.OrderIndex, ct);
                order = (maxOrder ?? 0) + 1;
            }

            var topic = new Topic
            {
                Id = topicId,
                CourseId = request.CourseId,
                Name = request.Name.Trim(),
                EducationalLevels = request.EducationalLevels ?? new List<string> { "SD", "SMP", "SMA" },
                IsActive = request.IsActive ?? true,
                OrderIndex = order
            };

            db.Topics.Add(topic);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/topics/{topic.Id}", new TopicDto(
                topic.Id,
                topic.CourseId,
                topic.Name,
                topic.EducationalLevels,
                topic.IsActive,
                topic.OrderIndex,
                0,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateTopic")
        .Produces<TopicDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/topics/{id}
        topicGroup.MapPut("/{id}", async (
            string id,
            UpdateTopicRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var topic = await db.Topics.FirstOrDefaultAsync(t => t.Id == id, ct);
            if (topic == null) return Results.NotFound(new { message = $"Materi dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) topic.Name = request.Name.Trim();
            if (request.EducationalLevels != null) topic.EducationalLevels = request.EducationalLevels;
            if (request.IsActive.HasValue) topic.IsActive = request.IsActive.Value;
            if (request.OrderIndex.HasValue) topic.OrderIndex = request.OrderIndex.Value;

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckTopicUsageAsync(topic.Id, ct);
            return Results.Ok(new TopicDto(
                topic.Id,
                topic.CourseId,
                topic.Name,
                topic.EducationalLevels,
                topic.IsActive,
                topic.OrderIndex,
                0,
                0,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateTopic")
        .Produces<TopicDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/topics/{id}
        topicGroup.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var topic = await db.Topics.FirstOrDefaultAsync(t => t.Id == id, ct);
            if (topic == null) return Results.NotFound(new { message = $"Materi dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckTopicUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Topics.Remove(topic);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Materi berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteTopic")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/courses/{courseId}/topics/reorder
        courseGroup.MapPost("/{courseId}/topics/reorder", async (
            string courseId,
            ReorderTopicsRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            var topics = await db.Topics
                .Where(t => t.CourseId == courseId)
                .ToListAsync(ct);

            var topicMap = topics.ToDictionary(t => t.Id);

            for (int i = 0; i < request.OrderedTopicIds.Count; i++)
            {
                var tid = request.OrderedTopicIds[i];
                if (topicMap.TryGetValue(tid, out var topic))
                {
                    topic.OrderIndex = i + 1;
                }
            }

            await db.SaveChangesAsync(ct);

            var updatedTopics = topics.OrderBy(t => t.OrderIndex).Select(t => new TopicDto(
                t.Id,
                t.CourseId,
                t.Name,
                t.EducationalLevels,
                t.IsActive,
                t.OrderIndex,
                0,
                0,
                true,
                null,
                new List<string>())).ToList();

            return Results.Ok(updatedTopics);
        })
        .WithName("ReorderCourseTopics")
        .Produces<List<TopicDto>>(StatusCodes.Status200OK);
    }
}
