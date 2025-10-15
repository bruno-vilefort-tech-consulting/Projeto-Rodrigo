#!/usr/bin/env node

/**
 * Script para limpar contatos fantasmas do banco de dados
 *
 * Contatos fantasmas são:
 * 1. Contatos auto_created que não estão na agenda (isInAgenda=false)
 * 2. Contatos com números inválidos (muito longos, padrões suspeitos)
 *
 * USO: node backend/scripts/clean-ghost-contacts.js [--dry-run] [--company-id=1]
 */

const { Sequelize, Op } = require('sequelize');
require('dotenv').config();

// Configuração do banco de dados
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
});

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const companyIdArg = args.find(arg => arg.startsWith('--company-id='));
const companyId = companyIdArg ? parseInt(companyIdArg.split('=')[1]) : 1;

console.log('🧹 Script de Limpeza de Contatos Fantasmas\n');
console.log(`Modo: ${dryRun ? '🔍 DRY-RUN (apenas visualização)' : '⚠️  EXECUÇÃO REAL'}`);
console.log(`Company ID: ${companyId}\n`);

async function cleanGhostContacts() {
  try {
    // 1. Contatos auto_created sem agenda
    const autoCreatedQuery = `
      SELECT id, name, number, source, "isInAgenda"
      FROM "Contacts"
      WHERE source = 'auto_created'
        AND "isInAgenda" = false
        AND "companyId" = :companyId
      ORDER BY "createdAt" DESC;
    `;

    const autoCreatedGhosts = await sequelize.query(autoCreatedQuery, {
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`\n📋 Contatos auto_created sem agenda: ${autoCreatedGhosts.length}`);
    if (autoCreatedGhosts.length > 0 && autoCreatedGhosts.length <= 10) {
      console.table(autoCreatedGhosts.map(c => ({
        ID: c.id,
        Nome: c.name?.substring(0, 30),
        Número: c.number?.substring(0, 20)
      })));
    }

    // 2. Contatos com números muito longos (>15 dígitos)
    const longNumbersQuery = `
      SELECT id, name, number, source
      FROM "Contacts"
      WHERE LENGTH(REGEXP_REPLACE(number, '[^0-9]', '', 'g')) > 15
        AND "companyId" = :companyId
      ORDER BY LENGTH(number) DESC;
    `;

    const longNumberGhosts = await sequelize.query(longNumbersQuery, {
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`\n📏 Contatos com números muito longos: ${longNumberGhosts.length}`);
    if (longNumberGhosts.length > 0 && longNumberGhosts.length <= 10) {
      console.table(longNumberGhosts.map(c => ({
        ID: c.id,
        Nome: c.name?.substring(0, 30),
        Número: c.number,
        Dígitos: c.number.replace(/[^0-9]/g, '').length
      })));
    }

    // 3. Contatos com padrões suspeitos
    const suspiciousQuery = `
      SELECT id, name, number, source
      FROM "Contacts"
      WHERE number ~ '^[+]?(555[0-4]|120[0-9]{3}|123456|999999)'
        AND "companyId" = :companyId
      ORDER BY "createdAt" DESC;
    `;

    const suspiciousGhosts = await sequelize.query(suspiciousQuery, {
      replacements: { companyId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`\n⚠️  Contatos com padrões suspeitos: ${suspiciousGhosts.length}`);
    if (suspiciousGhosts.length > 0 && suspiciousGhosts.length <= 10) {
      console.table(suspiciousGhosts.map(c => ({
        ID: c.id,
        Nome: c.name?.substring(0, 30),
        Número: c.number
      })));
    }

    // Coletar todos os IDs de contatos fantasmas
    const allGhostIds = [
      ...autoCreatedGhosts.map(c => c.id),
      ...longNumberGhosts.map(c => c.id),
      ...suspiciousGhosts.map(c => c.id)
    ];

    // Remover duplicatas
    const uniqueGhostIds = [...new Set(allGhostIds)];

    console.log(`\n📊 TOTAL de contatos fantasmas: ${uniqueGhostIds.length}`);

    if (uniqueGhostIds.length === 0) {
      console.log('\n✅ Nenhum contato fantasma encontrado!');
      return;
    }

    if (dryRun) {
      console.log('\n🔍 Modo DRY-RUN ativo. Nenhuma alteração será feita.');
      console.log('Para executar a limpeza real, execute:');
      console.log(`node backend/scripts/clean-ghost-contacts.js --company-id=${companyId}`);
      return;
    }

    // Confirmar antes de deletar
    console.log('\n⚠️  ATENÇÃO: Esta operação irá DELETAR os contatos acima!');
    console.log('Pressione Ctrl+C nos próximos 5 segundos para cancelar...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Deletar contatos fantasmas
    const deleteQuery = `
      DELETE FROM "Contacts"
      WHERE id IN (:ghostIds)
      RETURNING id;
    `;

    const deletedContacts = await sequelize.query(deleteQuery, {
      replacements: { ghostIds: uniqueGhostIds },
      type: sequelize.QueryTypes.DELETE
    });

    console.log(`\n✅ ${uniqueGhostIds.length} contatos fantasmas deletados com sucesso!`);

  } catch (error) {
    console.error('\n❌ Erro ao limpar contatos fantasmas:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar script
cleanGhostContacts()
  .then(() => {
    console.log('\n✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
