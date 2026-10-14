using Bandrek.Server.Common.Models;
using Bandrek.Server.Data;
using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Master;

public static class PlaceRoomEndpoints
{
    public static void MapPlaceRoomEndpoints(this IEndpointRouteBuilder app)
    {
        var placeGroup = app.MapGroup("/api/places").WithTags("Places");
        var roomGroup = app.MapGroup("/api/rooms").WithTags("Rooms");

        // GET /api/places
        placeGroup.MapGet("/", async (
            AppDbContext db,
            MasterUsageChecker usageChecker,
            string? q,
            CancellationToken ct) =>
        {
            var query = db.Places
                .AsNoTracking()
                .Include(p => p.Rooms)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(term));
            }

            var places = await query.OrderBy(p => p.Name).ToListAsync(ct);
            var result = new List<PlaceDto>();

            foreach (var p in places)
            {
                var usage = await usageChecker.CheckPlaceUsageAsync(p.Id, ct);
                var rooms = p.Rooms.OrderBy(r => r.Name).Select(r => new RoomDto(
                    r.Id,
                    r.PlaceId,
                    r.Name,
                    r.Capacity,
                    0,
                    true,
                    null,
                    new List<string>())).ToList();

                result.Add(new PlaceDto(
                    p.Id,
                    p.Name,
                    rooms,
                    p.Rooms.Count,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetPlaces")
        .Produces<List<PlaceDto>>(StatusCodes.Status200OK);

        // GET /api/places/{id}
        placeGroup.MapGet("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var p = await db.Places
                .AsNoTracking()
                .Include(place => place.Rooms)
                .FirstOrDefaultAsync(place => place.Id == id, ct);

            if (p == null) return Results.NotFound(new { message = $"Tempat dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckPlaceUsageAsync(p.Id, ct);
            var rooms = new List<RoomDto>();

            foreach (var r in p.Rooms.OrderBy(r => r.Name))
            {
                var rUsage = await usageChecker.CheckRoomUsageAsync(r.Id, ct);
                rooms.Add(new RoomDto(
                    r.Id,
                    r.PlaceId,
                    r.Name,
                    r.Capacity,
                    0,
                    rUsage.CanDelete,
                    rUsage.Reason,
                    rUsage.UsageDetails));
            }

            return Results.Ok(new PlaceDto(
                p.Id,
                p.Name,
                rooms,
                p.Rooms.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("GetPlaceById")
        .Produces<PlaceDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/places
        placeGroup.MapPost("/", async (
            CreatePlaceRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { message = "Nama tempat wajib diisi." });
            }

            string placeId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(placeId))
            {
                var existingIds = await db.Places.Select(p => p.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("P", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                placeId = $"P{maxNum + 1}";
            }
            else
            {
                var exists = await db.Places.AnyAsync(p => p.Id == placeId, ct);
                if (exists) return Results.Conflict(new { message = $"Tempat dengan ID '{placeId}' sudah ada." });
            }

            var place = new Place
            {
                Id = placeId,
                Name = request.Name.Trim()
            };

            db.Places.Add(place);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/places/{place.Id}", new PlaceDto(
                place.Id,
                place.Name,
                new List<RoomDto>(),
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreatePlace")
        .Produces<PlaceDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/places/{id}
        placeGroup.MapPut("/{id}", async (
            string id,
            UpdatePlaceRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var place = await db.Places
                .Include(p => p.Rooms)
                .FirstOrDefaultAsync(p => p.Id == id, ct);

            if (place == null) return Results.NotFound(new { message = $"Tempat dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) place.Name = request.Name.Trim();

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckPlaceUsageAsync(place.Id, ct);
            return Results.Ok(new PlaceDto(
                place.Id,
                place.Name,
                place.Rooms.Select(r => new RoomDto(
                    r.Id,
                    r.PlaceId,
                    r.Name,
                    r.Capacity,
                    0,
                    true,
                    null,
                    new List<string>())).ToList(),
                place.Rooms.Count,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdatePlace")
        .Produces<PlaceDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/places/{id}
        placeGroup.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var place = await db.Places.FirstOrDefaultAsync(p => p.Id == id, ct);
            if (place == null) return Results.NotFound(new { message = $"Tempat dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckPlaceUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Places.Remove(place);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Tempat berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeletePlace")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/rooms
        roomGroup.MapGet("/", async (
            AppDbContext db,
            string? placeId,
            CancellationToken ct) =>
        {
            var query = db.Rooms.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(placeId))
            {
                query = query.Where(r => r.PlaceId == placeId);
            }

            var rooms = await query.OrderBy(r => r.PlaceId).ThenBy(r => r.Name).ToListAsync(ct);
            return Results.Ok(rooms.Select(r => new RoomDto(
                r.Id,
                r.PlaceId,
                r.Name,
                r.Capacity,
                0,
                true,
                null,
                new List<string>())).ToList());
        })
        .WithName("GetAllRooms")
        .Produces<List<RoomDto>>(StatusCodes.Status200OK);

        // GET /api/places/{placeId}/rooms
        placeGroup.MapGet("/{placeId}/rooms", async (
            string placeId,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var rooms = await db.Rooms
                .AsNoTracking()
                .Where(r => r.PlaceId == placeId)
                .OrderBy(r => r.Name)
                .ToListAsync(ct);

            var result = new List<RoomDto>();
            foreach (var r in rooms)
            {
                var usage = await usageChecker.CheckRoomUsageAsync(r.Id, ct);
                result.Add(new RoomDto(
                    r.Id,
                    r.PlaceId,
                    r.Name,
                    r.Capacity,
                    0,
                    usage.CanDelete,
                    usage.Reason,
                    usage.UsageDetails));
            }

            return Results.Ok(result);
        })
        .WithName("GetRoomsByPlace")
        .Produces<List<RoomDto>>(StatusCodes.Status200OK);

        // POST /api/rooms
        roomGroup.MapPost("/", async (
            CreateRoomRequest request,
            AppDbContext db,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.PlaceId))
            {
                return Results.BadRequest(new { message = "Nama ruangan dan ID tempat wajib diisi." });
            }

            string roomId = request.Id?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(roomId))
            {
                var existingIds = await db.Rooms.Select(r => r.Id).ToListAsync(ct);
                int maxNum = 0;
                foreach (var eid in existingIds)
                {
                    if (eid.StartsWith("R", StringComparison.OrdinalIgnoreCase) &&
                        int.TryParse(eid[1..], out var num) && num > maxNum)
                    {
                        maxNum = num;
                    }
                }
                roomId = $"R{maxNum + 1}";
            }
            else
            {
                var exists = await db.Rooms.AnyAsync(r => r.Id == roomId, ct);
                if (exists) return Results.Conflict(new { message = $"Ruangan dengan ID '{roomId}' sudah ada." });
            }

            var room = new Room
            {
                Id = roomId,
                PlaceId = request.PlaceId,
                Name = request.Name.Trim(),
                Capacity = request.Capacity ?? 12
            };

            db.Rooms.Add(room);
            await db.SaveChangesAsync(ct);

            return Results.Created($"/api/rooms/{room.Id}", new RoomDto(
                room.Id,
                room.PlaceId,
                room.Name,
                room.Capacity,
                0,
                true,
                null,
                new List<string>()));
        })
        .WithName("CreateRoom")
        .Produces<RoomDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/rooms/{id}
        roomGroup.MapPut("/{id}", async (
            string id,
            UpdateRoomRequest request,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var room = await db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
            if (room == null) return Results.NotFound(new { message = $"Ruangan dengan ID '{id}' tidak ditemukan." });

            if (!string.IsNullOrWhiteSpace(request.Name)) room.Name = request.Name.Trim();
            if (request.Capacity.HasValue) room.Capacity = request.Capacity.Value;

            await db.SaveChangesAsync(ct);

            var usage = await usageChecker.CheckRoomUsageAsync(room.Id, ct);
            return Results.Ok(new RoomDto(
                room.Id,
                room.PlaceId,
                room.Name,
                room.Capacity,
                0,
                usage.CanDelete,
                usage.Reason,
                usage.UsageDetails));
        })
        .WithName("UpdateRoom")
        .Produces<RoomDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // DELETE /api/rooms/{id}
        roomGroup.MapDelete("/{id}", async (
            string id,
            AppDbContext db,
            MasterUsageChecker usageChecker,
            CancellationToken ct) =>
        {
            var room = await db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
            if (room == null) return Results.NotFound(new { message = $"Ruangan dengan ID '{id}' tidak ditemukan." });

            var usage = await usageChecker.CheckRoomUsageAsync(id, ct);
            if (!usage.CanDelete)
            {
                return Results.Conflict(new DeleteResultDto(
                    false,
                    usage.Reason,
                    usage.UsageCount,
                    usage.UsageDetails));
            }

            db.Rooms.Remove(room);
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeleteResultDto(
                true,
                "Ruangan berhasil dihapus.",
                0,
                new List<string>()));
        })
        .WithName("DeleteRoom")
        .Produces<DeleteResultDto>(StatusCodes.Status200OK)
        .Produces<DeleteResultDto>(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status404NotFound);
    }
}
