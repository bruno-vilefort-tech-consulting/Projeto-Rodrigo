# Kanban V2 Rollback Plan

## Overview

Plano de rollback estruturado em 3 cenários de severidade para garantir resposta rápida a incidentes durante o rollout do Kanban V2.

**RTO (Recovery Time Objective):** < 5 minutos para bugs críticos
**RPO (Recovery Point Objective):** Zero data loss

---

## Scenario 1: Bug Crítico (Severity P0)

**Trigger:** Sistema completamente inoperante para Kanban
**Examples:**
- Aplicação crashando ao abrir tickets
- Socket.IO não conecta em nenhuma company
- Data corruption detectada
- Security vulnerability crítica

**Impact:** Alta - Usuários não conseguem trabalhar
**RTO:** < 5 minutos

### Immediate Actions (0-5 min)

```bash
# 1. STOP THE WORLD - Desabilitar feature flag globalmente
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'false'
)
WHERE COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean = true;
"

# 2. Verificar desabilitação
psql -U postgres -d chatia_db -c "
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN COALESCE(settings->>'kanbanV2Enabled', 'false')::boolean THEN 1 ELSE 0 END) as enabled
FROM Companies;
"
# Expected: enabled = 0

# 3. Limpar cache (se aplicável)
redis-cli FLUSHDB

# 4. Verificar aplicação respondendo
curl -X GET https://api.chatia.com/health
# Expected: 200 OK

# 5. Notificar time
# Slack: #incidents
# "🚨 P0: Kanban V2 desabilitado globalmente. Investigando causa raiz."
```

### Validation (5-10 min)

```bash
# Verificar métricas voltaram ao normal
curl -X GET https://api.chatia.com/metrics | jq '.errorRate'
# Expected: < 0.1%

# Verificar logs
pm2 logs --lines 100 | grep -i error | wc -l
# Expected: < 5 errors

# Testar manualmente
# 1. Login no sistema
# 2. Abrir ticket
# 3. Verificar Kanban V1 funcionando
```

### Communication Template

```markdown
**INCIDENT RESOLVED**

**Issue:** Kanban V2 apresentou bug crítico
**Impact:** [X] companies afetadas por [Y] minutos
**Action:** Feature desabilitada globalmente via feature flag
**Status:** Sistema operacional (Kanban V1)
**Next Steps:** Root cause analysis + correção + novo rollout

**Timeline:**
- HH:MM - Incidente detectado
- HH:MM - Feature flag desabilitada
- HH:MM - Sistema validado e operacional

**Affected Users:** [Número estimado]
```

### Follow-up Actions (< 1 hour)

- [ ] Root cause analysis iniciado
- [ ] Incident report documentado
- [ ] Fix implementado e testado
- [ ] Post-mortem agendado (24-48h)
- [ ] Comunicação para usuários afetados

---

## Scenario 2: Performance Degradation (Severity P1)

**Trigger:** Performance degradada mas sistema operacional
**Examples:**
- Socket.IO com alta latência (> 1s)
- DnD com delay perceptível (> 500ms)
- Database queries lentas (> 5s)
- Memory leak detectado

**Impact:** Média - Usuários conseguem trabalhar mas com frustração
**RTO:** < 30 minutos

### Immediate Actions (0-10 min)

```bash
# 1. Identificar companies mais afetadas
psql -U postgres -d chatia_db -c "
SELECT
  el.companyId,
  c.name,
  COUNT(*) as error_count,
  AVG(EXTRACT(EPOCH FROM (el.createdAt - LAG(el.createdAt) OVER (PARTITION BY el.companyId ORDER BY el.createdAt)))) as avg_time_between_errors
FROM ErrorLogs el
JOIN Companies c ON c.id = el.companyId
WHERE
  el.createdAt > NOW() - INTERVAL '1 hour'
  AND el.context LIKE '%kanban%'
GROUP BY el.companyId, c.name
HAVING COUNT(*) > 10
ORDER BY error_count DESC
LIMIT 20;
"

# 2. Rollback seletivo (top 20 companies com mais erros)
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'false')
WHERE id IN (
  SELECT companyId
  FROM ErrorLogs
  WHERE
    createdAt > NOW() - INTERVAL '1 hour'
    AND context LIKE '%kanban%'
  GROUP BY companyId
  HAVING COUNT(*) > 10
  ORDER BY COUNT(*) DESC
  LIMIT 20
);
"

# 3. Verificar melhoria
# Aguardar 5 minutos e verificar métricas
sleep 300
curl -X GET https://api.chatia.com/metrics/performance | jq
```

### Investigation (10-20 min)

```bash
# Verificar métricas de performance
# 1. Database query performance
psql -U postgres -d chatia_db -c "
SELECT
  query,
  calls,
  total_time / calls as avg_time_ms,
  min_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%Tag%' OR query LIKE '%Ticket%'
ORDER BY total_time DESC
LIMIT 10;
"

# 2. Memory usage
pm2 monit

# 3. Redis performance
redis-cli INFO stats | grep -E "(ops_per_sec|used_memory_human)"

# 4. Socket.IO connections
pm2 logs | grep -i "socket" | tail -50
```

### Decision Matrix (20-30 min)

| Condition | Action |
|-----------|--------|
| Performance melhorou após rollback seletivo | Manter rollback parcial, investigar root cause |
| Performance ainda degradada | Escalar para Scenario 1 (rollback total) |
| Performance OK mas instável | Pausar rollout, não habilitar novas companies |

### Communication Template

```markdown
**PERFORMANCE ISSUE - PARTIALLY RESOLVED**

**Issue:** Performance degradation no Kanban V2
**Impact:** [X] companies com lentidão
**Action:** Rollback seletivo para [Y] companies mais afetadas
**Status:** Performance normalizada para 95% dos usuários
**ETA Full Resolution:** [X] horas

**What we're doing:**
1. Investigating root cause
2. Monitoring remaining companies
3. Preparing hotfix if needed
```

---

## Scenario 3: Data Corruption (Severity P0 Critical)

**Trigger:** Perda ou corrupção de dados detectada
**Examples:**
- Tags sendo deletadas acidentalmente
- Tickets mudando de lane sem ação do usuário
- Ordens de tickets sendo embaralhadas
- Dados duplicados

**Impact:** CRÍTICA - Integridade dos dados comprometida
**RTO:** IMEDIATO (< 2 minutos)

### IMMEDIATE STOP (0-2 min)

```bash
# 1. PARAR TUDO IMEDIATAMENTE
# DESABILITAR FEATURE FLAG GLOBALMENTE
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{kanbanV2Enabled}',
  'false'
);
"

# 2. BLOQUEAR WRITES NO KANBAN (emergency circuit breaker)
# Adicionar flag no Redis para bloquear operações
redis-cli SET kanban:emergency:write-block "true" EX 3600

# 3. DUMP DATABASE ESTADO ATUAL
pg_dump -U postgres -d chatia_db -t Tags -t Tickets -t TicketTags \
  -f /tmp/kanban_emergency_dump_$(date +%Y%m%d_%H%M%S).sql

# 4. NOTIFICAÇÃO CRÍTICA
# Slack: @channel no #incidents
# Email: tech-leads + CEO + CTO
# Status Page: Maintenance mode
```

### Assessment (2-15 min)

```sql
-- Verificar extensão da corrupção
-- 1. Tags órfãs (sem company)
SELECT COUNT(*) as orphan_tags
FROM Tags
WHERE companyId IS NULL OR companyId NOT IN (SELECT id FROM Companies);

-- 2. Tickets com lanes inválidas
SELECT COUNT(*) as invalid_lanes
FROM Tickets
WHERE
  kanbanLane IS NOT NULL
  AND kanbanLane NOT IN (
    SELECT id FROM Lanes WHERE companyId = Tickets.companyId
  );

-- 3. Duplicates
SELECT tagId, ticketId, COUNT(*)
FROM TicketTags
GROUP BY tagId, ticketId
HAVING COUNT(*) > 1;

-- 4. Timeline para entender quando começou
SELECT
  DATE_TRUNC('hour', createdAt) as hour,
  COUNT(*) as records_created
FROM Tags
WHERE createdAt > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour;
```

### Data Recovery (15-60 min)

```sql
-- OPÇÃO 1: Restaurar do último backup (se corrupção massiva)
-- Coordenar com DBA
-- 1. Identificar último backup antes da corrupção
-- 2. Restaurar apenas tabelas afetadas (Tags, TicketTags)
-- 3. Verificar integridade

-- OPÇÃO 2: Limpeza cirúrgica (se corrupção localizada)
BEGIN;

-- Remover duplicatas
DELETE FROM TicketTags
WHERE id NOT IN (
  SELECT MIN(id)
  FROM TicketTags
  GROUP BY tagId, ticketId
);

-- Remover tags órfãs
DELETE FROM Tags
WHERE companyId IS NULL OR companyId NOT IN (SELECT id FROM Companies);

-- Corrigir lanes inválidas
UPDATE Tickets
SET kanbanLane = NULL
WHERE
  kanbanLane IS NOT NULL
  AND kanbanLane NOT IN (
    SELECT id FROM Lanes WHERE companyId = Tickets.companyId
  );

-- VALIDAR antes de commit
SELECT 'Tags órfãs' as check, COUNT(*) FROM Tags WHERE companyId IS NULL;
SELECT 'Duplicatas' as check, COUNT(*) FROM (
  SELECT tagId, ticketId FROM TicketTags GROUP BY tagId, ticketId HAVING COUNT(*) > 1
) sub;

-- Se tudo OK:
COMMIT;
-- Se algo errado:
-- ROLLBACK;
```

### Validation (60-90 min)

```bash
# 1. Verificar integridade do banco
psql -U postgres -d chatia_db -c "
SELECT
  (SELECT COUNT(*) FROM Tags) as total_tags,
  (SELECT COUNT(*) FROM Tags WHERE companyId IS NULL) as orphan_tags,
  (SELECT COUNT(*) FROM TicketTags) as total_ticket_tags,
  (SELECT COUNT(*) FROM (
    SELECT tagId, ticketId FROM TicketTags GROUP BY tagId, ticketId HAVING COUNT(*) > 1
  ) sub) as duplicate_relations;
"

# 2. Testar manualmente em company de teste
# - Criar tag
# - Associar a ticket
# - Drag and drop
# - Verificar que dados persistem corretamente

# 3. Habilitar para 1 company de teste
psql -U postgres -d chatia_db -c "
UPDATE Companies
SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'true')
WHERE id = 'TEST_COMPANY_ID';
"

# 4. Monitorar por 2 horas
# - Logs de erro
# - Integridade de dados
# - Performance
```

### Post-Incident (< 24h)

- [ ] Root cause analysis completo
- [ ] Incident report detalhado
- [ ] Data integrity audit completo
- [ ] Testes de regressão adicionais
- [ ] Code review das mudanças relacionadas
- [ ] Plano de prevenção documentado
- [ ] Comunicação transparente para clientes afetados

### Communication Template

```markdown
**CRITICAL INCIDENT - RESOLVED**

**Issue:** Data corruption detectada no Kanban V2
**Impact:** [X] companies, [Y] registros afetados
**Action:** Feature desabilitada + data recovery executada
**Status:** Dados restaurados, sistema operacional

**What happened:**
[Explicação clara e honesta]

**What we did:**
1. Immediately disabled feature
2. Assessed extent of corruption
3. Recovered data from [backup/cleanup]
4. Validated data integrity

**What we're doing to prevent this:**
[Lista de ações preventivas]

**Timeline:**
- HH:MM - Corruption detected
- HH:MM - Feature disabled + write block
- HH:MM - Recovery started
- HH:MM - Data validated
- HH:MM - System restored

**Affected Data:**
- Tags: [X] records
- Tickets: [Y] records
- Companies: [Z] affected

**We sincerely apologize for this incident.**
```

---

## Rollback Decision Tree

```
Incident Detected
    |
    ├─ Data Corruption? ──YES──> SCENARIO 3 (Immediate Stop)
    |
    ├─ System Down? ──YES──> SCENARIO 1 (< 5min rollback)
    |
    └─ Performance Issue? ──YES──> SCENARIO 2 (< 30min selective rollback)
         |
         ├─ Affects > 50% companies? ──YES──> Escalate to SCENARIO 1
         └─ Affects < 50% companies? ──YES──> Continue SCENARIO 2
```

---

## Rollback Checklist

### Pre-Rollback
- [ ] Incident severity confirmed
- [ ] On-call engineer notified
- [ ] Incident channel created (#incident-YYYYMMDD-HHMM)
- [ ] Stakeholders notified
- [ ] Database backup confirmed recent (< 1h)

### During Rollback
- [ ] Feature flag disabled (or selective)
- [ ] Cache cleared if needed
- [ ] System health verified
- [ ] Error rate monitored
- [ ] Users notified (if P0)

### Post-Rollback
- [ ] System stable for 30+ minutes
- [ ] Metrics back to normal
- [ ] Incident timeline documented
- [ ] Root cause identified
- [ ] Fix planned and estimated
- [ ] Post-mortem scheduled

---

## Contact List

| Role | Primary | Secondary | Phone |
|------|---------|-----------|-------|
| On-Call Engineer | - | - | - |
| DBA | - | - | - |
| DevOps Lead | - | - | - |
| CTO | - | - | - |
| Product Manager | - | - | - |

---

## Tools & Access

```bash
# Database Access
ssh production-db-primary
psql -U postgres -d chatia_db

# Application Logs
ssh production-app-1
pm2 logs

# Metrics Dashboard
https://grafana.chatia.com/d/kanban-v2

# Redis
ssh production-redis
redis-cli

# Slack Channels
#incidents - Critical incidents
#kanban-v2-rollout - Rollout updates
#engineering - General engineering

# Runbook Location
/opt/chatia/runbooks/kanban-v2-rollback.md
```

---

## Testing Rollback Procedure

**Important:** Test rollback procedure in staging BEFORE production rollout

```bash
# Staging environment test
# 1. Enable Kanban V2 in staging
# 2. Create test data
# 3. Execute rollback procedure
# 4. Verify data integrity
# 5. Verify system functionality
# 6. Document timing and any issues

# Record actual timings:
# - Time to disable feature flag: [X] seconds
# - Time to verify: [Y] seconds
# - Total rollback time: [Z] seconds
```

---

## Lessons Learned Template

```markdown
## Incident Post-Mortem: [Date]

**Incident ID:** INC-YYYYMMDD-XXX
**Severity:** P0/P1/P2
**Duration:** [X] minutes
**Affected Users:** [Y]

### Timeline
- HH:MM - [Event]
- HH:MM - [Action]

### Root Cause
[Detailed explanation]

### What Went Well
- [List]

### What Could Be Improved
- [List]

### Action Items
- [ ] [Action] - Owner: [Name] - Due: [Date]
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Owner:** Engineering Team
**Review Frequency:** After each incident or quarterly
