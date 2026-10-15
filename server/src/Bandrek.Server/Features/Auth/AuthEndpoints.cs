using System.Security.Claims;
using Bandrek.Server.Data.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Bandrek.Server.Features.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Auth");
        var userGroup = app.MapGroup("/api/users").WithTags("Users");

        // POST /api/auth/login
        authGroup.MapPost("/login", async (
            LoginRequest request,
            UserManager<AppUser> userManager,
            TokenService tokenService,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            HttpContext context) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { message = "Username dan password wajib diisi." });
            }

            var user = await userManager.FindByNameAsync(request.Username.Trim());
            if (user == null || !user.IsActive)
            {
                return Results.Json(new { message = "Username atau password salah, atau akun dinonaktifkan." }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                return Results.Json(new { message = "Username atau password salah." }, statusCode: StatusCodes.Status401Unauthorized);
            }

            var token = tokenService.GenerateToken(user);
            var serverUrl = $"{context.Request.Scheme}://{context.Request.Host}";

            var userDto = new UserDto(
                user.Id,
                user.UserName ?? "",
                user.FullName,
                user.Role,
                user.IsActive,
                user.CreatedAt);

            await auditService.LogAsync(
                action: "login",
                category: "pengguna",
                entityType: "pengguna",
                entityName: user.FullName,
                summary: $"Pengguna {user.FullName} ({user.UserName}) berhasil masuk ke aplikasi",
                httpContext: context,
                explicitUser: user);

            return Results.Ok(new AuthSessionResponse(
                token,
                userDto,
                serverUrl,
                DateTimeOffset.UtcNow));
        })
        .WithName("Login")
        .Produces<AuthSessionResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .AllowAnonymous();

        // POST /api/auth/logout
        authGroup.MapPost("/logout", () => Results.Ok(new { message = "Berhasil logout." }))
            .WithName("Logout")
            .Produces(StatusCodes.Status200OK);

        // GET /api/auth/session
        authGroup.MapGet("/session", async (
            ClaimsPrincipal principal,
            UserManager<AppUser> userManager) =>
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new UserDto(
                user.Id,
                user.UserName ?? "",
                user.FullName,
                user.Role,
                user.IsActive,
                user.CreatedAt));
        })
        .WithName("GetCurrentSession")
        .Produces<UserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        // POST /api/auth/change-password
        authGroup.MapPost("/change-password", async (
            ChangePasswordRequest request,
            ClaimsPrincipal principal,
            UserManager<AppUser> userManager) =>
        {
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Results.NotFound(new { message = "Pengguna tidak ditemukan." });
            }

            var result = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return Results.BadRequest(new { message = $"Gagal mengubah kata sandi: {errors}" });
            }

            return Results.Ok(new { message = "Kata sandi berhasil diubah." });
        })
        .WithName("ChangePassword")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound);

        // GET /api/users
        userGroup.MapGet("/", async (UserManager<AppUser> userManager) =>
        {
            var users = await userManager.Users
                .OrderBy(u => u.UserName)
                .Select(u => new UserDto(
                    u.Id,
                    u.UserName ?? "",
                    u.FullName,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt))
                .ToListAsync();

            return Results.Ok(users);
        })
        .WithName("GetUsers")
        .Produces<List<UserDto>>(StatusCodes.Status200OK);

        // POST /api/users
        userGroup.MapPost("/", async (
            CreateUserRequest request,
            UserManager<AppUser> userManager,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            HttpContext context) =>
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Results.BadRequest(new { message = "Username dan password wajib diisi." });
            }

            var existing = await userManager.FindByNameAsync(request.Username.Trim());
            if (existing != null)
            {
                return Results.Conflict(new { message = $"Username '{request.Username}' sudah digunakan." });
            }

            var role = request.Role == UserRoles.Admin ? UserRoles.Admin : UserRoles.Operator;
            var user = new AppUser
            {
                UserName = request.Username.Trim(),
                FullName = request.FullName.Trim(),
                Role = role,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return Results.BadRequest(new { message = $"Gagal membuat pengguna: {errors}" });
            }

            await userManager.AddToRoleAsync(user, role);

            await auditService.LogAsync(
                action: "buat",
                category: "pengguna",
                entityType: "pengguna",
                entityName: user.FullName,
                summary: $"Menambahkan pengguna baru: {user.FullName} ({user.UserName})",
                httpContext: context);

            return Results.Created($"/api/users/{user.Id}", new UserDto(
                user.Id,
                user.UserName,
                user.FullName,
                user.Role,
                user.IsActive,
                user.CreatedAt));
        })
        .WithName("CreateUser")
        .Produces<UserDto>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status409Conflict);

        // PUT /api/users/{id}
        userGroup.MapPut("/{id}", async (
            string id,
            UpdateUserRequest request,
            UserManager<AppUser> userManager,
            Bandrek.Server.Features.Audit.IAuditService auditService,
            HttpContext context) =>
        {
            var user = await userManager.FindByIdAsync(id);
            if (user == null)
            {
                return Results.NotFound(new { message = "Pengguna tidak ditemukan." });
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName.Trim();
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var newRole = request.Role == UserRoles.Admin ? UserRoles.Admin : UserRoles.Operator;
                if (user.Role != newRole)
                {
                    await userManager.RemoveFromRoleAsync(user, user.Role);
                    await userManager.AddToRoleAsync(user, newRole);
                    user.Role = newRole;
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(user);
                await userManager.ResetPasswordAsync(user, token, request.Password);
            }

            await userManager.UpdateAsync(user);

            await auditService.LogAsync(
                action: "ubah",
                category: "pengguna",
                entityType: "pengguna",
                entityName: user.FullName,
                summary: $"Memperbarui data pengguna: {user.FullName} ({user.UserName})",
                httpContext: context);

            return Results.Ok(new UserDto(
                user.Id,
                user.UserName ?? "",
                user.FullName,
                user.Role,
                user.IsActive,
                user.CreatedAt));
        })
        .WithName("UpdateUser")
        .Produces<UserDto>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}
