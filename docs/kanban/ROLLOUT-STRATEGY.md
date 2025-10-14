# Kanban V2 Rollout Strategy

## Overview

Estratégia de deploy gradual em 6 fases para minimizar riscos e garantir estabilidade na migração do Kanban V2 para produção.

**Timeline Total:** 4-6 semanas
**Rollback Window:** < 5 minutos em qualquer fase
**Success Criteria:** Error rate < 0.1%, Socket disconnect rate < 1%

---

## Phase 1: Deploy Dark Launch (Week 1)

**Objetivo:** Deploy do código com feature flag desabilitada

### Actions

```bash
# 1. Deploy para produção
git checkout main
git pull origin main
npm run build
pm2 restart all

# 2. Verificar que feature flag está OFF
curl -X GET https://api.chatia.com/settings/feature-flags | jq '.kanbanV2Enabled'
# Expected: false

# 3. Verificar logs
pm2 logs --lines 100 | grep -i "kanban"
```

### Success Metrics

- [ ] Deploy sem erros
- [ ] Aplicação responde normalmente
- [ ] Feature flag confirmada como `false`
- [ ] Sem alertas de error rate
- [ ] Rollback testado e funcional

### Rollback

```bash
# Se houver qualquer problema
git checkout <previous-commit>
npm run build
pm2 restart all
```

**Duration:** 3-5 dias de observação

---

## Phase 2: Beta Interna (Week 2)

**Objetivo:** Habilitar para 1 company interna (time de QA)

### Actions

```bash
# 1. Habilitar para company específica
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'true'
)
WHERE id = 'INTERNAL_QA_COMPANY_ID';
"

# 2. Verificar habilitação
psql -U postgres -d chatia_db -c "
SELECT id, name, settings->'kanbanV2Enabled' as kanban_v2
FROM Companies
WHERE id = 'INTERNAL_QA_COMPANY_ID';
"

# 3. Monitorar logs em tempo real
pm2 logs --lines 0 | grep -E "(kanban|socket|tag)"
```

### Test Checklist

- [ ] Login na company de QA
- [ ] Verificar que Kanban V2 está ativo
- [ ] Criar 5 etiquetas de teste
- [ ] Drag and drop de 20 tickets
- [ ] Verificar sincronização multi-usuário
- [ ] Testar em 3 navegadores (Chrome, Firefox, Safari)
- [ ] Testar em mobile (iOS e Android)
- [ ] Verificar performance (< 100ms para DnD)

### Success Metrics

- [ ] Todos os testes passando
- [ ] Zero bugs críticos
- [ ] Socket.IO conectado 100% do tempo
- [ ] Feedback positivo do time de QA
- [ ] Error rate < 0.1%

### Rollback

```bash
# Desabilitar para a company
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'false')
WHERE id = 'INTERNAL_QA_COMPANY_ID';
"
```

**Duration:** 5-7 dias de teste intensivo

---

## Phase 3: Pilot (10%) (Week 3)

**Objetivo:** Expandir para 10% das companies (cherry-picked)

### Selection Criteria

- Companies ativas nos últimos 30 dias
- Menos de 1000 tickets ativos
- Bom histórico de adoção de features
- Sem customizações críticas

### Actions

```sql
-- 1. Identificar companies elegíveis
SELECT
  c.id,
  c.name,
  COUNT(t.id) as ticket_count,
  MAX(t.updatedAt) as last_activity
FROM Companies c
LEFT JOIN Tickets t ON t.companyId = c.id
WHERE c.status = 'active'
GROUP BY c.id, c.name
HAVING
  COUNT(t.id) < 1000
  AND MAX(t.updatedAt) > NOW() - INTERVAL '30 days'
ORDER BY ticket_count ASC
LIMIT 50;

-- 2. Habilitar para 10% (assumindo 500 companies = 50 companies)
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'true'
)
WHERE id IN (
  SELECT id FROM Companies
  WHERE status = 'active'
  ORDER BY RANDOM()
  LIMIT 50
);
```

### Monitoring

```bash
# Dashboard Grafana
# - Ticket update latency by company
# - Socket.IO connection stability
# - Tag operations per minute
# - DnD success rate
# - Error rate by company

# Verificar métricas em tempo real
curl -X GET https://api.chatia.com/metrics/kanban-v2 | jq
```

### Success Metrics

- [ ] Error rate < 0.1% por company
- [ ] Socket disconnect rate < 1%
- [ ] DnD success rate > 99%
- [ ] Menos de 5 tickets de suporte relacionados
- [ ] Feedback NPS > 8/10

### Rollback

```sql
-- Rollback para companies específicas com problemas
UPDATE Companies
SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'false')
WHERE id IN (
  SELECT DISTINCT companyId
  FROM ErrorLogs
  WHERE
    createdAt > NOW() - INTERVAL '1 hour'
    AND message LIKE '%kanban%'
  GROUP BY companyId
  HAVING COUNT(*) > 10
);
```

**Duration:** 7-10 dias

---

## Phase 4: Expansion (50%) (Week 4-5)

**Objetivo:** Expandir para 50% das companies

### Actions

```sql
-- Habilitar gradualmente (10% por dia durante 5 dias)
-- Dia 1: +10% (total 20%)
-- Dia 2: +10% (total 30%)
-- Dia 3: +10% (total 40%)
-- Dia 4: +10% (total 50%)

-- Script para habilitar próximo lote
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'true'
)
WHERE
  id IN (
    SELECT id FROM Companies
    WHERE
      status = 'active'
      AND COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean = false
    ORDER BY RANDOM()
    LIMIT 100
  );
```

### Daily Checklist

- [ ] Verificar error rate (< 0.1%)
- [ ] Verificar tickets de suporte
- [ ] Review de logs de erro
- [ ] Verificar performance metrics
- [ ] Analisar feedback de usuários

### Success Metrics

- [ ] Suporte de tickets < 2% do total
- [ ] Error rate estável
- [ ] Performance estável
- [ ] Sem degradação de infraestrutura
- [ ] CPU e memória dentro dos limites

### Rollback

```sql
-- Rollback parcial ou total
-- Parcial: apenas companies com problemas
UPDATE Companies
SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'false')
WHERE id IN (<list_of_problematic_companies>);

-- Total: desabilitar tudo
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'false'
);
```

**Duration:** 10-14 dias

---

## Phase 5: Full Rollout (100%) (Week 5-6)

**Objetivo:** Habilitar para 100% das companies

### Actions

```sql
-- Habilitar para todas as companies restantes
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'true'
)
WHERE
  status = 'active'
  AND COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean = false;

-- Verificar totais
SELECT
  COUNT(*) as total_companies,
  SUM(CASE WHEN COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean THEN 1 ELSE 0 END) as enabled,
  SUM(CASE WHEN COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean = false THEN 1 ELSE 0 END) as disabled
FROM Companies
WHERE status = 'active';
```

### Communication

- [ ] Anunciar no blog/changelog
- [ ] Email para todos os usuários
- [ ] In-app notification
- [ ] Atualizar documentação
- [ ] Video tutorial

### Success Metrics

- [ ] 100% das companies ativas habilitadas
- [ ] Error rate < 0.1%
- [ ] Tickets de suporte < 1% do total
- [ ] Performance estável
- [ ] Feedback positivo majoritário

**Duration:** 3-5 dias para rollout completo

---

## Phase 6: Cleanup & Stabilization (Week 7-8)

**Objetivo:** Remover código legado após 2 semanas de estabilidade

### Actions

```bash
# 1. Confirmar estabilidade
# - 2 semanas sem incidentes críticos
# - Error rate consistentemente < 0.1%
# - Zero rollbacks necessários

# 2. Remover código legado do Kanban V1
git checkout -b feature/remove-kanban-v1-legacy
# Remover arquivos antigos
# Remover feature flags
# Atualizar documentação

# 3. Remover feature flag do banco
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = settings - 'kanbanV2Enabled';
"

# 4. Deploy final
git add .
git commit -m "feat: Remove Kanban V1 legacy code"
git push origin feature/remove-kanban-v1-legacy
# Criar PR e merge
```

### Final Checklist

- [ ] Código legado removido
- [ ] Feature flags removidas
- [ ] Testes atualizados
- [ ] Documentação atualizada
- [ ] Monitoramento ajustado
- [ ] Alertas atualizados
- [ ] Post-mortem documentado

**Duration:** 5-7 dias

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | - | - |
| DevOps | - | - |
| Product Manager | - | - |
| Support Lead | - | - |

---

## Rollout Dashboard

**URL:** `https://grafana.chatia.com/d/kanban-v2-rollout`

**Key Metrics:**
- Companies with Kanban V2 enabled (%)
- Error rate (rolling 1h avg)
- Socket.IO connection stability
- DnD success rate
- Support tickets related to Kanban
- Performance metrics (p50, p95, p99)

---

## Decision Matrix

| Metric | Green | Yellow | Red | Action |
|--------|-------|--------|-----|--------|
| Error Rate | < 0.1% | 0.1% - 0.5% | > 0.5% | Pause / Rollback |
| Socket Disconnect | < 1% | 1% - 5% | > 5% | Investigate / Rollback |
| Support Tickets | < 2% | 2% - 5% | > 5% | Pause rollout |
| DnD Success | > 99% | 95% - 99% | < 95% | Rollback |
| Performance (p95) | < 100ms | 100-500ms | > 500ms | Investigate |

---

## Notes

- **Sempre** ter DBA disponível durante habilitação de novos lotes
- **Nunca** fazer rollout em sexta-feira ou véspera de feriado
- **Sempre** comunicar com o time de suporte antes de cada fase
- **Manter** canal de Slack dedicado para rollout (#kanban-v2-rollout)
- **Documentar** todos os problemas e resoluções

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Owner:** Engineering Team
