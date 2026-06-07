using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JkuatHospitalApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingUserColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('Users', 'Phone') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [Phone] nvarchar(max) NOT NULL CONSTRAINT [DF_Users_Phone] DEFAULT '';
                END

                IF COL_LENGTH('Users', 'Age') IS NULL
                BEGIN
                    ALTER TABLE [Users] ADD [Age] int NOT NULL CONSTRAINT [DF_Users_Age] DEFAULT 0;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF COL_LENGTH('Users', 'Phone') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP CONSTRAINT [DF_Users_Phone];
                    ALTER TABLE [Users] DROP COLUMN [Phone];
                END

                IF COL_LENGTH('Users', 'Age') IS NOT NULL
                BEGIN
                    ALTER TABLE [Users] DROP CONSTRAINT [DF_Users_Age];
                    ALTER TABLE [Users] DROP COLUMN [Age];
                END
                """);
        }
    }
}
