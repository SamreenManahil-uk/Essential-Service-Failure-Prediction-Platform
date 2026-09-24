using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EssentialService.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace EssentialService.Api.Services;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) CreateToken(AppUser user)
    {
        var jwt = _configuration.GetSection("Jwt");

        var key = jwt["Key"]
            ?? throw new InvalidOperationException("JWT Key missing.");

        var issuer = jwt["Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer missing.");

        var audience = jwt["Audience"]
            ?? throw new InvalidOperationException("JWT Audience missing.");

        var expiryMinutes =
            int.TryParse(jwt["ExpiryMinutes"], out var minutes)
                ? minutes
                : 60;

        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()
            ),
            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email
            ),
            new Claim(
                ClaimTypes.Name,
                user.Name
            ),
            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return (
            new JwtSecurityTokenHandler().WriteToken(token),
            expiresAt
        );
    }
}
