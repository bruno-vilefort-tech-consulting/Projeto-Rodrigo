import { QueryInterface } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    console.log('[Migration] Starting normalization of existing contact numbers...');

    // 1. Criar backup da tabela Contacts
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS contacts_backup_20251014 AS
      SELECT * FROM "Contacts";
    `);
    console.log('[Migration] Backup created: contacts_backup_20251014');

    // 2. Criar coluna temporária para números normalizados
    await queryInterface.sequelize.query(`
      ALTER TABLE "Contacts" ADD COLUMN IF NOT EXISTS number_normalized VARCHAR(20);
    `);

    // 3. Normalizar números BR (código de país 55)
    // Regra: Se número tem 10-13 dígitos e não começa com +, adicionar +
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = '+' || REGEXP_REPLACE(number, '[^0-9]', '', 'g')
      WHERE LENGTH(REGEXP_REPLACE(number, '[^0-9]', '', 'g')) BETWEEN 10 AND 15
        AND number NOT LIKE '+%'
        AND "isGroup" = false;
    `);

    // 4. Para números que já começam com +, apenas remover formatação
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = '+' || REGEXP_REPLACE(number, '[^0-9]', '', 'g')
      WHERE number LIKE '+%'
        AND number_normalized IS NULL
        AND "isGroup" = false;
    `);

    // 5. Para grupos, manter número original
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = number
      WHERE "isGroup" = true
        AND number_normalized IS NULL;
    `);

    // 6. Validar duplicatas ANTES de aplicar normalização
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT number_normalized, "companyId", COUNT(*) as count
      FROM "Contacts"
      WHERE number_normalized IS NOT NULL
      GROUP BY number_normalized, "companyId"
      HAVING COUNT(*) > 1;
    `);

    if ((duplicates as any[]).length > 0) {
      console.error('[Migration] ❌ DUPLICATAS DETECTADAS:', duplicates);
      throw new Error('Duplicatas detectadas. Pausar migration e resolver manualmente.');
    }

    // 7. Se não houver duplicatas, aplicar normalização
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number = number_normalized
      WHERE number_normalized IS NOT NULL;
    `);

    // 8. Remover coluna temporária
    await queryInterface.sequelize.query(`
      ALTER TABLE "Contacts" DROP COLUMN IF EXISTS number_normalized;
    `);

    console.log('[Migration] ✅ Normalization completed successfully');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('[Migration Rollback] Restoring numbers from backup...');

    // Restaurar números originais do backup
    await queryInterface.sequelize.query(`
      UPDATE "Contacts" c
      SET number = b.number
      FROM contacts_backup_20251014 b
      WHERE c.id = b.id;
    `);

    // Opcional: Remover backup após rollback
    // await queryInterface.sequelize.query(`DROP TABLE IF EXISTS contacts_backup_20251014;`);

    console.log('[Migration Rollback] ✅ Numbers restored from backup');
  }
};
