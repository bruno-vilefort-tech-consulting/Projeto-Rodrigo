import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: async (queryInterface: QueryInterface) => {
    // 1. Criar tipo ENUM para source
    await queryInterface.sequelize.query(`
      CREATE TYPE contact_source AS ENUM (
        'manual',
        'whatsapp_roster',
        'excel_import',
        'auto_created',
        'chat_import'
      );
    `);

    // 2. Adicionar coluna 'source' com default 'manual'
    await queryInterface.addColumn('Contacts', 'source', {
      type: 'contact_source',
      defaultValue: 'manual',
      allowNull: false
    });

    // 3. Adicionar coluna 'isInAgenda' com default true
    await queryInterface.addColumn('Contacts', 'isInAgenda', {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    console.log('✅ Migration: Added source and isInAgenda to Contacts');
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover colunas na ordem reversa
    await queryInterface.removeColumn('Contacts', 'isInAgenda');
    await queryInterface.removeColumn('Contacts', 'source');

    // Remover tipo ENUM
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS contact_source;`);

    console.log('✅ Rollback: Removed source and isInAgenda from Contacts');
  }
};
