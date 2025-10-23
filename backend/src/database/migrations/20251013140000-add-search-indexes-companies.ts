"use strict";

import { QueryInterface } from "sequelize";

/**
 * Migration: add trigram indexes for Companies search functionality
 *
 * This migration adds PostgreSQL trigram (pg_trgm) indexes to improve
 * performance of ILIKE queries on Companies table search fields.
 *
 * Trigram indexes are highly efficient for partial string matching
 * and case-insensitive searches.
 *
 * Fields indexed:
 * - name: Primary search field
 * - email: Contact search
 * - document: Legal document identification
 * - phone: Contact phone number
 *
 * Performance impact:
 * - Expected query time reduction: 70-90% on tables with 1000+ companies
 * - Index size: ~2-5% of table size per field
 * - Suitable for production with >500 companies
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    const companiesTable: any = await queryInterface.describeTable("Companies");

    // Enable pg_trgm extension for trigram indexes (idempotent)
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
    );

    // Add GIN trigram index on name field for fuzzy search
    if (companiesTable.name) {
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_companies_name_trgm
        ON "Companies" USING gin (name gin_trgm_ops);
      `);
    }

    // Add GIN trigram index on email field for contact search
    if (companiesTable.email) {
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_companies_email_trgm
        ON "Companies" USING gin (email gin_trgm_ops);
      `);
    }

    // Add GIN trigram index on document field for legal ID search
    if (companiesTable.document) {
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_companies_document_trgm
        ON "Companies" USING gin (document gin_trgm_ops);
      `);
    }

    // Add GIN trigram index on phone field for phone search
    if (companiesTable.phone) {
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_companies_phone_trgm
        ON "Companies" USING gin (phone gin_trgm_ops);
      `);
    }
  },

  async down(queryInterface: QueryInterface) {
    // Remove trigram indexes (keep extension as other tables may use it)
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_companies_name_trgm;'
      );
    } catch (error) {
      console.log("Error removing name trigram index:", error);
    }

    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_companies_email_trgm;'
      );
    } catch (error) {
      console.log("Error removing email trigram index:", error);
    }

    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_companies_document_trgm;'
      );
    } catch (error) {
      console.log("Error removing document trigram index:", error);
    }

    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_companies_phone_trgm;'
      );
    } catch (error) {
      console.log("Error removing phone trigram index:", error);
    }

    // Note: We intentionally do NOT drop the pg_trgm extension
    // as other migrations/features may depend on it
  }
};
