# Feature Flag Frontend - Kanban V2

**Vers\u00e3o:** 1.0
**Data:** 2025-10-13

---

## \u00cdndice

1. [Configura\u00e7\u00e3o](#1-configura\u00e7\u00e3o)
2. [Implementa\u00e7\u00e3o](#2-implementa\u00e7\u00e3o)
3. [Uso nas Rotas](#3-uso-nas-rotas)
4. [Testes Locais](#4-testes-locais)
5. [Deploy e Rollback](#5-deploy-e-rollback)

---

## 1. Configura\u00e7\u00e3o

### 1.1. Vari\u00e1vel de Ambiente

**Nome:** `REACT_APP_FEATURE_KANBAN_V2`
**Tipo:** String ("true" | "false")
**Default:** `"false"` (desabilitado)

**Localiza\u00e7\u00e3o:** `frontend/.env`

```bash
# .env (desenvolvimento - ativar para testar V2)
REACT_APP_FEATURE_KANBAN_V2=true

# .env.production (produ\u00e7\u00e3o - desabilitado inicialmente)
REACT_APP_FEATURE_KANBAN_V2=false
```

**IMPORTANTE:**
- React requer prefixo `REACT_APP_` para expor vari\u00e1veis ao frontend
- Valores devem ser strings: `"true"` ou `"false"` (n\u00e3o boolean)
- Rebuild necess\u00e1rio ao mudar .env em produ\u00e7\u00e3o

---

### 1.2. Arquivo de Configura\u00e7\u00e3o

**Localiza\u00e7\u00e3o:** `frontend/src/config/featureFlags.js`

**Criar arquivo:**
```javascript
// frontend/src/config/featureFlags.js

/**
 * Feature Flags do ChatIA Flow
 *
 * IMPORTANTE: Adicionar novas flags apenas ap\u00f3s aprovação do Product Owner.
 * Remover flags antigas ap\u00f3s 2 semanas de 100% rollout.
 */

export const FEATURES = {
  /**
   * Kanban V2 com Drag-and-Drop
   * @since 2025-10-13
   * @default false
   * @see docs/kanban/ADR-kanban-v2.md
   */
  KANBAN_V2: process.env.REACT_APP_FEATURE_KANBAN_V2 === 'true',

  // Adicionar novas flags aqui
  // NOVA_FEATURE: process.env.REACT_APP_FEATURE_NOVA === 'true',
};

/**
 * Helper function para checar feature flag em runtime
 * @param {string} featureName - Nome da feature (chave em FEATURES)
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};

/**
 * Hook para usar feature flag em componentes
 * @param {string} featureName - Nome da feature
 * @returns {boolean}
 *
 * @example
 * const kanbanV2Enabled = useFeatureFlag('KANBAN_V2');
 * if (kanbanV2Enabled) { ... }
 */
export const useFeatureFlag = (featureName) => {
  return FEATURES[featureName] === true;
};
```

---

## 2. Implementa\u00e7\u00e3o

### 2.1. Renomear Kanban Atual (Legacy)

**Passo 1:** Renomear arquivo existente

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/Kanban
mv index.js KanbanLegacy.jsx
```

**Passo 2:** Atualizar exports (se necess\u00e1rio)

```javascript
// frontend/src/pages/Kanban/KanbanLegacy.jsx
// (conte\u00fado permanece igual, apenas nome do arquivo mudou)

const KanbanLegacy = () => {
  // ... c\u00f3digo atual (3 colunas fixas)
};

export default KanbanLegacy;
```

---

### 2.2. Criar Kanban V2

**Passo 1:** Criar novo arquivo

```bash
touch /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/Kanban/index.js
```

**Passo 2:** Implementar Kanban V2 (com react-trello)

```javascript
// frontend/src/pages/Kanban/index.js
import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
// ... imports (ver frontend-plan.md)

const Kanban = () => {
  // ... implementa\u00e7\u00e3o completa (ver component-specs.md)
};

export default Kanban;
```

---

### 2.3. Atualizar TagsKanban

**Passo 1:** Substituir mensagem de manuten\u00e7\u00e3o

```bash
# Fazer backup
cp /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/TagsKanban/index.js \
   /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/TagsKanban/index.js.backup

# Portar de refer\u00eancia
cp /Users/brunovilefort/Desktop/chatia-final/chatia/chatia/frontend/src/pages/TagsKanban/index.js \
   /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/TagsKanban/index.js
```

**Passo 2:** Ajustar imports (se paths divergirem)

---

## 3. Uso nas Rotas

### 3.1. Atualizar routes/index.js

**Localiza\u00e7\u00e3o:** `frontend/src/routes/index.js`

**Mudan\u00e7as:**

```javascript
// frontend/src/routes/index.js
import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { FEATURES } from "../config/featureFlags";

// Importar ambas vers\u00f5es
import Kanban from "../pages/Kanban"; // V2 (DnD)
import KanbanLegacy from "../pages/Kanban/KanbanLegacy"; // Legacy (3 colunas)
import TagsKanban from "../pages/TagsKanban";

// ... outras rotas

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        {/* ... outras rotas */}

        {/* Kanban: Condicional baseado em feature flag */}
        {FEATURES.KANBAN_V2 ? (
          <Route exact path="/kanban" component={Kanban} isPrivate />
        ) : (
          <Route exact path="/kanban" component={KanbanLegacy} isPrivate />
        )}

        {/* TagsKanban: S\u00f3 dispon\u00edvel se V2 ativo */}
        {FEATURES.KANBAN_V2 && (
          <Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
        )}

        {/* ... outras rotas */}
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
```

---

### 3.2. Atualizar Menu Lateral (Opcional)

Se houver item de menu "Tags Kanban", esconder quando V2 desabilitado:

```javascript
// frontend/src/components/MainMenu/index.js (ou similar)
import { FEATURES } from "../../config/featureFlags";

const MainMenu = () => {
  return (
    <List>
      {/* ... outros itens */}

      <ListItem button onClick={() => history.push('/kanban')}>
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        <ListItemText primary="Kanban" />
      </ListItem>

      {/* Tags Kanban: S\u00f3 exibir se V2 ativo */}
      {FEATURES.KANBAN_V2 && (
        <ListItem button onClick={() => history.push('/tagsKanban')}>
          <ListItemIcon><LabelIcon /></ListItemIcon>
          <ListItemText primary="Tags Kanban" />
        </ListItem>
      )}

      {/* ... outros itens */}
    </List>
  );
};
```

---

## 4. Testes Locais

### 4.1. Testar com V2 Desabilitado (Default)

**Passo 1:** Garantir que .env tem flag desabilitada

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend

# Verificar .env
cat .env | grep FEATURE_KANBAN_V2
# Output esperado: REACT_APP_FEATURE_KANBAN_V2=false (ou vazio)
```

**Passo 2:** Iniciar frontend

```bash
npm start
```

**Passo 3:** Validar comportamento

- Acessar http://localhost:3000/kanban
- Deve exibir **KanbanLegacy** (3 colunas fixas: pending, open, closed)
- Acessar http://localhost:3000/tagsKanban
- Deve retornar **404 ou redirecionar** (rota n\u00e3o renderizada)

---

### 4.2. Testar com V2 Habilitado

**Passo 1:** Habilitar flag

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend

# Adicionar/atualizar .env
echo "REACT_APP_FEATURE_KANBAN_V2=true" >> .env
```

**Passo 2:** Reiniciar frontend

```bash
# Parar processo anterior (Ctrl+C)
npm start
```

**IMPORTANTE:** React requer restart para ler novas vari\u00e1veis de ambiente.

**Passo 3:** Validar comportamento

- Acessar http://localhost:3000/kanban
- Deve exibir **Kanban V2** (Board com react-trello, filtros de data)
- Acessar http://localhost:3000/tagsKanban
- Deve exibir **TagsKanban** (CRUD de tags Kanban)

**Passo 4:** Testar Drag-and-Drop

- Criar tags em /tagsKanban (ex: "Aguardando", "Em Atendimento")
- Voltar para /kanban
- Arrastar ticket de uma lane para outra
- Validar toast de sucesso
- Validar atualiza\u00e7\u00e3o real-time (abrir em 2 abas)

---

### 4.3. Testar Toggle

**Objetivo:** Garantir que alternar flag n\u00e3o quebra aplica\u00e7\u00e3o.

```bash
# Terminal 1: Frontend rodando
npm start

# Terminal 2: Alternar flag
echo "REACT_APP_FEATURE_KANBAN_V2=false" > .env

# Terminal 1: Restart
# (Ctrl+C e npm start novamente)

# Validar: Agora deve exibir KanbanLegacy
# Alternar novamente para true
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env

# Restart e validar V2
```

---

## 5. Deploy e Rollback

### 5.1. Deploy com Feature Desabilitada (Seguran\u00e7a)

**Objetivo:** Garantir que c\u00f3digo novo n\u00e3o quebra sistema em prod.

**Passo 1:** Build com flag=false

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend

# Garantir .env.production tem flag desabilitada
echo "REACT_APP_FEATURE_KANBAN_V2=false" > .env.production

# Build
npm run build
```

**Passo 2:** Deploy

```bash
# Upload da pasta build/ para servidor
rsync -avz build/ user@production-server:/var/www/chatia-frontend/

# Ou via CI/CD pipeline
git add .
git commit -m "feat(kanban): Adiciona Kanban V2 (desabilitado por feature flag)"
git push origin main
```

**Passo 3:** Validar em Produ\u00e7\u00e3o

- Acessar https://app.chatia.com/kanban
- Deve exibir **KanbanLegacy** (3 colunas fixas)
- Sistema funciona normalmente

---

### 5.2. Habilitar Gradualmente (Canary Deploy)

**Fase 1: Staging (100%)**

```bash
# Em servidor staging
cd /var/www/chatia-frontend
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env
npm run build
pm2 restart chatia-frontend
```

**Valida\u00e7\u00e3o:**
- Testar DnD
- Testar Socket.IO real-time
- Testar filtros de data
- Testar multi-tenant (logins diferentes)

**Fase 2: Produ\u00e7\u00e3o (10%)**

**Op\u00e7\u00e3o A (Simples):** Habilitar para todos

```bash
# Servidor produ\u00e7\u00e3o
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env.production
npm run build
pm2 restart chatia-frontend
```

**Op\u00e7\u00e3o B (Avan\u00e7ado):** Habilitar por companyId

**Nota:** Requer backend feature flag (n\u00e3o implementado neste plano).

```javascript
// frontend/src/config/featureFlags.js (avan\u00e7ado)
export const FEATURES = {
  KANBAN_V2: (() => {
    const envFlag = process.env.REACT_APP_FEATURE_KANBAN_V2 === 'true';
    const allowedCompanies = [1, 5, 10]; // IDs piloto

    // Obter companyId do usu\u00e1rio logado
    const userCompanyId = parseInt(localStorage.getItem('companyId') || '0');

    return envFlag && allowedCompanies.includes(userCompanyId);
  })()
};
```

**Fase 3: Produ\u00e7\u00e3o (100%)**

```bash
# Ap\u00f3s valida\u00e7\u00e3o bem-sucedida (1-2 semanas)
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env.production
npm run build
pm2 restart chatia-frontend
```

**Fase 4: Cleanup (Remover Legacy)**

```bash
# Ap\u00f3s 2 semanas de 100% estabilidade
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend/src/pages/Kanban

# Remover arquivo legacy
rm KanbanLegacy.jsx

# Remover condicional nas rotas
# (editar routes/index.js manualmente)

# Remover feature flag
# (editar config/featureFlags.js manualmente)

# Commit
git add .
git commit -m "chore(kanban): Remove Kanban Legacy ap\u00f3s rollout completo V2"
git push origin main
```

---

### 5.3. Rollback Instant\u00e2neo

**Cen\u00e1rio:** Bug cr\u00edtico detectado em produ\u00e7\u00e3o.

**Sintomas:**
- Taxa de erro > 1%
- DnD n\u00e3o funciona
- Socket.IO desconectando
- Usu\u00e1rios reportando problemas

**Procedimento de Rollback (< 5 minutos):**

**Passo 1:** Desabilitar feature flag

```bash
# SSH em servidor produ\u00e7\u00e3o
ssh user@production-server

cd /var/www/chatia-frontend

# Desabilitar flag
sed -i 's/REACT_APP_FEATURE_KANBAN_V2=true/REACT_APP_FEATURE_KANBAN_V2=false/' .env.production

# Rebuild
npm run build

# Restart
pm2 restart chatia-frontend
```

**Passo 2:** Validar rollback

```bash
# Verificar que KanbanLegacy voltou
curl https://app.chatia.com/kanban
# Deve retornar HTML com c\u00f3digo KanbanLegacy
```

**Passo 3:** Notificar time

```
Slack: @channel Kanban V2 desabilitado devido a [bug cr\u00edtico].
Sistema voltou ao normal (KanbanLegacy ativo).
Incident ticket criado: #123
```

**Passo 4:** Investigar causa raiz

- Revisar logs: `pm2 logs chatia-frontend --lines 500 --err`
- Reproduzir problema em staging
- Aplicar hotfix
- Testar em staging
- Re-ativar feature flag ap\u00f3s valida\u00e7\u00e3o

---

## 6. Checklist de Valida\u00e7\u00e3o

### 6.1. Antes de Deploy

- [ ] Arquivo `config/featureFlags.js` criado
- [ ] Vari\u00e1vel `REACT_APP_FEATURE_KANBAN_V2` em `.env`
- [ ] Rotas condicionais implementadas (`routes/index.js`)
- [ ] `KanbanLegacy.jsx` existe (renomeado)
- [ ] `Kanban/index.js` V2 implementado
- [ ] `TagsKanban/index.js` portado da refer\u00eancia
- [ ] Testes unit\u00e1rios passando
- [ ] Testes E2E passando

### 6.2. Ap\u00f3s Deploy (Staging)

- [ ] KanbanLegacy acess\u00edvel com flag=false
- [ ] Kanban V2 acess\u00edvel com flag=true
- [ ] DnD funciona entre lanes
- [ ] Socket.IO atualiza em real-time
- [ ] Filtros de data funcionam
- [ ] TagsKanban CRUD funciona
- [ ] Multi-tenant validado (2+ empresas)
- [ ] Performance aceit\u00e1vel (< 2s load time)

### 6.3. Ap\u00f3s Rollout (Produ\u00e7\u00e3o)

- [ ] M\u00e9tricas de erro < 0.1%
- [ ] Feedback de usu\u00e1rios positivo
- [ ] Performance mantida
- [ ] Socket.IO est\u00e1vel
- [ ] NENHUM incident reportado por 2 semanas
- [ ] Pronto para remover legacy

---

## 7. Troubleshooting

### Problema: Flag n\u00e3o muda mesmo ap\u00f3s alterar .env

**Causa:** React n\u00e3o recarrega vari\u00e1veis de ambiente em hot-reload.

**Solu\u00e7\u00e3o:**
```bash
# Parar frontend
Ctrl+C

# Reiniciar
npm start
```

---

### Problema: Build em produ\u00e7\u00e3o usa .env (n\u00e3o .env.production)

**Causa:** .env.production n\u00e3o est\u00e1 presente ou mal configurado.

**Solu\u00e7\u00e3o:**
```bash
# Criar .env.production
echo "REACT_APP_FEATURE_KANBAN_V2=false" > .env.production

# Build (usar .env.production)
NODE_ENV=production npm run build
```

---

### Problema: TagsKanban retorna 404 mesmo com flag=true

**Causa:** Rota condicional n\u00e3o implementada corretamente.

**Solu\u00e7\u00e3o:**
Verificar `routes/index.js`:
```javascript
// CORRETO
{FEATURES.KANBAN_V2 && (
  <Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
)}

// INCORRETO (sem condicional)
<Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
```

---

### Problema: Console mostra "FEATURES is not defined"

**Causa:** Import de `featureFlags.js` faltando.

**Solu\u00e7\u00e3o:**
```javascript
// Adicionar import
import { FEATURES } from "../config/featureFlags";
```

---

## 8. M\u00e9tricas de Monitoramento

### KPIs a Observar

```yaml
- name: kanban_feature_flag_status
  type: gauge
  labels: [version]
  description: "0 = Legacy, 1 = V2"
  query: "process.env.REACT_APP_FEATURE_KANBAN_V2 === 'true' ? 1 : 0"

- name: kanban_page_loads
  type: counter
  labels: [version]
  description: "Total de carregamentos da p\u00e1gina Kanban"

- name: kanban_dnd_moves
  type: counter
  labels: [success, error]
  description: "Total de opera\u00e7\u00f5es de DnD"

- name: kanban_socket_disconnects
  type: counter
  description: "Total de desconex\u00f5es Socket.IO"
```

### Alertas

```yaml
- alert: KanbanV2HighErrorRate
  expr: "rate(kanban_dnd_moves{error='true'}[5m]) > 0.01"
  severity: critical
  message: "Kanban V2 error rate > 1%"

- alert: KanbanV2HighDisconnects
  expr: "rate(kanban_socket_disconnects[5m]) > 0.05"
  severity: warning
  message: "Kanban V2 Socket.IO disconnect rate > 5%"
```

---

## Conclus\u00e3o

A feature flag `REACT_APP_FEATURE_KANBAN_V2` permite:

1. **Deploy Seguro:** C\u00f3digo novo em prod, mas desabilitado
2. **Testes em Staging:** Habilitar sem afetar prod
3. **Rollout Gradual:** 10% → 50% → 100%
4. **Rollback Instant\u00e2neo:** Desabilitar em < 5 minutos
5. **Cleanup Final:** Remover legacy ap\u00f3s estabiliza\u00e7\u00e3o

**Pr\u00f3ximos Passos:**
1. Implementar Commit 1 (Setup e Feature Flag)
2. Testar localmente com flag ON/OFF
3. Deploy em staging com flag=true
4. Validar todos os cen\u00e1rios
5. Rollout gradual em produ\u00e7\u00e3o

---

**Documento Criado por:** Frontend Architecture Planner
**Data:** 2025-10-13
**Vers\u00e3o:** 1.0
