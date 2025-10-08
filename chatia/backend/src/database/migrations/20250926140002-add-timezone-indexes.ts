"use strict";

import { QueryInterface } from "sequelize";

/**
 * Migration: add indexes for timezone fields to improve performance
 * - Add index on Companies.timezone for efficient timezone-based queries
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const companiesTable: any = await queryInterface.describeTable("Companies");

    // Add index on timezone field for Companies table if field exists
    if (companiesTable.timezone) {
      await queryInterface.addIndex("Companies", ["timezone"], {
        name: "companies_timezone_idx"
      });
    }
  },

  async down(queryInterface: QueryInterface) {
    // Remove timezone index
    try {
      await queryInterface.removeIndex("Companies", "companies_timezone_idx");
    } catch (error) {
      console.log("Error removing timezone index:", error);
    }
  }
};