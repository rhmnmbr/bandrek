namespace Bandrek.Server.Services.DateTimeProvider;

public interface IDateTimeProvider
{
    DateOnly Today { get; }
    TimeOnly NowTime { get; }
    string TodayString { get; } // YYYY-MM-DD
    string NowTimeString { get; } // HH:mm
    DateTimeOffset UtcNow { get; }
}

public class SystemDateTimeProvider : IDateTimeProvider
{
    private readonly TimeZoneInfo _timeZone;

    public SystemDateTimeProvider(IConfiguration config)
    {
        var tzId = config.GetValue<string>("Bimbel:Timezone") ?? "Asia/Jakarta";
        try
        {
            _timeZone = TimeZoneInfo.FindSystemTimeZoneById(tzId);
        }
        catch
        {
            _timeZone = TimeZoneInfo.Local;
        }
    }

    private DateTime LocalNow => TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, _timeZone).DateTime;

    public DateOnly Today => DateOnly.FromDateTime(LocalNow);
    public TimeOnly NowTime => TimeOnly.FromDateTime(LocalNow);
    public string TodayString => Today.ToString("yyyy-MM-dd");
    public string NowTimeString => NowTime.ToString("HH:mm");
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}

public class SimulatedDateTimeProvider : IDateTimeProvider
{
    public SimulatedDateTimeProvider(string today = "2026-09-16", string now = "11:39")
    {
        TodayString = today;
        NowTimeString = now;
        Today = DateOnly.Parse(today);
        NowTime = TimeOnly.Parse(now);
    }

    public DateOnly Today { get; set; }
    public TimeOnly NowTime { get; set; }
    public string TodayString { get; set; }
    public string NowTimeString { get; set; }
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
