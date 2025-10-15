const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('chatia', 'chatia', 'chatia', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

async function testLanes() {
  try {
    const [tickets] = await sequelize.query(`
      SELECT
        t.id,
        t.status,
        t."fromMe",
        TO_CHAR(t."updatedAt", 'YYYY-MM-DD HH24:MI:SS') as updated_at,
        tt."tagId",
        tg.name as lane,
        tg."timeLane" as tempo_horas,
        tg."nextLaneId",
        CASE
          WHEN t.status != 'open' THEN 'Status não é open: ' || t.status
          WHEN t."fromMe" != true THEN 'fromMe não é true: ' || t."fromMe"
          WHEN tg."timeLane" IS NULL OR tg."timeLane" <= 0 THEN 'timeLane inválido: ' || COALESCE(tg."timeLane"::text, 'NULL')
          WHEN tg."nextLaneId" IS NULL THEN 'nextLaneId não configurado'
          WHEN t."updatedAt" >= (NOW() - INTERVAL '1 hour' * tg."timeLane") THEN 'Ainda não passou o tempo'
          ELSE 'PODE MOVER'
        END as verificacao
      FROM "Tickets" t
      JOIN "TicketTags" tt ON tt."ticketId" = t.id
      JOIN "Tags" tg ON tg.id = tt."tagId"
      WHERE t."companyId" = 1
      AND t.id NOT IN (43, 44)
      ORDER BY t.id DESC
      LIMIT 20;
    `);

    console.log('\n=== TICKETS COM TAGS ===\n');

    if (tickets.length === 0) {
      console.log('❌ Nenhum ticket encontrado com tags associadas (exceto os de teste 43 e 44)\n');
    } else {
      tickets.forEach(ticket => {
        console.log(`Ticket #${ticket.id}`);
        console.log(`  Status: ${ticket.status}`);
        console.log(`  FromMe: ${ticket.fromMe}`);
        console.log(`  UpdatedAt: ${ticket.updated_at}`);
        console.log(`  Lane Atual: ${ticket.lane} (ID: ${ticket.tagid})`);
        console.log(`  TimeLane: ${ticket.tempo_horas} horas`);
        console.log(`  NextLaneId: ${ticket.nextlaneid}`);
        console.log(`  Verificação: ${ticket.verificacao}`);
        console.log('---');
      });
    }

    // Verificar tickets de teste também
    const [testTickets] = await sequelize.query(`
      SELECT
        t.id,
        tt."tagId",
        tg.name as lane_atual
      FROM "Tickets" t
      JOIN "TicketTags" tt ON tt."ticketId" = t.id
      JOIN "Tags" tg ON tg.id = tt."tagId"
      WHERE t.id IN (43, 44)
      ORDER BY t.id;
    `);

    console.log('\n=== TICKETS DE TESTE ===\n');
    testTickets.forEach(ticket => {
      console.log(`Ticket #${ticket.id} - Lane: ${ticket.lane_atual} (Tag ID: ${ticket.tagid})`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

testLanes();
