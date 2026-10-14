namespace Bandrek.Server.Data.Entities;

public static class EducationalLevels
{
    public const string SD = "SD";
    public const string SMP = "SMP";
    public const string SMA = "SMA";
}

public static class Genders
{
    public const string Male = "L";
    public const string Female = "P";
}

public static class SubjectRoles
{
    public const string Instructor = "Pengisi";
    public const string Guardian = "Wali";
    public const string Support = "Support";
    public const string Assistant = "Pendamping";
}

public static class ActivityStatuses
{
    public const string Scheduled = "terjadwal";
    public const string PendingRealization = "belum_direalisasi";
    public const string Realized = "terealisasi";
    public const string Cancelled = "dibatalkan";
    public const string Rescheduled = "dijadwal_ulang";
}

public static class RawActivityStatuses
{
    public const string Scheduled = "terjadwal";
    public const string Pending = "belum";
    public const string Realized = "terealisasi";
    public const string Cancelled = "dibatalkan";
    public const string Rescheduled = "dijadwal-ulang";
}

public static class AttendanceStatuses
{
    public const string Present = "hadir";
    public const string Sick = "sakit";
    public const string Permitted = "izin";
    public const string Absent = "alpa";
}

public static class CompletionStatuses
{
    public const string Completed = "tuntas";
    public const string Partial = "sebagian";
    public const string NotCompleted = "tidak";
}

public static class UserRoles
{
    public const string Admin = "admin";
    public const string Operator = "operator";
}
