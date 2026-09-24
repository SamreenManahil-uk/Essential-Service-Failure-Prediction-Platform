using EssentialService.Api.Data;
using EssentialService.Api.DTOs;
using EssentialService.Api.Models;
using EssentialService.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssentialService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(
        AppDbContext context,
        JwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(
                "Name, email and password are required."
            );
        }

        if (request.Password.Length < 8)
        {
            return BadRequest(
                "Password must be at least 8 characters."
            );
        }

        var existingUser = await _context.Users
            .AnyAsync(u => u.Email == email);

        if (existingUser)
        {
            return Conflict(
                "A user with this email already exists."
            );
        }

        var user = new AppUser
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password
            ),
            Role = "Viewer",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var (token, expiresAt) =
            _jwtTokenService.CreateToken(user);

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null ||
            !BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash))
        {
            return Unauthorized(
                "Invalid email or password."
            );
        }

        var (token, expiresAt) =
            _jwtTokenService.CreateToken(user);

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        });
    }
}
