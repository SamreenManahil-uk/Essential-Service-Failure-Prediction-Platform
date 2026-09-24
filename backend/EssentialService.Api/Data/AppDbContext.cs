using EssentialService.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EssentialService.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<SensorReading> SensorReadings => Set<SensorReading>();
    public DbSet<FailurePrediction> FailurePredictions => Set<FailurePrediction>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .HasIndex(user => user.Email)
            .IsUnique();
    }
}
