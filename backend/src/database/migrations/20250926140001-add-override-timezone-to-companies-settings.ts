"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const COMPANIES_SETTINGS_TABLE = "CompaniesSettings";
    const table = await queryInterface.describeTable(COMPANIES_SETTINGS_TABLE);

    // Add overrideDefaultTimezone field to CompaniesSettings
    if (!table.overrideDefaultTimezone) {
      await queryInterface.addColumn(COMPANIES_SETTINGS_TABLE, "overrideDefaultTimezone", {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Controls if company uses its own timezone instead of default"
      });
    }
  },

  async down(queryInterface) {
    const COMPANIES_SETTINGS_TABLE = "CompaniesSettings";
    const table = await queryInterface.describeTable(COMPANIES_SETTINGS_TABLE);

    if (table.overrideDefaultTimezone) {
      try {
        await queryInterface.removeColumn(COMPANIES_SETTINGS_TABLE, "overrideDefaultTimezone");
      } catch (error) {
        console.log("Error removing overrideDefaultTimezone column:", error);
      }
    }
  }
};