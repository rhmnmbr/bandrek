namespace Bandrek.Server.Data.Entities;

public class Place
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public List<Room> Rooms { get; set; } = new();
}

public class Room
{
    public string Id { get; set; } = string.Empty;
    public string PlaceId { get; set; } = string.Empty;
    public Place Place { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; } = 12;

    // Navigation properties
    public List<Activity> Activities { get; set; } = new();
}
