namespace Bandrek.Server.Features.Master;

public record RoomDto(
    string Id,
    string PlaceId,
    string Name,
    int Capacity,
    int ActivityCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record PlaceDto(
    string Id,
    string Name,
    List<RoomDto> Rooms,
    int RoomCount,
    bool CanDelete,
    string? CannotDeleteReason,
    List<string> UsageDetails);

public record CreatePlaceRequest(
    string? Id,
    string Name);

public record UpdatePlaceRequest(
    string? Name);

public record CreateRoomRequest(
    string? Id,
    string PlaceId,
    string Name,
    int? Capacity);

public record UpdateRoomRequest(
    string? Name,
    int? Capacity);
