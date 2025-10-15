# 🔧 Troubleshooting: Kanban Não Está Movendo Tickets

## ✅ O Que Foi Testado e Funcionou

- ✅ **Cron Job**: Executando a cada 1 minuto
- ✅ **Lógica de Movimentação**: Funcionando perfeitamente
- ✅ **Tickets de Teste**: Movidos automaticamente (tickets #43 e #44)
- ✅ **Envio de Mensagens**: Funcionando
- ✅ **Socket.IO**: Notificações em tempo real funcionando

## ❌ Problema Atual

Os tickets **REAIS** não estão se movendo automaticamente, apenas os de **TESTE** moveram.

## 🔍 Condições Obrigatórias Para Movimentação

Para um ticket se mover automaticamente entre lanes, ele PRECISA atender **TODAS** estas condições **SIMULTANEAMENTE**:

### 1. Status = "open" ✓
```sql
t.status = 'open'
```
- ❌ **NÃO funciona** com status "pending", "closed", etc.
- ✅ **Apenas** tickets com status "open"

### 2. fromMe = true ✓
```sql
t.fromMe = true
```
- ✅ A **ÚLTIMA MENSAGEM** do ticket deve ter sido **ENVIADA PELA EMPRESA**
- ❌ Se o cliente respondeu por último, `fromMe = false` e o ticket **NÃO MOVE**
- 💡 Solução: A empresa precisa enviar uma mensagem para `fromMe` voltar a `true`

### 3. Tag com Configuração Válida ✓
```sql
tag.timeLane > 0 AND tag.nextLaneId IS NOT NULL
```
- ✅ `timeLane` deve ser maior que 0 (tempo em horas)
- ✅ `nextLaneId` deve estar configurado (ID da próxima lane)

### 4. Tempo Decorrido ✓
```sql
t.updatedAt < (NOW() - INTERVAL '1 hour' * tag.timeLane)
```
- ✅ Deve ter passado o tempo configurado desde a última atualização

## 🎯 Como Fazer Seus Tickets Se Moverem

### Opção 1: Criar Ticket de Teste Manualmente

```sql
-- 1. Criar ticket
INSERT INTO "Tickets" (
  "contactId",
  "whatsappId",
  "companyId",
  status,
  "fromMe",
  "isGroup",
  "updatedAt",
  "createdAt"
) VALUES (
  (SELECT id FROM "Contacts" WHERE "companyId" = 1 LIMIT 1),
  (SELECT id FROM "Whatsapps" WHERE "companyId" = 1 LIMIT 1),
  1,
  'open',          -- ← IMPORTANTE: status open
  true,            -- ← IMPORTANTE: fromMe true
  false,
  NOW() - INTERVAL '1 hour',  -- ← Já passou 1 hora
  NOW() - INTERVAL '1 hour'
) RETURNING id;

-- 2. Associar à primeira lane (substitua TICKET_ID e TAG_ID)
INSERT INTO "TicketTags" ("ticketId", "tagId", "createdAt", "updatedAt")
VALUES (TICKET_ID, 2, NOW(), NOW());

-- 3. Aguarde até 1 minuto (tempo do cron) e verifique
SELECT * FROM "TicketTags" WHERE "ticketId" = TICKET_ID;
```

### Opção 2: Usar Fluxo Normal do Sistema

1. **Abrir um ticket real** (via WhatsApp ou outro canal)
2. **Associar a tag/lane inicial** ao ticket no kanban
3. **IMPORTANTE**: A empresa deve **enviar uma mensagem** no ticket
   - Isso garante que `fromMe = true`
4. **Aguardar** o tempo configurado no `timeLane`
5. O sistema moverá automaticamente! ✨

## 🐛 Verificar Se Um Ticket Pode Ser Movido

Execute esta query para verificar qualquer ticket:

```sql
SELECT
  t.id,
  t.status,
  t."fromMe",
  t."updatedAt",
  tt."tagId",
  tg.name as lane,
  tg."timeLane",
  tg."nextLaneId",
  CASE
    WHEN t.status != 'open' THEN '❌ Status não é open: ' || t.status
    WHEN t."fromMe" != true THEN '❌ fromMe não é true'
    WHEN tg."timeLane" IS NULL OR tg."timeLane" <= 0 THEN '❌ timeLane inválido'
    WHEN tg."nextLaneId" IS NULL THEN '❌ nextLaneId não configurado'
    WHEN t."updatedAt" >= (NOW() - INTERVAL '1 hour' * tg."timeLane") THEN '⏰ Ainda não passou o tempo'
    ELSE '✅ PODE MOVER'
  END as verificacao
FROM "Tickets" t
LEFT JOIN "TicketTags" tt ON tt."ticketId" = t.id
LEFT JOIN "Tags" tg ON tg.id = tt."tagId"
WHERE t.id = SEU_TICKET_ID;
```

## 📊 Logs Adicionados

Os logs agora mostram detalhadamente o que está acontecendo:

```
[KANBAN] Iniciando verificação de movimentação de lanes
[KANBAN] Empresas com kanban ativo: 2
[KANBAN] Processando empresa 1
[KANBAN] Tickets encontrados para empresa 1: X
[KANBAN] Ticket 44 - TagID: 2 - TimeLane: 0.00278h - NextLaneId: 3
[KANBAN] Ticket 44 - UpdatedAt: ... - Limite: ... - Deve mover: true
[KANBAN] ✅ Ticket 44 movido da tag 2 para tag 3
```

Verifique os logs do backend para ver o que está acontecendo.

## ⚙️ Configuração Atual das Lanes

```
Tag 2 (Diguinho):   timeLane = 0.00278 horas (≈10 segundos)  → nextLaneId = 3
Tag 3 (Kelson 02):  timeLane = 0.00694 horas (≈25 segundos)  → nextLaneId = 4
Tag 4 (Teste 3):    timeLane = ? (sem próxima lane)
```

## 🚨 Problema Encontrado: "too many clients already"

O PostgreSQL está atingindo o limite de conexões. Isso pode estar impedindo o funcionamento correto.

### Solução:

1. **Reiniciar o backend** para limpar conexões:
   ```bash
   # Se estiver usando PM2:
   pm2 restart backend

   # Se estiver usando npm/node direto:
   # Ctrl+C no terminal e npm run dev:server novamente
   ```

2. **Verificar configuração do pool de conexões** em `src/database/index.ts`:
   - Certifique-se de que há um pool configurado adequadamente
   - Limite de conexões: 20-50 (dependendo do PostgreSQL)

3. **Verificar limite do PostgreSQL**:
   ```sql
   SHOW max_connections;
   -- Padrão é geralmente 100
   ```

## 📝 Próximos Passos

1. ✅ Reiniciar o backend
2. ✅ Criar um ticket de teste real (seguindo Opção 1 acima)
3. ✅ Verificar logs do backend
4. ✅ Verificar se o ticket move após 1 minuto

## 💡 Dica Final

Se quiser testar rapidamente, use um `timeLane` muito pequeno (ex: 0.001 horas = 3.6 segundos) e crie um ticket com `updatedAt` no passado.

```sql
-- Configurar lane com tempo mínimo para teste
UPDATE "Tags" SET "timeLane" = 0.001 WHERE id = 2;

-- Criar ticket com updatedAt de 1 hora atrás
INSERT INTO "Tickets" (...) VALUES (..., NOW() - INTERVAL '1 hour', ...);
```

Assim você verá o movimento em menos de 1 minuto!
