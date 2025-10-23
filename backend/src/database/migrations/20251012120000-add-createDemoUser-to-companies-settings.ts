"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const COMPANIES_SETTINGS_TABLE = "CompaniesSettings";
    const table = await queryInterface.describeTable(COMPANIES_SETTINGS_TABLE);

    // Add createDemoUser field to CompaniesSettings
    if (!table.createDemoUser) {
      await queryInterface.addColumn(COMPANIES_SETTINGS_TABLE, "createDemoUser", {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "disabled",
        comment: "Controls automatic demo user creation: enabled or disabled"
      });
    }
  },

  async down(queryInterface) {
    const COMPANIES_SETTINGS_TABLE = "CompaniesSettings";
    const table = await queryInterface.describeTable(COMPANIES_SETTINGS_TABLE);

    if (table.createDemoUser) {
      try {
        await queryInterface.removeColumn(COMPANIES_SETTINGS_TABLE, "createDemoUser");
      } catch (error) {
        console.log("Error removing createDemoUser column:", error);
      }
    }
  }
};
