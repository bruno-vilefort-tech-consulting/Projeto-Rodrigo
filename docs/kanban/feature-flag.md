# Feature Flag - Kanban v2

**Versão:** 1.0
**Data:** 2025-10-13
**Status:** ATIVO

---

## Visão Geral

O Kanban v2 utiliza feature flag `FEATURE_KANBAN_V2` para controlar a disponibilidade da funcionalidade em ambientes de produção. Isso permite deploy gradual e rollback instantâneo em caso de problemas.

---

## Configuração

### Variável de Ambiente

**Nome:** `FEATURE_KANBAN_V2`
**Tipo:** Boolean (string)
**Valores:** `"true"` | `"false"`
**Default:** `false` (desabilitado)

### Localização

**Backend:**
- Arquivo: `backend/.env`
- Linha: 46

```env
# Feature Flags
FEATURE_KANBAN_V2=true
```

**Frontend:**
- Arquivo: `frontend/.env`
- Variável: `REACT_APP_FEATURE_KANBAN_V2=true`

---

## Como Ativar/Desativar

### Método 1: Via Arquivo .env (RECOMENDADO)

**Ativar:**
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
echo "FEATURE_KANBAN_V2=true" >> .env
pm2 restart chatia-backend
```

**Desativar:**
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
sed -i '' 's/FEATURE_KANBAN_V2=true/FEATURE_KANBAN_V2=false/' .env
pm2 restart chatia-backend
```

### Método 2: Via Variável de Ambiente (Sem Restart)

**Ativar (temporário):**
```bash
export FEATURE_KANBAN_V2=true
pm2 restart chatia-backend
```

**Desativar (temporário):**
```bash
export FEATURE_KANBAN_V2=false
pm2 restart chatia-backend
```

### Método 3: Via PM2 Ecosystem

**Editar `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'chatia-backend',
    script: './dist/server.js',
    env: {
      NODE_ENV: 'production',
      FEATURE_KANBAN_V2: 'true'  // Adicionar aqui
    }
  }]
}
```

**Aplicar:**
```bash
pm2 reload ecosystem.config.js
```

---

## Comportamento do Sistema

### Quando FEATURE_KANBAN_V2=true

**Backend:**
- ✅ Endpoints Kanban habilitados:
  - `GET /tag/kanban`
  - `GET /ticket/kanban`
  - `PUT /ticket-tags/:ticketId/:tagId`
  - `DELETE /ticket-tags/:ticketId`
- ✅ Socket.IO eventos emitidos:
  - `company-{companyId}-ticket` (namespace `/workspace-{companyId}`)
- ✅ Logs: "Kanban v2 enabled for company {companyId}"

**Frontend:**
- ✅ Menu "Kanban" visível na navegação
- ✅ Visualização Kanban acessível
- ✅ Drag and Drop habilitado
- ✅ Filtros de data/tags/queues funcionais

### Quando FEATURE_KANBAN_V2=false

**Backend:**
- ❌ Endpoints Kanban retornam 404 (ou desabilitados via middleware)
- ❌ Socket.IO eventos NÃO emitidos
- ✅ Resto do sistema funciona normalmente

**Frontend:**
- ❌ Menu "Kanban" oculto
- ❌ Rota `/kanban` redireciona para dashboard
- ✅ Visualização de tickets tradicional funciona normalmente

---

## Implementação (Para Desenvolvedores)

### Backend: Middleware de Feature Flag

**Arquivo:** `backend/src/middleware/featureFlag.ts` (CRIAR)

```typescript
import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

export const requireFeature = (featureName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isEnabled = process.env[featureName] === "true";

    if (!isEnabled) {
      throw new AppError(`Feature ${featureName} is not enabled`, 404);
    }

    next();
  };
};
```

**Uso nas Rotas:**

```typescript
// backend/src/routes/ticketRoutes.ts
import { requireFeature } from "../middleware/featureFlag";

ticketRoutes.get(
  "/ticket/kanban",
  isAuth,
  requireFeature("FEATURE_KANBAN_V2"),  // Adicionar aqui
  TicketController.kanban
);
```

### Frontend: Hook de Feature Flag

**Arquivo:** `frontend/src/hooks/useFeatureFlag.ts` (CRIAR)

```typescript
import { useMemo } from "react";

export const useFeatureFlag = (flagName: string): boolean => {
  return useMemo(() => {
    const value = process.env[`REACT_APP_${flagName}`];
    return value === "true";
  }, [flagName]);
};
```

**Uso nos Componentes:**

```typescript
// frontend/src/components/MainMenu.tsx
import { useFeatureFlag } from "../hooks/useFeatureFlag";

export const MainMenu = () => {
  const kanbanEnabled = useFeatureFlag("FEATURE_KANBAN_V2");

  return (
    <nav>
      <MenuItem to="/tickets">Tickets</MenuItem>
      {kanbanEnabled && <MenuItem to="/kanban">Kanban</MenuItem>}
      <MenuItem to="/contacts">Contatos</MenuItem>
    </nav>
  );
};
```

---

## Estratégia de Deploy

### Fase 1: Deploy com Feature Desabilitada (Segurança)

**Objetivo:** Garantir que código novo não quebra sistema existente.

```bash
# 1. Deploy backend com flag=false
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
git pull origin main
npm install
npm run build
echo "FEATURE_KANBAN_V2=false" >> .env
pm2 restart chatia-backend

# 2. Validar sistema funciona normalmente
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/tickets
# Deve retornar 200 OK

# 3. Validar endpoint Kanban retorna 404 (ou desabilitado)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/ticket/kanban
# Deve retornar 404
```

### Fase 2: Habilitar em Staging (Testes)

```bash
# 1. Ativar feature flag em staging
ssh user@staging-server
cd /app/backend
sed -i 's/FEATURE_KANBAN_V2=false/FEATURE_KANBAN_V2=true/' .env
pm2 restart chatia-backend

# 2. Executar testes E2E
npm run test:e2e -- --grep "Kanban"

# 3. Testes manuais:
# - Login no frontend staging
# - Acessar /kanban
# - Testar Drag and Drop
# - Validar Socket.IO real-time
```

### Fase 3: Canary Deploy (10% dos Usuários)

**Objetivo:** Validar em produção com risco controlado.

```bash
# 1. Identificar 10% dos usuários (por companyId)
# Exemplo: companyIds 1, 5, 10

# 2. Criar middleware condicional (OPCIONAL):
# backend/src/middleware/featureFlagByCompany.ts
export const requireFeatureForCompany = (feature: string, allowedCompanyIds: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { companyId } = req.user;
    const isEnabled = process.env[feature] === "true";
    const isAllowed = allowedCompanyIds.includes(companyId);

    if (!isEnabled || !isAllowed) {
      throw new AppError(`Feature not available`, 404);
    }

    next();
  };
};

# 3. Aplicar em rotas:
ticketRoutes.get(
  "/ticket/kanban",
  isAuth,
  requireFeatureForCompany("FEATURE_KANBAN_V2", [1, 5, 10]),
  TicketController.kanban
);

# 4. Deploy e monitorar
pm2 restart chatia-backend
pm2 logs --lines 100 --err
```

### Fase 4: Full Rollout (100% dos Usuários)

```bash
# 1. Remover lista de companyIds permitidos
# Usar apenas requireFeature("FEATURE_KANBAN_V2")

# 2. Habilitar feature flag global
echo "FEATURE_KANBAN_V2=true" >> /app/backend/.env
pm2 restart chatia-backend

# 3. Monitorar métricas
# - Latência: GET /ticket/kanban < 500ms
# - Erros: Taxa < 0.1%
# - Socket.IO: Eventos emitidos > 0

# 4. Comunicar time e usuários
# - Email: "Kanban v2 agora disponível!"
# - Documentação: Link para guia de uso
```

---

## Rollback

### Rollback Instantâneo (Em Caso de Emergência)

**Sintomas de Problema:**
- Taxa de erro > 1%
- Latência > 2s
- Socket.IO não funciona
- Usuários reportam bugs críticos

**Procedimento:**

```bash
# 1. Desabilitar feature flag IMEDIATAMENTE
ssh user@production-server
cd /app/backend
sed -i 's/FEATURE_KANBAN_V2=true/FEATURE_KANBAN_V2=false/' .env
pm2 restart chatia-backend

# 2. Validar sistema voltou ao normal
curl http://localhost:8080/tickets  # Deve retornar 200 OK
curl http://localhost:8080/ticket/kanban  # Deve retornar 404

# 3. Notificar time
# - Slack: "@channel Kanban v2 desabilitado devido a [problema]"
# - Criar incident ticket
# - Investigar logs: pm2 logs chatia-backend --lines 500 --err

# 4. Analisar causa raiz
# - Revisar logs de erro
# - Reproduzir problema em staging
# - Aplicar hotfix
# - Testar em staging
# - Re-ativar feature flag após validação
```

### Rollback Planejado (Sem Emergência)

**Cenário:** Feature não está pronta, mas código já foi deployado.

```bash
# 1. Comunicar time e usuários
# Email: "Kanban v2 será desabilitado temporariamente para ajustes"

# 2. Desabilitar feature flag
sed -i 's/FEATURE_KANBAN_V2=true/FEATURE_KANBAN_V2=false/' /app/backend/.env
pm2 restart chatia-backend

# 3. Aplicar correções no código
# - Fix bugs
# - Adicionar testes
# - Commit e push

# 4. Re-deploy seguindo Fase 2 (Staging) novamente
```

---

## Monitoramento

### Logs a Observar

**Backend (PM2 Logs):**
```bash
pm2 logs chatia-backend --lines 100 | grep "Kanban"
```

**Logs Esperados:**
```
[INFO] Kanban v2 enabled for company 1
[INFO] GET /ticket/kanban - 200 OK - 234ms
[INFO] PUT /ticket-tags/123/2 - 201 Created - 87ms
[INFO] Socket.IO event emitted: company-1-ticket (namespace: /workspace-1)
```

**Logs de Erro (Investigar):**
```
[ERROR] GET /ticket/kanban - 500 Internal Server Error - 1523ms
[ERROR] Socket.IO namespace /workspace-1 not found
[ERROR] Multi-tenant validation failed: ticket 999 not found for company 2
```

### Métricas (Prometheus/Grafana)

**KPIs Críticos:**
```yaml
- name: kanban_requests_total
  type: counter
  labels: [method, path, status]
  description: Total de requests aos endpoints Kanban

- name: kanban_request_duration_seconds
  type: histogram
  buckets: [0.1, 0.25, 0.5, 1, 2.5]
  labels: [method, path]
  description: Latência dos endpoints Kanban

- name: socketio_kanban_events_emitted_total
  type: counter
  labels: [namespace, event]
  description: Total de eventos Socket.IO emitidos pelo Kanban
```

**Alertas:**
```yaml
- alert: KanbanHighErrorRate
  expr: rate(kanban_requests_total{status=~"5.."}[5m]) > 0.01
  severity: critical
  message: "Kanban error rate > 1%: {{ $value }}"

- alert: KanbanHighLatency
  expr: histogram_quantile(0.95, kanban_request_duration_seconds) > 1
  severity: warning
  message: "Kanban p95 latency > 1s: {{ $value }}"

- alert: KanbanSocketIONotEmitting
  expr: rate(socketio_kanban_events_emitted_total[5m]) == 0
  severity: warning
  message: "Socket.IO Kanban events not emitted in last 5 minutes"
```

---

## FAQ

### P: A feature flag afeta o banco de dados?

**R:** NÃO. A feature flag apenas controla se os endpoints estão acessíveis. O schema do banco permanece o mesmo. Modelos `Tag` e `TicketTag` existem independentemente da flag.

### P: Posso habilitar Kanban apenas para algumas empresas?

**R:** SIM. Implementar middleware `requireFeatureForCompany(featureName, allowedCompanyIds)` conforme descrito na seção "Canary Deploy".

### P: O que acontece com tickets já criados se eu desabilitar a feature?

**R:** NADA. Tickets e tags continuam no banco de dados. Apenas a visualização Kanban fica inacessível. Visualização tradicional de tickets funciona normalmente.

### P: A feature flag requer restart do backend?

**R:** SIM. Variáveis de ambiente são carregadas no startup do Node.js. Usar `pm2 restart chatia-backend` após alterar `.env`.

### P: Posso usar a feature flag no frontend sem implementar no backend?

**R:** NÃO RECOMENDADO. Se frontend chamar endpoints desabilitados no backend, usuário verá erros 404. Sempre sincronizar frontend e backend.

### P: A feature flag impacta performance do sistema?

**R:** IMPACTO MÍNIMO. Verificação `process.env.FEATURE_KANBAN_V2 === "true"` é executada uma vez no middleware (antes do controller). Overhead: < 1ms.

### P: Como testar a feature flag localmente?

**R:**
```bash
# Terminal 1: Backend com feature desabilitada
cd backend
echo "FEATURE_KANBAN_V2=false" > .env.local
npm run dev

# Terminal 2: Testar endpoint
curl http://localhost:8080/ticket/kanban  # Deve retornar 404

# Terminal 3: Backend com feature habilitada
# Parar Terminal 1
echo "FEATURE_KANBAN_V2=true" > .env.local
npm run dev

# Testar novamente
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/ticket/kanban
# Deve retornar 200 OK
```

---

## Histórico de Mudanças

| Data | Versão | Mudança | Autor |
|------|--------|---------|-------|
| 2025-10-13 | 1.0 | Criação do documento | Backend Implementation Specialist |
| 2025-10-13 | 1.0 | Adicionada variável FEATURE_KANBAN_V2 ao .env | Backend Implementation Specialist |

---

## Referências

- **ADR Kanban v2:** `docs/kanban/ADR-kanban-v2.md`
- **Backend Status:** `docs/kanban/backend-implementation-status.md`
- **API Endpoints:** `docs/kanban/api-endpoints.md`
- **OpenAPI Spec:** `docs/kanban/openapi-kanban.yaml`

---

**Criado por:** Backend Implementation Specialist (Claude Code)
**Data:** 2025-10-13
**Status:** ATIVO
