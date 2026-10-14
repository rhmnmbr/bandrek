namespace Bandrek.Server.Features.Auth;

public record LoginRequest(string Username, string Password);

public record UserDto(
    string Id,
    string Username,
    string FullName,
    string Role,
    bool IsActive,
    DateTimeOffset CreatedAt);

public record AuthSessionResponse(
    string Token,
    UserDto User,
    string ServerUrl,
    DateTimeOffset LoginAt);

public record CreateUserRequest(
    string Username,
    string FullName,
    string Password,
    string Role);

public record UpdateUserRequest(
    string? FullName,
    string? Password,
    string? Role,
    bool? IsActive);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);
