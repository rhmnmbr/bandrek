using Microsoft.AspNetCore.Identity;

namespace Bandrek.Server.Data.Entities;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = UserRoles.Operator;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
