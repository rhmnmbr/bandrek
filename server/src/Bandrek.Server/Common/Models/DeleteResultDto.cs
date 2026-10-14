namespace Bandrek.Server.Common.Models;

public record DeleteResultDto(
    bool Success,
    string? Message,
    int UsageCount,
    List<string> UsageDetails);
