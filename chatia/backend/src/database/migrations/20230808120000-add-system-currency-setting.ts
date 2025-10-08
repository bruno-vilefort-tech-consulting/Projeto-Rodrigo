"use strict";

const SETTINGS_TABLE = "Settings";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se já existe uma configuração systemCurrency
    const existingCurrency = await queryInterface.sequelize.query(
      `SELECT id FROM "${SETTINGS_TABLE}" WHERE key = 'systemCurrency' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingCurrency.length === 0) {
      // Inserir configuração padrão do sistema de moeda (BRL)
      await queryInterface.sequelize.query(
        `INSERT INTO "${SETTINGS_TABLE}" (key, value, "createdAt", "updatedAt", "companyId") VALUES (?, ?, NOW(), NOW(), NULL)`,
        {
          replacements: [
            'systemCurrency',
            JSON.stringify({
              code: 'BRL',
              symbol: 'R$',
              locale: 'pt-BR'
            })
          ]
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover configuração systemCurrency
    await queryInterface.sequelize.query(
      `DELETE FROM "${SETTINGS_TABLE}" WHERE key = 'systemCurrency'`
    );
  }
};