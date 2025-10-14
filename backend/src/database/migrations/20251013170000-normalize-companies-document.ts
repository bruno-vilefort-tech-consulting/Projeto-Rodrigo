"use strict";

import { QueryInterface } from "sequelize";

/**
 * Migration: Normalize Companies.document field
 *
 * This migration prepares the document field for UNIQUE constraint by:
 * 1. Identifying and logging duplicate documents
 * 2. Removing duplicate records (keeping oldest by id)
 * 3. Converting empty strings to NULL for semantic correctness
 * 4. Validating data integrity before UNIQUE constraint application
 *
 * IMPORTANT: This migration MUST be executed BEFORE
 * 20251013170001-add-unique-constraint-companies-document.ts
 *
 * Data Safety:
 * - Non-destructive for unique documents (no data loss)
 * - Destructive for duplicates (keeps oldest record, removes others)
 * - Reviewable: Logs all duplicates found and actions taken
 * - Idempotent: Can be executed multiple times safely
 *
 * Rollback Strategy:
 * - Converts NULL back to empty strings (original behavior)
 * - Does NOT restore deleted duplicates (backup required)
 */
module.exports = {
  async up(queryInterface: QueryInterface) {
    console.log('[Migration UP] Starting Companies.document normalization...');

    // Step 1: Check if table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('Companies')) {
      console.log('[Migration UP] Companies table not found, skipping...');
      return;
    }

    // Step 2: Identify duplicates (non-empty documents only)
    console.log('[Migration UP] Scanning for duplicate documents...');
    const [duplicates]: any = await queryInterface.sequelize.query(`
      SELECT document, COUNT(*) as count, ARRAY_AGG(id ORDER BY id) as ids
      FROM "Companies"
      WHERE document IS NOT NULL AND document != '' AND TRIM(document) != ''
      GROUP BY document
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC;
    `);

    if (duplicates.length > 0) {
      console.log(`[Migration UP] Found ${duplicates.length} duplicate document(s):`);

      // Log detailed information about duplicates
      for (const dup of duplicates) {
        console.log(`  - Document: "${dup.document}" | Count: ${dup.count} | IDs: [${dup.ids.join(', ')}]`);
      }

      // Step 3: Remove duplicates (keep record with smallest id)
      console.log('[Migration UP] Removing duplicate records (keeping oldest by ID)...');

      for (const dup of duplicates) {
        const idsArray = dup.ids;
        const idsToDelete = idsArray.slice(1); // Remove first element (smallest id)

        if (idsToDelete.length > 0) {
          // Get company names before deletion (for logging)
          const [companiesToDelete]: any = await queryInterface.sequelize.query(`
            SELECT id, name, document, "createdAt"
            FROM "Companies"
            WHERE id = ANY(ARRAY[${idsToDelete.join(',')}]);
          `);

          // Log companies that will be deleted
          console.log(`  Deleting duplicates for document "${dup.document}":`);
          companiesToDelete.forEach((company: any) => {
            console.log(`    - ID: ${company.id} | Name: "${company.name}" | Created: ${company.createdAt}`);
          });

          // Delete duplicate records
          await queryInterface.sequelize.query(`
            DELETE FROM "Companies"
            WHERE id = ANY(ARRAY[${idsToDelete.join(',')}]);
          `);

          console.log(`  Successfully removed ${idsToDelete.length} duplicate(s)`);
        }
      }

      console.log('[Migration UP] Duplicate removal completed.');
    } else {
      console.log('[Migration UP] No duplicate documents found. Proceeding to normalization...');
    }

    // Step 4: Convert empty strings and whitespace-only to NULL
    console.log('[Migration UP] Converting empty strings to NULL...');
    const [updateResult]: any = await queryInterface.sequelize.query(`
      UPDATE "Companies"
      SET document = NULL
      WHERE document = '' OR document IS NULL OR TRIM(document) = ''
      RETURNING id;
    `);

    console.log(`[Migration UP] Normalized ${updateResult.length} record(s) (empty → NULL)`);

    // Step 5: Validate data integrity
    console.log('[Migration UP] Validating data integrity...');
    const [remainingDuplicates]: any = await queryInterface.sequelize.query(`
      SELECT document, COUNT(*) as count
      FROM "Companies"
      WHERE document IS NOT NULL
      GROUP BY document
      HAVING COUNT(*) > 1;
    `);

    if (remainingDuplicates.length > 0) {
      console.error('[Migration UP] ERROR: Duplicates still exist after cleanup:');
      remainingDuplicates.forEach((dup: any) => {
        console.error(`  - Document: "${dup.document}" | Count: ${dup.count}`);
      });
      throw new Error(
        `Data integrity check failed: ${remainingDuplicates.length} duplicate(s) still exist. ` +
        `Manual intervention required before applying UNIQUE constraint.`
      );
    }

    // Step 6: Final statistics
    const [stats]: any = await queryInterface.sequelize.query(`
      SELECT
        COUNT(*) as total_companies,
        COUNT(document) as companies_with_document,
        COUNT(*) - COUNT(document) as companies_without_document
      FROM "Companies";
    `);

    console.log('[Migration UP] Final statistics:');
    console.log(`  - Total companies: ${stats[0].total_companies}`);
    console.log(`  - With document: ${stats[0].companies_with_document}`);
    console.log(`  - Without document (NULL): ${stats[0].companies_without_document}`);
    console.log('[Migration UP] Normalization completed successfully.');
  },

  async down(queryInterface: QueryInterface) {
    console.log('[Migration DOWN] Rolling back Companies.document normalization...');

    // Check if table exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('Companies')) {
      console.log('[Migration DOWN] Companies table not found, skipping...');
      return;
    }

    // Revert NULL values back to empty strings (original behavior)
    console.log('[Migration DOWN] Converting NULL back to empty strings...');
    const [updateResult]: any = await queryInterface.sequelize.query(`
      UPDATE "Companies"
      SET document = ''
      WHERE document IS NULL
      RETURNING id;
    `);

    console.log(`[Migration DOWN] Reverted ${updateResult.length} record(s) (NULL → empty string)`);

    // NOTE: Deleted duplicate records CANNOT be restored automatically
    // You must restore from backup if rollback of deletions is required
    console.log('[Migration DOWN] IMPORTANT: Deleted duplicates were NOT restored.');
    console.log('[Migration DOWN] If you need to restore deleted records, use database backup.');

    console.log('[Migration DOWN] Rollback completed.');
  }
};
