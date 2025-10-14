# Arquitetura de Portabilidade - Kanban V2

## Status
**Versão:** 1.0
**Data:** 2025-10-13
**Autor:** Software Architect Agent
**Status:** Proposto (Aguardando Aprovação)

---

## 1. Visão Geral

### 1.1 Objetivo
Portar a funcionalidade Kanban completa do repositório de referência (chatia/chatia) para o destino (chatia monorepo), mantendo 100% de compatibilidade funcional e adicionando feature flag para rollout seguro.

### 1.2 Escopo
- **Backend:** NENHUMA alteração necessária (já está completo) ✅
- **Frontend:** Portabilidade completa de 2 páginas e adição de biblioteca DnD
- **Feature Flag:** Sistema de ativação/desativação em runtime

### 1.3 Princípios Arquiteturais
1. **Simplicidade:** Portar código testado, não reinventar
2. **Segurança:** Feature flag permite rollback imediato
3. **Multi-tenant:** Isolamento rigoroso por companyId
4. **Real-time:** Socket.io para sincronização instantânea
5. **Compatibilidade:** Manter stack existente (React 17, Material-UI v4)

---

## 2. Arquitetura Atual vs Desejada

### 2.1 Backend (DESTINO - JÁ COMPLETO)

```
┌─────────────────────────────────────────────────────────┐
│                    Backend (Express)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐     ┌────────────────────────────┐  │
│  │   TagController │     │  TicketTagController       │  │
│  │                │     │                            │  │
│  │ GET /tag/kanban│────▶│ ListService                │  │
│  │                │     │   - kanban=1               │  │
│  │                │     │   - companyId filter       │  │
│  └────────────────┘     └────────────────────────────┘  │
│                                                          │
│  ┌────────────────┐     ┌────────────────────────────┐  │
│  │TicketController│     │ ListTicketsServiceKanban   │  │
│  │                │     │                            │  │
│  │GET /ticket/    │────▶│   - dateStart/dateEnd      │  │
│  │    kanban      │     │   - queueIds filter        │  │
│  │                │     │   - limit 400              │  │
│  └────────────────┘     └────────────────────────────┘  │
│                                                          │
│  ┌────────────────┐     ┌────────────────────────────┐  │
│  │TicketTag       │     │ PUT /ticket-tags/          │  │
│  │Controller      │────▶│     :ticketId/:tagId       │  │
│  │                │     │                            │  │
│  │                │     │ DELETE /ticket-tags/       │  │
│  │                │     │        :ticketId           │  │
│  └────────────────┘     └────────────────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Socket.IO Server                      │   │
│  │                                                 │   │
│  │  Namespace: /workspace-{companyId}             │   │
│  │  Events:                                       │   │
│  │    - company-{companyId}-ticket (update)       │   │
│  │    - company-{companyId}-appMessage            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Database (PostgreSQL)              │   │
│  │                                                 │   │
│  │  Tag (kanban: 0|1, timeLane, nextLaneId)      │   │
│  │  Ticket (status, tags relation)                │   │
│  │  TicketTag (ticketId, tagId)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Status:** ✅ COMPLETO - Nenhuma alteração necessária

---

### 2.2 Frontend (DESTINO - REQUER PORTABILIDADE)

#### Estado Atual (Simplificado)
```
┌─────────────────────────────────────────────┐
│       /pages/Kanban/index.js (ATUAL)        │
├─────────────────────────────────────────────┤
│                                             │
│  - 3 colunas FIXAS (pending, open, closed) │
│  - Cards agrupados por STATUS              │
│  - SEM Drag and Drop                       │
│  - Polling 30 segundos                     │
│  - SEM filtros de data                     │
│                                             │
└─────────────────────────────────────────────┘
```

#### Estado Desejado (Portado da Referência)
```
┌──────────────────────────────────────────────────────────┐
│        /pages/Kanban/index.js (PORTADO)                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Filtros de Data (startDate/endDate)      │   │
│  │  [____startDate____] [____endDate____] [Buscar]  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Board (react-trello)                │   │
│  │                                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │   │
│  │  │  Lane 0     │ │  Lane 1     │ │  Lane N  │  │   │
│  │  │  (Sem Tag)  │ │  (Tag A)    │ │  (Tag Z) │  │   │
│  │  ├─────────────┤ ├─────────────┤ ├──────────┤  │   │
│  │  │ ┌─────────┐ │ │ ┌─────────┐ │ │┌────────┐│  │   │
│  │  │ │ Card 1  │◄──────│ Card 2  │◄───│Card 3 ││  │   │
│  │  │ └─────────┘ │ │ └─────────┘ │ │└────────┘│  │   │
│  │  │             │ │             │ │          │  │   │
│  │  │   Draggable │ │  Draggable  │ │Draggable │  │   │
│  │  └─────────────┘ └─────────────┘ └──────────┘  │   │
│  │                                                  │   │
│  │  onCardMoveAcrossLanes → handleCardMove()       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Socket.IO Client (Real-time)             │   │
│  │                                                  │   │
│  │  socket.on('company-{id}-ticket')                │   │
│  │  socket.on('company-{id}-appMessage')            │   │
│  │    └──▶ fetchTickets() → popularCards()          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Botão: Adicionar Colunas] → /tagsKanban               │
└──────────────────────────────────────────────────────────┘
```

---

### 2.3 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUXO DRAG AND DROP                          │
└─────────────────────────────────────────────────────────────────┘

1. USUÁRIO ARRASTA CARD
   ┌──────────────────┐
   │  Card Ticket #42 │  (Lane A → Lane B)
   └──────────────────┘
          │
          ▼
2. REACT-TRELLO EVENT
   ┌─────────────────────────────────────────────┐
   │ onCardMoveAcrossLanes(                      │
   │   cardId: "42",                             │
   │   sourceLaneId: "lane-a",                   │
   │   targetLaneId: "lane-b"                    │
   │ )                                           │
   └─────────────────────────────────────────────┘
          │
          ▼
3. FRONTEND: handleCardMove()
   ┌─────────────────────────────────────────────┐
   │ async handleCardMove(cardId, src, target) { │
   │                                             │
   │   // 1. Remove tag antiga (se existir)     │
   │   await api.delete(                         │
   │     `/ticket-tags/${cardId}`                │
   │   );                                        │
   │                                             │
   │   // 2. Adiciona nova tag                  │
   │   await api.put(                            │
   │     `/ticket-tags/${cardId}/${target}`      │
   │   );                                        │
   │                                             │
   │   // 3. Atualiza estado local              │
   │   fetchTickets();                           │
   │ }                                           │
   └─────────────────────────────────────────────┘
          │
          ▼
4. BACKEND: TicketTagController
   ┌─────────────────────────────────────────────┐
   │ PUT /ticket-tags/:ticketId/:tagId           │
   │                                             │
   │ - TicketTag.create({ ticketId, tagId })    │
   │ - ShowTicketService(ticketId, companyId)   │
   │ - io.of(companyId).emit(                   │
   │     'company-{id}-ticket',                  │
   │     { action: 'update', ticket }            │
   │   )                                         │
   └─────────────────────────────────────────────┘
          │
          ▼
5. DATABASE UPDATE
   ┌─────────────────────────────────────────────┐
   │ INSERT INTO TicketTags                      │
   │   (ticketId, tagId, updatedAt)              │
   │ VALUES (42, 5, NOW())                       │
   │                                             │
   │ WHERE companyId = {current}  ✅ Multi-tenant│
   └─────────────────────────────────────────────┘
          │
          ▼
6. SOCKET.IO BROADCAST
   ┌─────────────────────────────────────────────┐
   │ Namespace: /workspace-{companyId}           │
   │                                             │
   │ Event: company-{companyId}-ticket           │
   │ Payload: {                                  │
   │   action: "update",                         │
   │   ticket: { id: 42, tags: [...] }           │
   │ }                                           │
   └─────────────────────────────────────────────┘
          │
          ▼
7. FRONTEND: Socket Listener (ALL CLIENTS)
   ┌─────────────────────────────────────────────┐
   │ socket.on('company-{id}-ticket', (data) => {│
   │   if (data.action === 'update') {           │
   │     fetchTickets();  // Atualiza lista      │
   │     popularCards();  // Reconstrói Board    │
   │   }                                         │
   │ });                                         │
   └─────────────────────────────────────────────┘
          │
          ▼
8. REACT RE-RENDER
   ┌─────────────────────────────────────────────┐
   │ <Board data={file} />                       │
   │                                             │
   │ - Card #42 agora aparece em Lane B          │
   │ - Todos os clientes sincronizados           │
   │ - Real-time, sem refresh manual             │
   └─────────────────────────────────────────────┘
```

---

## 3. Decisões Arquiteturais

### 3.1 Biblioteca Drag and Drop

#### Opção A: react-trello 2.2.11 (ESCOLHIDA ✅)

**Prós:**
- ✅ Compatibilidade 100% com código referência
- ✅ Zero refactor necessário
- ✅ Código testado em produção (referência)
- ✅ Implementação rápida (2-3 dias)
- ✅ API simples e direta

**Contras:**
- ❌ Última atualização: 2019 (sem manutenção ativa)
- ❌ React 16.x (porém funciona com React 17)
- ❌ Sem TypeScript nativo
- ❌ Acessibilidade limitada

**Código Exemplo:**
```jsx
import Board from 'react-trello';

<Board
  data={{
    lanes: [
      {
        id: '1',
        title: 'Lane A',
        cards: [
          { id: 'card1', title: 'Card 1', description: '...' }
        ]
      }
    ]
  }}
  onCardMoveAcrossLanes={handleCardMove}
  draggable
/>
```

---

#### Opção B: @dnd-kit/core + @dnd-kit/sortable (NÃO ESCOLHIDA)

**Prós:**
- ✅ Moderno, mantido ativamente (2024)
- ✅ TypeScript nativo
- ✅ Acessibilidade (WCAG)
- ✅ Performance otimizada
- ✅ React 17+ compatível

**Contras:**
- ❌ Requer refactor COMPLETO do Board
- ❌ API mais complexa (boilerplate)
- ❌ Tempo estimado: 5-7 dias
- ❌ Risco de bugs durante migração
- ❌ Curva de aprendizado maior

**Código Exemplo:**
```jsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  <SortableContext items={items} strategy={verticalListSortingStrategy}>
    {items.map(item => <SortableCard key={item.id} id={item.id} />)}
  </SortableContext>
</DndContext>
```

---

### 3.2 Feature Flag Strategy

#### Implementação: Variável de Ambiente + Frontend Toggle

**Backend (.env):**
```bash
FEATURE_KANBAN_V2=true  # Produção: false inicialmente
```

**Frontend (FeatureFlags.js):**
```javascript
// frontend/src/config/featureFlags.js
export const FEATURES = {
  KANBAN_V2: process.env.REACT_APP_FEATURE_KANBAN_V2 === 'true'
};
```

**Uso nas Rotas:**
```javascript
// frontend/src/routes/index.js
import { FEATURES } from '../config/featureFlags';

{FEATURES.KANBAN_V2 ? (
  <Route exact path="/kanban" component={KanbanV2} isPrivate />
) : (
  <Route exact path="/kanban" component={KanbanLegacy} isPrivate />
)}
```

**Estratégia de Rollout:**
1. **Fase 1 (Desenvolvimento):** FEATURE_KANBAN_V2=true em .env.local
2. **Fase 2 (Staging):** Testar com companies de teste
3. **Fase 3 (Produção - 10%):** Ativar para 1-2 companies piloto
4. **Fase 4 (Produção - 50%):** Expandir gradualmente
5. **Fase 5 (Produção - 100%):** Ativar para todas companies
6. **Fase 6 (Cleanup):** Remover código legacy após 2 semanas

**Rollback:**
```bash
# Em caso de problemas críticos
FEATURE_KANBAN_V2=false
pm2 restart frontend
# Sistema volta para Kanban legacy instantaneamente
```

---

### 3.3 State Management

**Decisão:** Context API + useState (SEM Zustand)

**Justificativa:**
1. ✅ Código referência usa useState + useEffect
2. ✅ Simplicidade: estado local suficiente
3. ✅ Kanban é página isolada (não compartilha estado global)
4. ✅ Socket.io já sincroniza entre clients
5. ❌ Zustand seria over-engineering para este caso

**Estrutura de Estado:**
```javascript
// /pages/Kanban/index.js
const [tags, setTags] = useState([]);           // Tags com kanban=1
const [tickets, setTickets] = useState([]);     // Todos os tickets
const [file, setFile] = useState({ lanes: [] }); // Estrutura do Board
const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
const [loading, setLoading] = useState(true);
```

---

### 3.4 Socket.IO Real-time

**Eventos Subscritos:**
```javascript
socket.on(`company-${companyId}-ticket`, onTicketUpdate);
socket.on(`company-${companyId}-appMessage`, onMessageUpdate);
```

**Handler:**
```javascript
const onTicketUpdate = useCallback((data) => {
  if (data.action === "create" || data.action === "update" || data.action === "delete") {
    fetchTickets(); // Re-fetch tickets
    // popularCards() será chamado automaticamente via useEffect
  }
}, [startDate, endDate]);
```

**Multi-tenant Isolation:**
- ✅ Namespace: `/workspace-{companyId}`
- ✅ Evento inclui companyId: `company-{companyId}-ticket`
- ✅ Frontend filtra por companyId do AuthContext

---

## 4. Estrutura de Componentes

### 4.1 Hierarquia de Componentes

```
/pages/Kanban/index.js (PRINCIPAL)
├── Header
│   ├── DateFilters
│   │   ├── TextField (startDate)
│   │   ├── TextField (endDate)
│   │   └── Button (Buscar)
│   └── Button (Adicionar Colunas → /tagsKanban)
│
├── Board (react-trello)
│   ├── Lane 0 (Tickets sem tag)
│   │   └── Cards (draggable)
│   │       ├── Card Header (Icon + Contact Name)
│   │       ├── Card Body (Number + LastMessage)
│   │       ├── Card Footer (User Badge)
│   │       └── Button (Ver Ticket)
│   │
│   └── Lanes 1..N (Tags com kanban=1)
│       └── Cards (draggable)
│           └── (mesma estrutura)
│
└── Socket.IO Listeners (invisible)
```

### 4.2 Componente Board - Estrutura de Dados

```javascript
const file = {
  lanes: [
    {
      id: "lane0",
      title: "Sem Etiqueta",
      label: "5", // Contador de tickets
      cards: [
        {
          id: "42",
          title: "👤 João Silva",
          label: "Ticket #42",
          description: (
            <div>
              <div>55999887766</div>
              <div>Última mensagem...</div>
              <Button onClick={() => handleCardClick(uuid)}>
                Ver Ticket
              </Button>
              <Badge>ATENDENTE</Badge>
            </div>
          ),
          draggable: true,
          href: "/tickets/uuid-42"
        }
      ]
    },
    {
      id: "1", // tagId
      title: "Em Atendimento",
      label: "12",
      style: { backgroundColor: "#4caf50", color: "white" }, // tag.color
      cards: [...]
    }
  ]
};
```

---

## 5. Fluxo de Implementação (8 Agentes)

### Agent 1: Package Installation (DnD-Installer)
- Instalar react-trello 2.2.11
- Validar compatibilidade com React 17
- Testar renderização básica

### Agent 2: Backend Validation (Backend-Validator)
- Validar endpoints existentes
- Testar multi-tenant isolation
- Confirmar Socket.io events

### Agent 3: Kanban Page Port (Kanban-Page-Porter)
- Copiar /pages/Kanban/index.js da referência
- Adaptar imports e paths
- Adicionar filtros de data

### Agent 4: TagsKanban Page Port (TagsKanban-Page-Porter)
- Copiar /pages/TagsKanban/index.js da referência
- Reativar página CRUD
- Conectar Socket.io

### Agent 5: Socket.IO Integration (Socket-Integrator)
- Implementar listeners
- Testar sincronização real-time
- Validar multi-client updates

### Agent 6: Feature Flag Setup (FeatureFlag-Implementer)
- Criar featureFlags.js
- Adicionar toggle nas rotas
- Implementar rollback strategy

### Agent 7: E2E Testing (Tester)
- Testes DnD entre lanes
- Testes filtros de data
- Testes multi-tenant isolation
- Testes Socket.io sync

### Agent 8: Documentation & Deploy (Doc-Deployer)
- Atualizar README
- Criar guia de rollout
- Deploy em staging

---

## 6. Testing Strategy

### 6.1 Unit Tests (Jest + React Testing Library)

```javascript
// tests/unit/Kanban.test.js
describe('Kanban Page', () => {
  test('carrega tags com kanban=1', async () => {
    render(<Kanban />);
    await waitFor(() => {
      expect(screen.getByText('Lane 1')).toBeInTheDocument();
    });
  });

  test('filtra tickets por data', async () => {
    const { getByLabelText, getByText } = render(<Kanban />);
    fireEvent.change(getByLabelText('Data Início'), { target: { value: '2025-10-01' } });
    fireEvent.click(getByText('Buscar'));
    // Assert API call com params corretos
  });
});
```

### 6.2 Integration Tests (Playwright E2E)

```javascript
// tests/e2e/kanban-dnd.spec.js
test('move ticket entre lanes via DnD', async ({ page }) => {
  await page.goto('/kanban');

  // 1. Arrasta card da Lane 0 → Lane 1
  const card = page.locator('[data-id="ticket-42"]');
  const targetLane = page.locator('[data-lane-id="1"]');

  await card.dragTo(targetLane);

  // 2. Valida API call
  await page.waitForRequest(req =>
    req.url().includes('/ticket-tags/42/1')
  );

  // 3. Valida UI update
  await expect(targetLane).toContainText('Ticket #42');
});
```

### 6.3 Multi-Tenant Tests

```javascript
test('isola tickets por companyId', async () => {
  // Login como Company 1
  const user1 = await loginAsCompany(1);
  const tickets1 = await api.get('/ticket/kanban', user1.token);

  // Login como Company 2
  const user2 = await loginAsCompany(2);
  const tickets2 = await api.get('/ticket/kanban', user2.token);

  // Assert: tickets não se misturam
  expect(tickets1.data).not.toEqual(tickets2.data);
});
```

---

## 7. Performance Considerations

### 7.1 Limitações Atuais
- **Backend:** Limit de 400 tickets por request
- **Frontend:** React renderiza todas as lanes/cards
- **Socket.io:** Broadcast para todos os clients da company

### 7.2 Otimizações Futuras (Fora do Escopo V2)
1. **Virtualization:** Renderizar apenas cards visíveis (react-window)
2. **Pagination:** Carregar lanes sob demanda
3. **Debounce:** Agrupar múltiplos moves em batch
4. **WebWorkers:** Processar popularCards() em background

### 7.3 Métricas de Performance
| Métrica | Target | Atual (Estimado) |
|---------|--------|------------------|
| Initial Load | < 2s | ~1.5s |
| DnD Response | < 500ms | ~300ms |
| Socket.io Latency | < 200ms | ~100ms |
| Re-render Time | < 100ms | ~80ms |

---

## 8. Security & Multi-Tenant

### 8.1 Backend Security
```typescript
// SEMPRE validar companyId do token
const { companyId } = req.user;

// NUNCA confiar em params do request
await Tag.findAll({
  where: {
    kanban: 1,
    companyId: companyId  // ✅ Token-based
  }
});

// Socket.io: namespace isolado
io.of(String(companyId))  // ✅ Namespace único por company
```

### 8.2 Frontend Security
```javascript
// SEMPRE obter companyId do AuthContext
const { user } = useContext(AuthContext);
const companyId = user.companyId;

// Socket.io: listener filtrado
socket.on(`company-${companyId}-ticket`, (data) => {
  // ✅ Evento específico da company
});
```

### 8.3 Checklist de Segurança
- [x] Backend filtra todos os queries por companyId
- [x] Frontend usa companyId do token (AuthContext)
- [x] Socket.io usa namespaces isolados
- [x] Rotas protegidas com isAuth middleware
- [ ] Adicionar rate limiting (futuro)
- [ ] Adicionar audit logs (futuro)

---

## 9. Rollout & Monitoring

### 9.1 Plano de Rollout

**Semana 1: Desenvolvimento**
- Implementação completa
- Testes unitários e integração
- Deploy em ambiente dev

**Semana 2: Staging**
- Deploy em staging
- Testes com companies de teste
- Validação de performance

**Semana 3: Produção (10%)**
- Feature flag: KANBAN_V2=true para 1-2 companies piloto
- Monitoramento intensivo
- Coleta de feedback

**Semana 4: Produção (50%)**
- Expandir para 50% das companies
- Monitorar métricas de uso
- Ajustes finos

**Semana 5: Produção (100%)**
- Ativar para todas companies
- Monitoramento contínuo

**Semana 6: Cleanup**
- Remover código legacy (KanbanLegacy)
- Remover feature flag
- Documentação final

### 9.2 Métricas de Monitoramento

```javascript
// Sentry - Error Tracking
Sentry.captureException(error, {
  tags: {
    feature: 'kanban-v2',
    companyId: user.companyId
  }
});

// Custom Metrics
logMetric('kanban.dnd.move', {
  ticketId,
  sourceTag,
  targetTag,
  duration: endTime - startTime
});

logMetric('kanban.load.time', {
  ticketsCount,
  lanesCount,
  duration
});
```

### 9.3 KPIs de Sucesso
- **Error Rate:** < 1% (target: 0.1%)
- **DnD Success Rate:** > 99%
- **Socket.io Disconnects:** < 5%
- **User Satisfaction:** > 4.5/5 (survey)
- **Performance:** < 2s load time

---

## 10. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação | Contingência |
|-------|---------|---------------|-----------|--------------|
| **react-trello incompatível com React 17** | ALTO | BAIXA | Testar em dev primeiro | Usar @dnd-kit (Opção B) |
| **DnD lag com 1000+ tickets** | MÉDIO | MÉDIA | Limit 400 já implementado | Adicionar paginação |
| **Socket.io sobrecarga** | BAIXO | BAIXA | Namespace isolado | Throttle broadcasts |
| **Feature flag falha** | ALTO | BAIXA | Toggle simples (env var) | Rollback manual via deploy |
| **Multi-tenant leak** | CRÍTICO | BAIXÍSSIMA | Testes rigorosos | Auditoria de código |
| **Rollout causa bugs** | MÉDIO | MÉDIA | Rollout gradual 10%→50%→100% | Feature flag OFF imediato |

---

## 11. Documentação de Suporte

### 11.1 Para Desenvolvedores
- [mapping.md](./mapping.md): Mapeamento completo ref → destino
- [ADR-kanban-v2.md](./ADR-kanban-v2.md): Decisões arquiteturais
- [README-kanban.md](./README-kanban.md): Guia de implementação

### 11.2 Para QA
- Roteiro de testes E2E
- Checklist de multi-tenant
- Cenários de edge cases

### 11.3 Para DevOps
- Guia de deploy
- Configuração de feature flags
- Plano de rollback

---

## 12. Próximos Passos

### Fase 1: Aprovação
- [ ] Revisar arquitetura com stakeholders
- [ ] Aprovar decisão: react-trello vs @dnd-kit
- [ ] Validar estratégia de feature flag
- [ ] Aprovar plano de rollout

### Fase 2: Implementação
- [ ] Agent 1: Instalar react-trello
- [ ] Agent 2: Validar backend
- [ ] Agent 3: Portar Kanban page
- [ ] Agent 4: Portar TagsKanban page
- [ ] Agent 5: Socket.io integration
- [ ] Agent 6: Feature flag setup
- [ ] Agent 7: E2E tests
- [ ] Agent 8: Deploy staging

### Fase 3: Validação
- [ ] Testes em staging
- [ ] Code review
- [ ] Performance benchmarks
- [ ] Security audit

### Fase 4: Rollout
- [ ] Deploy produção (10%)
- [ ] Monitoramento
- [ ] Ajustes
- [ ] Expansão gradual

---

## Conclusão

Esta arquitetura garante:
- ✅ **Simplicidade:** Porta código testado, não reinventa
- ✅ **Segurança:** Feature flag permite rollback imediato
- ✅ **Multi-tenant:** Isolamento rigoroso por companyId
- ✅ **Performance:** Limit 400 tickets, Socket.io eficiente
- ✅ **Manutenibilidade:** Código claro, bem documentado
- ✅ **Prazo:** 2-3 dias de implementação frontend

O backend está PRONTO. O frontend requer portabilidade direta com zero alterações de lógica. Feature flag garante rollout seguro e reversível.
