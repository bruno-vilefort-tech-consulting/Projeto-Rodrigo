import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    console.log('[Migration] Adding unique constraint on (number, companyId)...');

    // 1. Verificar duplicatas ANTES de criar constraint
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT number, "companyId", COUNT(*) as count, ARRAY_AGG(id) as contact_ids
      FROM "Contacts"
      WHERE number IS NOT NULL
      GROUP BY number, "companyId"
      HAVING COUNT(*) > 1;
    `);

    if ((duplicates as any[]).length > 0) {
      console.error('[Migration] ❌ DUPLICATAS DETECTADAS:', duplicates);
      throw new Error(
        'Duplicatas detectadas. Execute migration de normalização primeiro (20251014110000) ' +
        'ou resolva duplicatas manualmente.'
      );
    }

    // 2. Remover constraint UNIQUE antiga (apenas 'number')
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "Contacts" DROP CONSTRAINT IF EXISTS "Contacts_number_key";
      `);
      console.log('[Migration] Old UNIQUE constraint on "number" removed');
    } catch (error) {
      console.warn('[Migration] No old constraint to remove');
    }

    // 3. Criar índice UNIQUE composto (number, companyId) com CONCURRENTLY
    // IMPORTANTE: CONCURRENTLY evita bloquear a tabela durante criação do índice
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_number_company
      ON "Contacts" (number, "companyId")
      WHERE number IS NOT NULL;
    `);

    console.log('[Migration] ✅ Unique constraint (number, companyId) created successfully');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('[Migration Rollback] Removing unique constraint...');

    // Remover índice composto
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_contacts_number_company;
    `);

    // Recriar constraint UNIQUE original (apenas 'number')
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_number_key" UNIQUE (number);
      `);
      console.log('[Migration Rollback] ✅ Original UNIQUE constraint on "number" restored');
    } catch (error) {
      console.warn('[Migration Rollback] Could not restore original constraint');
    }
  }
};
