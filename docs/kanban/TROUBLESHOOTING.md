# Kanban V2 Troubleshooting Guide

## Overview

Guia completo de troubleshooting para DevOps e engenheiros resolverem os problemas mais comuns do Kanban V2.

**Target Audience:** DevOps, Backend Engineers, Support Level 2+

---

## Top 10 Problemas

### 1. Socket.IO Não Atualiza

**Sintomas:**
- Mudanças não aparecem em tempo real
- Indicador de conexão vermelho
- Logs mostram "Socket disconnect"
- Usuários precisam recarregar página manualmente

**Diagnóstico:**

```bash
# 1. Verificar status do Socket.IO server
pm2 logs | grep -i "socket" | tail -50

# 2. Verificar conexões ativas
pm2 monit
# Procurar por socket connections no processo

# 3. Testar conexão manualmente
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:8080/workspace-123', {
  transports: ['websocket']
});
socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
"

# 4. Verificar namespace correto
grep -r "io(.*workspace" frontend/src/

# 5. Verificar backend namespace
grep -r "io.of.*workspace" backend/src/
```

**Possíveis Causas:**

1. **Namespace mismatch** (frontend vs backend)
2. Load balancer não configurado para WebSockets
3. Firewall bloqueando conexões
4. Timeout muito baixo
5. Problema de CORS

**Soluções:**

```bash
# Solução 1: Fix namespace mismatch
bash scripts/fix-socket-namespace.sh

# Solução 2: Verificar/configurar NGINX para WebSocket
cat > /etc/nginx/sites-available/chatia <<'EOF'
upstream socket_nodes {
    ip_hash;
    server 127.0.0.1:8080;
}

server {
    location /socket.io/ {
        proxy_pass http://socket_nodes;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF
nginx -t && systemctl reload nginx

# Solução 3: Aumentar timeout no Socket.IO server
# backend/src/socket/index.js
# io.set('heartbeat timeout', 60000);
# io.set('heartbeat interval', 25000);

# Solução 4: Verificar CORS
# backend/src/socket/index.js
# cors: {
#   origin: process.env.FRONTEND_URL,
#   credentials: true
# }

# Solução 5: Restart Socket.IO process
pm2 restart socket-server
```

**Validação:**

```bash
# Verificar que conexões estão estáveis
watch -n 2 'pm2 logs | grep "Socket connect" | tail -10'

# Monitorar disconnect rate
curl -s http://localhost:9090/metrics | grep socketio_disconnect

# Testar com múltiplos clientes
for i in {1..10}; do
  node test-socket-client.js &
done
wait
```

**Logs Relevantes:**

```
[ERROR] Socket.IO connection failed: namespace mismatch
[WARN] WebSocket upgrade failed
[ERROR] CORS error: origin not allowed
[INFO] Socket connected: workspace-123, userId: 456
```

---

### 2. Drag and Drop Não Funciona

**Sintomas:**
- Tickets não movem ao arrastar
- Movimento cancela no meio
- Ticket volta para posição original
- Nenhum erro visível no frontend

**Diagnóstico:**

```bash
# 1. Verificar logs do browser
# Console: verificar erros JavaScript
# Network: verificar se PUT/PATCH está sendo enviado

# 2. Verificar logs do backend
pm2 logs | grep -E "(ticket.*update|kanban.*move)" | tail -50

# 3. Verificar database constraints
psql -U postgres -d chatia_db -c "
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name
FROM pg_constraint
WHERE conrelid IN ('Tickets'::regclass, 'Lanes'::regclass);
"

# 4. Testar endpoint manualmente
curl -X PUT http://localhost:8080/api/tickets/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "kanbanLane": "lane-456",
    "kanbanOrder": 1
  }'

# 5. Verificar permissões
psql -U postgres -d chatia_db -c "
SELECT
  u.id,
  u.email,
  u.profile
FROM Users u
WHERE u.id = 'USER_ID';
"
```

**Possíveis Causas:**

1. **Permissões insuficientes** (user não pode mover tickets)
2. **Constraint violation** (lane inválida, ordem duplicada)
3. **Race condition** (múltiplos usuários movendo ao mesmo tempo)
4. **Frontend não enviando request**
5. **Timeout na requisição**

**Soluções:**

```bash
# Solução 1: Verificar/corrigir permissões
psql -U postgres -d chatia_db -c "
-- Verificar profile do usuário
SELECT profile FROM Users WHERE id = 'USER_ID';

-- Se necessário, atualizar permissão
UPDATE Users
SET profile = 'admin'
WHERE id = 'USER_ID' AND profile IN ('user', 'agent');
"

# Solução 2: Fix constraint violations
psql -U postgres -d chatia_db -c "
-- Remover orders duplicadas
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY companyId, kanbanLane ORDER BY kanbanOrder, updatedAt) - 1 as new_order
  FROM Tickets
  WHERE kanbanLane IS NOT NULL
)
UPDATE Tickets t
SET kanbanOrder = r.new_order
FROM ranked r
WHERE t.id = r.id;
"

# Solução 3: Adicionar index para performance
psql -U postgres -d chatia_db -c "
CREATE INDEX IF NOT EXISTS idx_tickets_kanban_order
ON Tickets(companyId, kanbanLane, kanbanOrder);
"

# Solução 4: Aumentar timeout
# frontend/src/services/api.js
# axios.defaults.timeout = 30000; // 30 seconds

# Solução 5: Implementar retry logic
# frontend/src/hooks/useKanban.js
# const updateTicket = async (ticketId, data, retries = 3) => {
#   try {
#     await api.put(`/tickets/${ticketId}`, data);
#   } catch (error) {
#     if (retries > 0) {
#       await new Promise(r => setTimeout(r, 1000));
#       return updateTicket(ticketId, data, retries - 1);
#     }
#     throw error;
#   }
# };
```

**Validação:**

```bash
# Testar DnD com múltiplos usuários
# User 1: Move ticket para lane A
# User 2: Move mesmo ticket para lane B
# Verificar que não há conflito

# Verificar logs de sucesso
pm2 logs | grep "Ticket.*updated.*lane" | tail -20

# Verificar métricas
curl -s http://localhost:9090/metrics | grep kanban_dnd
```

**Logs Relevantes:**

```
[ERROR] Failed to update ticket: foreign key constraint violation
[WARN] Ticket update timeout after 10s
[ERROR] User 123 does not have permission to move ticket 456
[INFO] Ticket 789 moved from todo to doing by user 123
```

---

### 3. Tags Não Aparecem

**Sintomas:**
- Botão "Etiquetas" não visível
- Tags não carregam na modal
- Tags salvam mas não aparecem no ticket
- Error 404 ao buscar tags

**Diagnóstico:**

```bash
# 1. Verificar se feature está habilitada
psql -U postgres -d chatia_db -c "
SELECT
  id,
  name,
  settings->>'kanbanV2Enabled' as v2_enabled
FROM Companies
WHERE id = 'COMPANY_ID';
"

# 2. Verificar se tabela Tags existe
psql -U postgres -d chatia_db -c "
SELECT tablename
FROM pg_tables
WHERE tablename IN ('Tags', 'TicketTags');
"

# 3. Verificar se há tags criadas
psql -U postgres -d chatia_db -c "
SELECT COUNT(*) as total_tags
FROM Tags
WHERE companyId = 'COMPANY_ID';
"

# 4. Testar endpoint de tags
curl -X GET http://localhost:8080/api/tags?companyId=COMPANY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Verificar logs de erro
pm2 logs | grep -i "tag" | grep -i "error" | tail -20
```

**Possíveis Causas:**

1. **Feature flag desabilitada**
2. **Tabelas não foram criadas** (migration não rodou)
3. **Permissões de banco** (user não pode ler Tags)
4. **Rota não configurada** no backend
5. **CORS issue** (frontend não pode acessar API)

**Soluções:**

```bash
# Solução 1: Habilitar feature flag
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'true'
)
WHERE id = 'COMPANY_ID';
"

# Solução 2: Rodar migrations
cd backend
npm run migration:run
# Ou manualmente:
psql -U postgres -d chatia_db -f database/migrations/20250101000000-create-tags.js

# Solução 3: Criar tabelas manualmente se necessário
psql -U postgres -d chatia_db <<'EOF'
CREATE TABLE IF NOT EXISTS "Tags" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(255) NOT NULL,
  "color" VARCHAR(7) NOT NULL,
  "companyId" UUID NOT NULL REFERENCES "Companies"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("name", "companyId")
);

CREATE TABLE IF NOT EXISTS "TicketTags" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "ticketId" UUID NOT NULL REFERENCES "Tickets"("id") ON DELETE CASCADE,
  "tagId" UUID NOT NULL REFERENCES "Tags"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("ticketId", "tagId")
);

CREATE INDEX idx_tags_company ON "Tags"("companyId");
CREATE INDEX idx_ticket_tags_ticket ON "TicketTags"("ticketId");
CREATE INDEX idx_ticket_tags_tag ON "TicketTags"("tagId");
EOF

# Solução 4: Verificar rotas no backend
grep -r "router.*tag" backend/src/routes/

# Se não existir, adicionar:
# backend/src/routes/tagRoutes.js
# router.get('/tags', TagController.index);
# router.post('/tags', TagController.store);
# etc.

# Solução 5: Restart backend
pm2 restart backend
```

**Validação:**

```bash
# Criar tag de teste
curl -X POST http://localhost:8080/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Tag",
    "color": "#FF0000",
    "companyId": "COMPANY_ID"
  }'

# Verificar que tag foi criada
psql -U postgres -d chatia_db -c "
SELECT * FROM Tags WHERE name = 'Test Tag';
"

# Associar tag a ticket
curl -X POST http://localhost:8080/api/tickets/TICKET_ID/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tagId": "TAG_ID"}'

# Verificar associação
psql -U postgres -d chatia_db -c "
SELECT * FROM TicketTags WHERE ticketId = 'TICKET_ID';
"
```

**Logs Relevantes:**

```
[ERROR] Table "Tags" does not exist
[ERROR] Cannot read property 'kanbanV2Enabled' of null
[WARN] No tags found for company COMPANY_ID
[INFO] Created tag "Urgent" for company COMPANY_ID
```

---

### 4. Performance Lenta

**Sintomas:**
- Kanban board leva > 5s para carregar
- Drag and drop tem delay visível (> 500ms)
- CPU alta no servidor
- Database queries lentas

**Diagnóstico:**

```bash
# 1. Verificar quantidade de tickets
psql -U postgres -d chatia_db -c "
SELECT
  c.name,
  COUNT(t.id) as ticket_count
FROM Companies c
LEFT JOIN Tickets t ON t.companyId = c.id
WHERE c.id = 'COMPANY_ID'
GROUP BY c.name;
"

# 2. Identificar queries lentas
psql -U postgres -d chatia_db -c "
SELECT
  substring(query, 1, 100) as query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%Ticket%' OR query LIKE '%Tag%'
ORDER BY mean_time DESC
LIMIT 10;
"

# 3. Verificar indexes
psql -U postgres -d chatia_db -c "
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('Tickets', 'Tags', 'TicketTags')
ORDER BY tablename, indexname;
"

# 4. Verificar CPU e memória
pm2 monit

# 5. Analisar query plan
psql -U postgres -d chatia_db -c "
EXPLAIN ANALYZE
SELECT t.*, array_agg(tg.*) as tags
FROM Tickets t
LEFT JOIN TicketTags tt ON tt.ticketId = t.id
LEFT JOIN Tags tg ON tg.id = tt.tagId
WHERE t.companyId = 'COMPANY_ID'
GROUP BY t.id;
"
```

**Possíveis Causas:**

1. **Faltam indexes** em colunas críticas
2. **N+1 query problem** (busca tags para cada ticket)
3. **Muitos tickets** carregados de uma vez
4. **Memory leak** no frontend
5. **Queries não otimizadas**

**Soluções:**

```bash
# Solução 1: Criar indexes essenciais
psql -U postgres -d chatia_db <<'EOF'
-- Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_company_lane
ON Tickets(companyId, kanbanLane);

CREATE INDEX IF NOT EXISTS idx_tickets_company_lane_order
ON Tickets(companyId, kanbanLane, kanbanOrder);

CREATE INDEX IF NOT EXISTS idx_tickets_updated_at
ON Tickets(updatedAt DESC);

-- Tags
CREATE INDEX IF NOT EXISTS idx_tags_company
ON Tags(companyId);

CREATE INDEX IF NOT EXISTS idx_tags_name_company
ON Tags(companyId, name);

-- TicketTags
CREATE INDEX IF NOT EXISTS idx_ticket_tags_ticket
ON TicketTags(ticketId);

CREATE INDEX IF NOT EXISTS idx_ticket_tags_tag
ON TicketTags(tagId);

-- Analyze tables
ANALYZE Tickets;
ANALYZE Tags;
ANALYZE TicketTags;
EOF

# Solução 2: Otimizar query com JOIN ao invés de N+1
# backend/src/controllers/TicketController.js
# const tickets = await Ticket.findAll({
#   where: { companyId },
#   include: [
#     {
#       model: Tag,
#       through: { attributes: [] }, // Exclude junction table
#       attributes: ['id', 'name', 'color']
#     }
#   ],
#   order: [['kanbanOrder', 'ASC']]
# });

# Solução 3: Implementar paginação
# GET /api/tickets?page=1&limit=50

# Solução 4: Adicionar cache Redis
# backend/src/services/CacheService.js
# const cacheKey = `tickets:${companyId}`;
# const cached = await redis.get(cacheKey);
# if (cached) return JSON.parse(cached);
# const tickets = await fetchTickets(companyId);
# await redis.setex(cacheKey, 300, JSON.stringify(tickets));

# Solução 5: Lazy loading no frontend
# Carregar apenas tickets visíveis no viewport
# Implementar virtual scrolling

# Solução 6: Vacuum e Analyze
psql -U postgres -d chatia_db -c "
VACUUM ANALYZE Tickets;
VACUUM ANALYZE Tags;
VACUUM ANALYZE TicketTags;
"
```

**Validação:**

```bash
# Benchmark antes e depois
time curl -s http://localhost:8080/api/tickets?companyId=COMPANY_ID > /dev/null

# Verificar query performance
psql -U postgres -d chatia_db -c "
SELECT
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
WHERE query LIKE '%Ticket%'
ORDER BY mean_time DESC
LIMIT 5;
"

# Verificar cache hit ratio
redis-cli INFO stats | grep keyspace_hits

# Verificar tamanho da resposta
curl -w "%{size_download} bytes\n" -o /dev/null -s \
  http://localhost:8080/api/tickets?companyId=COMPANY_ID
```

**Logs Relevantes:**

```
[WARN] Query took 3456ms: SELECT * FROM Tickets...
[WARN] High memory usage: 87%
[INFO] Cache hit for tickets:COMPANY_ID
[WARN] Slow query detected: mean_time > 1000ms
```

---

### 5. Erro 500 ao Criar Tag

**Sintomas:**
- POST /tags retorna 500
- Tag não é criada
- Log mostra "constraint violation" ou "null value"

**Diagnóstico:**

```bash
# 1. Verificar logs detalhados
pm2 logs | grep -A 10 "POST /tags" | grep -i error

# 2. Tentar criar manualmente
psql -U postgres -d chatia_db -c "
INSERT INTO Tags (name, color, companyId)
VALUES ('Test', '#FF0000', 'COMPANY_ID');
"

# 3. Verificar constraints
psql -U postgres -d chatia_db -c "
SELECT
  conname,
  contype,
  pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'Tags'::regclass;
"

# 4. Verificar se companyId existe
psql -U postgres -d chatia_db -c "
SELECT id, name FROM Companies WHERE id = 'COMPANY_ID';
"
```

**Possíveis Causas:**

1. **Nome duplicado** (constraint UNIQUE violation)
2. **CompanyId inválido** (foreign key violation)
3. **Color inválido** (não é formato hex)
4. **Campos obrigatórios faltando** (NULL violation)
5. **Permissões de usuário**

**Soluções:**

```bash
# Solução 1: Verificar duplicatas antes de inserir
# backend/src/controllers/TagController.js
# const existing = await Tag.findOne({
#   where: { name, companyId }
# });
# if (existing) {
#   return res.status(409).json({ error: 'Tag already exists' });
# }

# Solução 2: Validar input
# backend/src/validators/tagValidator.js
# const tagSchema = Joi.object({
#   name: Joi.string().min(1).max(50).required(),
#   color: Joi.string().regex(/^#[0-9A-F]{6}$/i).required(),
#   companyId: Joi.string().uuid().required()
# });

# Solução 3: Adicionar try-catch detalhado
# try {
#   const tag = await Tag.create({ name, color, companyId });
#   return res.json(tag);
# } catch (error) {
#   if (error.name === 'SequelizeUniqueConstraintError') {
#     return res.status(409).json({ error: 'Duplicate tag name' });
#   }
#   if (error.name === 'SequelizeForeignKeyConstraintError') {
#     return res.status(400).json({ error: 'Invalid companyId' });
#   }
#   throw error;
# }

# Solução 4: Remover duplicatas existentes
psql -U postgres -d chatia_db <<'EOF'
-- Identificar duplicatas
SELECT name, companyId, COUNT(*)
FROM Tags
GROUP BY name, companyId
HAVING COUNT(*) > 1;

-- Manter apenas a mais recente
DELETE FROM Tags
WHERE id NOT IN (
  SELECT MAX(id)
  FROM Tags
  GROUP BY name, companyId
);
EOF
```

**Validação:**

```bash
# Testar criação
curl -X POST http://localhost:8080/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Bug",
    "color": "#FF0000",
    "companyId": "COMPANY_ID"
  }'
# Expected: 201 Created

# Testar duplicata (deve retornar 409)
curl -X POST http://localhost:8080/api/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Bug",
    "color": "#0000FF",
    "companyId": "COMPANY_ID"
  }'
# Expected: 409 Conflict
```

---

### 6. Tags Não Sincronizam Entre Usuários

**Sintomas:**
- User A cria tag, User B não vê
- Tags aparecem após reload
- Socket.IO conectado mas não sincroniza tags

**Diagnóstico:**

```bash
# 1. Verificar se evento Socket está sendo emitido
pm2 logs | grep -E "(tag.*created|tag.*updated|socket.*emit)" | tail -20

# 2. Verificar se frontend está escutando evento correto
grep -r "socket.on.*tag" frontend/src/

# 3. Testar emissão manual
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:8080/workspace-COMPANY_ID');
socket.on('tag:created', (data) => console.log('Received:', data));
setTimeout(() => socket.disconnect(), 5000);
"

# 4. Verificar room do Socket.IO
# Backend deve usar: io.to(`company-${companyId}`).emit(...)
grep -r "io.to.*company" backend/src/
```

**Possíveis Causas:**

1. **Backend não emite evento** Socket após criar tag
2. **Frontend não escuta evento** correto
3. **Room incorreta** no Socket.IO
4. **Usuários em namespaces diferentes**

**Soluções:**

```javascript
// Solução 1: Emitir evento no backend após criar tag
// backend/src/controllers/TagController.js
async store(req, res) {
  const { name, color, companyId } = req.body;
  const tag = await Tag.create({ name, color, companyId });

  // Emitir para todos os usuários da company
  const socketIO = req.app.get('io');
  socketIO
    .of(`/workspace-${companyId}`)
    .emit('tag:created', tag);

  return res.status(201).json(tag);
}

// Solução 2: Escutar evento no frontend
// frontend/src/hooks/useKanban.js
useEffect(() => {
  const handleTagCreated = (tag) => {
    setTags(prev => [...prev, tag]);
  };

  socket.on('tag:created', handleTagCreated);
  socket.on('tag:updated', handleTagUpdated);
  socket.on('tag:deleted', handleTagDeleted);

  return () => {
    socket.off('tag:created', handleTagCreated);
    socket.off('tag:updated', handleTagUpdated);
    socket.off('tag:deleted', handleTagDeleted);
  };
}, [socket]);

// Solução 3: Garantir que usuários estão na mesma room
// backend/src/socket/index.js
io.of(/^\/workspace-\d+$/).on('connection', (socket) => {
  const namespace = socket.nsp.name;
  const companyId = namespace.split('-')[1];

  // Join na room da company
  socket.join(`company-${companyId}`);

  socket.on('disconnect', () => {
    socket.leave(`company-${companyId}`);
  });
});
```

**Validação:**

```bash
# Teste com 2 navegadores
# Browser 1: User A cria tag
# Browser 2: User B deve ver tag aparecer sem reload

# Verificar logs
pm2 logs | grep "tag:created"
# Expected: "Emitted tag:created to company-123"
```

---

### 7. Memory Leak no Frontend

**Sintomas:**
- Navegador fica lento após alguns minutos
- Tab usa > 500MB de RAM
- EventListeners não são removidos
- Garbage collector não limpa objetos

**Diagnóstico:**

```javascript
// Chrome DevTools > Memory > Take Heap Snapshot

// 1. Abrir Kanban board
// 2. Take snapshot 1
// 3. Usar o sistema por 5 minutos (DnD, criar tags, etc)
// 4. Take snapshot 2
// 5. Comparar snapshots

// Procurar por:
// - Detached DOM nodes
// - EventListeners não removidos
// - Large arrays/objects
// - Socket connections não fechadas
```

**Possíveis Causas:**

1. **EventListeners não removidos** no cleanup
2. **Socket.IO não desconecta** ao sair da página
3. **Timers (setInterval/setTimeout)** não limpos
4. **Closures** mantendo referências grandes
5. **React state** não limpo no unmount

**Soluções:**

```javascript
// Solução 1: Cleanup adequado de EventListeners
// frontend/src/components/KanbanBoard.js
useEffect(() => {
  const handleTicketUpdate = (data) => {
    // ...
  };

  socket.on('ticket:updated', handleTicketUpdate);

  // Cleanup
  return () => {
    socket.off('ticket:updated', handleTicketUpdate);
  };
}, [socket]);

// Solução 2: Desconectar Socket ao sair
// frontend/src/services/SocketWorker.js
disconnect() {
  if (this.socket) {
    // Remover todos os listeners
    Object.keys(this.eventListeners).forEach(event => {
      this.off(event);
    });

    // Desconectar
    this.socket.disconnect();
    this.socket = null;
    SocketWorker.instance = null;
  }
}

// Uso no componente
useEffect(() => {
  return () => {
    socket.disconnect();
  };
}, []);

// Solução 3: Limpar timers
useEffect(() => {
  const intervalId = setInterval(() => {
    // ...
  }, 1000);

  return () => {
    clearInterval(intervalId);
  };
}, []);

// Solução 4: Usar WeakMap para cache
// Ao invés de:
const cache = {};

// Usar:
const cache = new WeakMap();

// Solução 5: Limitar tamanho de arrays
const [tickets, setTickets] = useState([]);

useEffect(() => {
  if (tickets.length > 1000) {
    setTickets(prev => prev.slice(0, 500)); // Keep only last 500
  }
}, [tickets]);
```

**Validação:**

```javascript
// Chrome DevTools > Performance > Record

// 1. Start recording
// 2. Usar sistema por 2 minutos
// 3. Stop recording
// 4. Verificar Memory graph
// Expected: Sawtooth pattern (GC está funcionando)
// Bad: Continuous increase (memory leak)

// Verificar EventListeners
console.log(getEventListeners(window));
// Should be small and stable

// Verificar Socket connections
console.log(socket.connected);
// Should be true when using, false after leaving page
```

---

### 8. CORS Errors

**Sintomas:**
- Console mostra "CORS policy blocked"
- OPTIONS requests falhando
- Frontend não consegue acessar API
- Socket.IO connection fails with CORS error

**Diagnóstico:**

```bash
# 1. Verificar request no browser
# Network tab > ver OPTIONS request
# Headers > Access-Control-Allow-Origin

# 2. Testar CORS com curl
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  --verbose \
  http://localhost:8080/api/tags

# 3. Verificar configuração do backend
grep -r "cors" backend/src/
```

**Possíveis Causas:**

1. **CORS não configurado** no Express
2. **Origin incorreto** (localhost vs 127.0.0.1)
3. **Credentials não permitidos**
4. **Headers personalizados** não whitelisted
5. **Preflight requests** falhando

**Soluções:**

```javascript
// Solução 1: Configurar CORS no Express
// backend/src/app.js
const cors = require('cors');

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Solução 2: Configurar CORS no Socket.IO
// backend/src/socket/index.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Solução 3: NGINX proxy (produção)
// /etc/nginx/sites-available/chatia
server {
  location /api/ {
    proxy_pass http://backend;
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Content-Type' always;

    if ($request_method = 'OPTIONS') {
      return 204;
    }
  }
}

// Solução 4: Environment variables
// backend/.env
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000,https://app.chatia.com

// Solução 5: Wildcard (apenas desenvolvimento!)
// NÃO usar em produção
app.use(cors({ origin: '*' }));
```

**Validação:**

```bash
# Verificar headers da resposta
curl -I http://localhost:8080/api/tags
# Deve ter: Access-Control-Allow-Origin

# Testar preflight
curl -X OPTIONS http://localhost:8080/api/tags \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
# Expected: 204 No Content

# Verificar no browser console
# Não deve haver erros de CORS
```

---

### 9. Database Connection Pool Exhausted

**Sintomas:**
- Erro "too many connections"
- Requests timeout após alguns segundos
- Log mostra "connection pool exhausted"
- Sistema trava periodicamente

**Diagnóstico:**

```bash
# 1. Verificar conexões ativas
psql -U postgres -c "
SELECT
  count(*),
  state,
  wait_event_type,
  wait_event
FROM pg_stat_activity
WHERE datname = 'chatia_db'
GROUP BY state, wait_event_type, wait_event;
"

# 2. Verificar conexões por aplicação
psql -U postgres -c "
SELECT
  application_name,
  count(*),
  state
FROM pg_stat_activity
WHERE datname = 'chatia_db'
GROUP BY application_name, state;
"

# 3. Verificar long running queries
psql -U postgres -c "
SELECT
  pid,
  now() - query_start as duration,
  state,
  query
FROM pg_stat_activity
WHERE
  datname = 'chatia_db'
  AND state != 'idle'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
"

# 4. Verificar configuração do pool
grep -r "pool" backend/src/config/database.js
```

**Possíveis Causas:**

1. **Pool size muito pequeno** para carga
2. **Conexões não sendo liberadas** (leaks)
3. **Long running queries** bloqueando pool
4. **Timeout muito alto**
5. **Muitas instâncias** da aplicação

**Soluções:**

```javascript
// Solução 1: Aumentar pool size
// backend/src/config/database.js
module.exports = {
  // ...
  pool: {
    max: 20,        // Aumentar de 5 para 20
    min: 5,         // Manter mínimo de 5
    acquire: 30000, // 30s timeout
    idle: 10000     // 10s idle timeout
  }
};

// Solução 2: Implementar connection timeout
pool: {
  max: 20,
  min: 5,
  acquire: 30000,
  idle: 10000,
  evict: 10000 // Remover conexões ociosas a cada 10s
}

// Solução 3: Usar transaction corretamente
// Sempre usar try/finally para garantir commit/rollback
const transaction = await sequelize.transaction();
try {
  await Ticket.update(data, { where: { id }, transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}

// Solução 4: Matar queries longas
psql -U postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE
  datname = 'chatia_db'
  AND state = 'active'
  AND now() - query_start > interval '30 seconds';
"

// Solução 5: Monitorar pool
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log pool stats
setInterval(() => {
  console.log({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  });
}, 10000);
```

**Validação:**

```bash
# Monitorar conexões em tempo real
watch -n 2 "psql -U postgres -t -c \"
SELECT count(*) FROM pg_stat_activity WHERE datname = 'chatia_db';
\""

# Load test
ab -n 1000 -c 50 http://localhost:8080/api/tickets?companyId=123
# Verificar se não há erros de connection pool

# Verificar logs
pm2 logs | grep -i "connection"
# Não deve ter "connection pool exhausted"
```

---

### 10. Tickets Aparecem em Ordem Errada

**Sintomas:**
- Ordem dos tickets muda aleatoriamente
- Após DnD, ticket vai para posição incorreta
- Ordem diferente entre usuários
- Reload muda a ordem

**Diagnóstico:**

```bash
# 1. Verificar valores de kanbanOrder
psql -U postgres -d chatia_db -c "
SELECT
  id,
  title,
  kanbanLane,
  kanbanOrder
FROM Tickets
WHERE
  companyId = 'COMPANY_ID'
  AND kanbanLane = 'LANE_ID'
ORDER BY kanbanOrder;
"

# 2. Verificar duplicatas de order
psql -U postgres -d chatia_db -c "
SELECT
  kanbanLane,
  kanbanOrder,
  COUNT(*) as count
FROM Tickets
WHERE companyId = 'COMPANY_ID'
GROUP BY kanbanLane, kanbanOrder
HAVING COUNT(*) > 1;
"

# 3. Verificar query de listagem
grep -A 10 "findAll.*Ticket" backend/src/controllers/TicketController.js
```

**Possíveis Causas:**

1. **kanbanOrder duplicado** entre tickets
2. **Query sem ORDER BY** correto
3. **Race condition** ao mover múltiplos tickets
4. **Float precision** issues (se order é float)
5. **Cache desatualizado**

**Soluções:**

```bash
# Solução 1: Reordenar todos os tickets
psql -U postgres -d chatia_db <<'EOF'
-- Para cada lane, reordenar sequencialmente
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY companyId, kanbanLane
      ORDER BY kanbanOrder, updatedAt
    ) - 1 as new_order
  FROM Tickets
  WHERE kanbanLane IS NOT NULL
)
UPDATE Tickets t
SET kanbanOrder = o.new_order
FROM ordered o
WHERE t.id = o.id;
EOF

# Solução 2: Adicionar constraint única
psql -U postgres -d chatia_db -c "
ALTER TABLE Tickets
ADD CONSTRAINT unique_kanban_order
UNIQUE (companyId, kanbanLane, kanbanOrder);
"
# Nota: Só funciona se não houver duplicatas (rodar Solução 1 primeiro)

# Solução 3: Garantir ORDER BY na query
# backend/src/controllers/TicketController.js
const tickets = await Ticket.findAll({
  where: { companyId, kanbanLane },
  order: [
    ['kanbanOrder', 'ASC'],
    ['createdAt', 'ASC'] // Fallback
  ]
});

# Solução 4: Implementar locking ao mover
# backend/src/services/TicketService.js
async moveTicket(ticketId, newLaneId, newOrder) {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });

  try {
    // 1. Lock tickets na lane
    const tickets = await Ticket.findAll({
      where: { kanbanLane: newLaneId },
      order: [['kanbanOrder', 'ASC']],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    // 2. Recalcular ordens
    // 3. Update
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

# Solução 5: Invalidar cache ao mover
# backend/src/controllers/TicketController.js
async update(req, res) {
  const { id } = req.params;
  const { kanbanLane, kanbanOrder } = req.body;

  await Ticket.update({ kanbanLane, kanbanOrder }, { where: { id } });

  // Invalidar cache
  const ticket = await Ticket.findByPk(id);
  await redis.del(`tickets:${ticket.companyId}`);

  // ...
}
```

**Validação:**

```bash
# Verificar que não há duplicatas
psql -U postgres -d chatia_db -c "
SELECT
  kanbanLane,
  kanbanOrder,
  COUNT(*)
FROM Tickets
WHERE companyId = 'COMPANY_ID'
GROUP BY kanbanLane, kanbanOrder
HAVING COUNT(*) > 1;
"
# Expected: 0 rows

# Verificar ordem sequencial
psql -U postgres -d chatia_db -c "
SELECT kanbanLane, array_agg(kanbanOrder ORDER BY kanbanOrder) as orders
FROM Tickets
WHERE companyId = 'COMPANY_ID'
GROUP BY kanbanLane;
"
# Expected: {0,1,2,3,4,...} para cada lane

# Testar DnD múltiplas vezes
# Ordem deve permanecer consistente
```

---

## Quick Reference

### Common Commands

```bash
# Verificar logs
pm2 logs | tail -100
pm2 logs | grep -i error

# Restart services
pm2 restart backend
pm2 restart all

# Database access
psql -U postgres -d chatia_db

# Redis access
redis-cli

# Verificar portas
netstat -tulpn | grep -E "(8080|5432|6379)"

# Verificar processos
pm2 status
ps aux | grep node

# Limpar cache
redis-cli FLUSHDB

# Reload NGINX
nginx -t && systemctl reload nginx
```

### Useful SQL Queries

```sql
-- Count tickets by lane
SELECT kanbanLane, COUNT(*) FROM Tickets GROUP BY kanbanLane;

-- Find orphan tags
SELECT * FROM Tags WHERE companyId NOT IN (SELECT id FROM Companies);

-- Find tickets without lane
SELECT * FROM Tickets WHERE kanbanLane IS NULL;

-- Companies with Kanban V2 enabled
SELECT COUNT(*) FROM Companies WHERE settings->>'kanbanV2Enabled' = 'true';

-- Recent errors
SELECT * FROM ErrorLogs WHERE createdAt > NOW() - INTERVAL '1 hour' ORDER BY createdAt DESC LIMIT 50;
```

---

## Escalation Path

| Issue Severity | First Action | Escalate To | Escalation Time |
|----------------|--------------|-------------|-----------------|
| P0 (Critical) | Follow ROLLBACK-PLAN.md | CTO + On-call engineer | Immediate |
| P1 (High) | Investigate + temporary fix | Tech Lead | 30 minutes |
| P2 (Medium) | Investigate + plan fix | Team lead | 2 hours |
| P3 (Low) | Create ticket | Product backlog | Next sprint |

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Owner:** Engineering & Support Teams
**Feedback:** Report issues to #engineering-support
