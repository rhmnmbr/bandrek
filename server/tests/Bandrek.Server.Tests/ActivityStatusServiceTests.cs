using Bandrek.Server.Data.Entities;
using Bandrek.Server.Services.BusinessRules;
using Xunit;

namespace Bandrek.Server.Tests;

public class ActivityStatusServiceTests
{
    private readonly ActivityStatusService _sut = new();

    private readonly DateOnly _today = new(2026, 9, 16);
    private const string _nowTime = "11:39";

    [Fact]
    public void ComputeStatus_Cancelled_ReturnsDibatalkan()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Cancelled,
            hasRealization: false,
            date: new DateOnly(2026, 9, 15),
            endTime: "10:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Cancelled, status);
        var actions = _sut.ComputeAllowedActions(status, new DateOnly(2026, 9, 15), "08:00", _today, _nowTime);
        Assert.Equal(["lihat_detail"], actions);
    }

    [Fact]
    public void ComputeStatus_Rescheduled_ReturnsDijadwalUlang()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Rescheduled,
            hasRealization: false,
            date: new DateOnly(2026, 9, 15),
            endTime: "10:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Rescheduled, status);
        var actions = _sut.ComputeAllowedActions(status, new DateOnly(2026, 9, 15), "08:00", _today, _nowTime);
        Assert.Equal(["lihat_detail"], actions);
    }

    [Fact]
    public void ComputeStatus_Realized_ReturnsTerealisasi()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Realized,
            hasRealization: true,
            date: new DateOnly(2026, 9, 15),
            endTime: "10:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Realized, status);
        var actions = _sut.ComputeAllowedActions(status, new DateOnly(2026, 9, 15), "08:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "ubah_realisasi"], actions);
    }

    [Fact]
    public void ComputeStatus_PastDateWithoutRealization_ReturnsBelumDirealisasi()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: new DateOnly(2026, 9, 15),
            endTime: "10:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.PendingRealization, status);
        var actions = _sut.ComputeAllowedActions(status, new DateOnly(2026, 9, 15), "08:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_TodayPastEndTimeWithoutRealization_ReturnsBelumDirealisasi()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: _today,
            endTime: "10:00", // Earlier than now 11:39
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.PendingRealization, status);
        var actions = _sut.ComputeAllowedActions(status, _today, "08:30", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_TodayOngoing_ReturnsTerjadwalWithIsiRealisasi()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: _today,
            endTime: "12:00", // Later than now 11:39
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Scheduled, status);

        // Start time was 11:00 (started today, now 11:39) -> should allow isi_realisasi
        var actions = _sut.ComputeAllowedActions(status, _today, "11:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_TodayFutureStartTime_ReturnsTerjadwalWithoutIsiRealisasi()
    {
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: _today,
            endTime: "16:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Scheduled, status);

        // Start time is 14:00 (later than now 11:39) -> cannot realize yet
        var actions = _sut.ComputeAllowedActions(status, _today, "14:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_FutureDate_ReturnsTerjadwalWithoutIsiRealisasi()
    {
        var futureDate = new DateOnly(2026, 9, 20);
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: futureDate,
            endTime: "10:00",
            today: _today,
            nowTime: _nowTime);

        Assert.Equal(ActivityStatuses.Scheduled, status);

        var actions = _sut.ComputeAllowedActions(status, futureDate, "08:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_CrossDay_ReturnsScheduledWhileStillInProgress()
    {
        // Activity started yesterday (Sep 15 at 16:00), ends today (Sep 16 at 17:00)
        // Today is Sep 16, nowTime is 11:39 -> should be Scheduled (still running, end time not passed yet)
        var yesterday = new DateOnly(2026, 9, 15);
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: yesterday,
            endTime: "17:00",
            today: _today,
            nowTime: _nowTime,
            endDate: _today);

        Assert.Equal(ActivityStatuses.Scheduled, status);

        // Can realize because it has already started (started yesterday)
        var actions = _sut.ComputeAllowedActions(status, yesterday, "16:00", _today, _nowTime);
        Assert.Equal(["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"], actions);
    }

    [Fact]
    public void ComputeStatus_CrossDay_ReturnsPendingRealizationWhenEndDatePassed()
    {
        // Activity started Sep 14 at 16:00, ended Sep 15 at 17:00
        // Today is Sep 16 -> should be PendingRealization
        var startDate = new DateOnly(2026, 9, 14);
        var endDate = new DateOnly(2026, 9, 15);
        var status = _sut.ComputeStatus(
            rawStatus: RawActivityStatuses.Scheduled,
            hasRealization: false,
            date: startDate,
            endTime: "17:00",
            today: _today,
            nowTime: _nowTime,
            endDate: endDate);

        Assert.Equal(ActivityStatuses.PendingRealization, status);
    }
}
