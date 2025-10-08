"use strict";

import { QueryInterface, DataTypes } from "sequelize";

/**
 * Migration: add timezone fields for timezone management system
 * - Add optional timezone column to Companies table
 * - Add defaultTimezone setting in Settings table (global configuration for super admin)
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const companiesTable: any = await queryInterface.describeTable("Companies");
    const settingsTable: any = await queryInterface.describeTable("Settings");

    // Add timezone field to Companies table
    if (!companiesTable.timezone) {
      await queryInterface.addColumn("Companies", "timezone", {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Company specific timezone (e.g., America/Sao_Paulo, America/New_York)"
      });
    }

    // Check if defaultTimezone setting already exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM "Settings" WHERE key = 'defaultTimezone'
    `) as any[];

    // Insert defaultTimezone setting if it doesn't exist
    if ((results[0] as any).count === '0') {
      await queryInterface.sequelize.query(`
        INSERT INTO "Settings" (key, value, "companyId", "createdAt", "updatedAt")
        VALUES ('defaultTimezone', 'America/Sao_Paulo', NULL, NOW(), NOW())
      `);
    }
  },

  async down(queryInterface: QueryInterface) {
    const companiesTable: any = await queryInterface.describeTable("Companies");

    // Remove timezone field from Companies
    if (companiesTable.timezone) {
      await queryInterface.removeColumn("Companies", "timezone");
    }

    // Remove defaultTimezone setting
    await queryInterface.sequelize.query(`
      DELETE FROM "Settings" WHERE key = 'defaultTimezone'
    `);
  }
};