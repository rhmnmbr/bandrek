using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bandrek.Server.Data.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Bandrek.Server.Features.Auth;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateToken(AppUser user)
    {
        var secret = _config["Jwt:Secret"] ?? "BandrekSuperSecretSigningKeyForDevelopmentPurposes2026!";
        var issuer = _config["Jwt:Issuer"] ?? "BandrekServer";
        var audience = _config["Jwt:Audience"] ?? "BandrekDesktopClient";
        var expiryDays = _config.GetValue<int>("Jwt:ExpiryDays", 30);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Role, user.Role),
            new(ClaimTypes.GivenName, user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
