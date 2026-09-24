using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EssentialService.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSensorReadingForAI4I : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Vibration",
                table: "SensorReadings",
                newName: "Torque");

            migrationBuilder.RenameColumn(
                name: "Temperature",
                table: "SensorReadings",
                newName: "ToolWear");

            migrationBuilder.RenameColumn(
                name: "Pressure",
                table: "SensorReadings",
                newName: "RotationalSpeed");

            migrationBuilder.RenameColumn(
                name: "Load",
                table: "SensorReadings",
                newName: "ProcessTemperature");

            migrationBuilder.AddColumn<double>(
                name: "AirTemperature",
                table: "SensorReadings",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "MachineType",
                table: "SensorReadings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AirTemperature",
                table: "SensorReadings");

            migrationBuilder.DropColumn(
                name: "MachineType",
                table: "SensorReadings");

            migrationBuilder.RenameColumn(
                name: "Torque",
                table: "SensorReadings",
                newName: "Vibration");

            migrationBuilder.RenameColumn(
                name: "ToolWear",
                table: "SensorReadings",
                newName: "Temperature");

            migrationBuilder.RenameColumn(
                name: "RotationalSpeed",
                table: "SensorReadings",
                newName: "Pressure");

            migrationBuilder.RenameColumn(
                name: "ProcessTemperature",
                table: "SensorReadings",
                newName: "Load");
        }
    }
}
