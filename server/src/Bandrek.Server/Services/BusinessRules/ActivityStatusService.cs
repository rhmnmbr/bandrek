using Bandrek.Server.Data.Entities;

namespace Bandrek.Server.Services.BusinessRules;

public class ActivityStatusService
{
    public string ComputeStatus(
        string rawStatus,
        bool hasRealization,
        DateOnly date,
        string endTime,
        DateOnly today,
        string nowTime)
    {
        if (rawStatus == RawActivityStatuses.Cancelled) return ActivityStatuses.Cancelled;
        if (rawStatus == RawActivityStatuses.Rescheduled) return ActivityStatuses.Rescheduled;
        if (rawStatus == RawActivityStatuses.Realized || hasRealization) return ActivityStatuses.Realized;

        // Belum direalisasi adalah status turunan: tanggal sudah lewat, tapi realisasi belum diisi
        bool isPastDate = date < today;
        bool isPastTimeToday = date == today && string.CompareOrdinal(endTime, nowTime) <= 0;

        if (rawStatus == RawActivityStatuses.Pending || isPastDate || isPastTimeToday)
        {
            return ActivityStatuses.PendingRealization;
        }

        return ActivityStatuses.Scheduled;
    }

    public List<string> ComputeAllowedActions(
        string status,
        DateOnly date,
        string startTime,
        DateOnly today,
        string nowTime)
    {
        switch (status)
        {
            case ActivityStatuses.PendingRealization:
                return ["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"];

            case ActivityStatuses.Scheduled:
            {
                // Realisasi baru bisa diisi sejak jam mulai kegiatan tiba pada hari H
                bool isPastDate = date < today;
                bool isStartedToday = date == today && string.CompareOrdinal(startTime, nowTime) <= 0;
                bool canRealize = isPastDate || isStartedToday;

                return canRealize
                    ? ["lihat_detail", "edit", "isi_realisasi", "jadwal_ulang", "batalkan"]
                    : ["lihat_detail", "edit", "jadwal_ulang", "batalkan"];
            }

            case ActivityStatuses.Realized:
                return ["lihat_detail", "ubah_realisasi"];

            case ActivityStatuses.Cancelled:
            case ActivityStatuses.Rescheduled:
            default:
                return ["lihat_detail"];
        }
    }
}
