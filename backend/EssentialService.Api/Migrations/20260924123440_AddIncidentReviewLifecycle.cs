using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EssentialService.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentReviewLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AcknowledgedAt",
                table: "Incidents",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AcknowledgedBy",
                table: "Incidents",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResolvedBy",
                table: "Incidents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcknowledgedAt",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "AcknowledgedBy",
                table: "Incidents");

            migrationBuilder.DropColumn(
                name: "ResolvedBy",
                table: "Incidents");
        }
    }
}
