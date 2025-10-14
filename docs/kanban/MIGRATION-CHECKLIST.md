# Kanban V2 Migration Checklist

## Overview

Checklist completo para garantir uma migração segura e bem-sucedida do Kanban V2 para produção.

**Responsável:** Tech Lead + DevOps
**Duração Estimada:** 4-6 semanas
**Última Revisão:** 2025-10-13

---

## Pre-Deployment (1 semana antes)

### Infrastructure

- [ ] **Backup do banco de dados**
  ```bash
  pg_dump -U postgres -d chatia_db -F c -b -v -f backup_$(date +%Y%m%d).dump
  # Verificar backup: pg_restore --list backup_*.dump
  ```
  - Responsável: DBA
  - Validação: Restaurar backup em staging

- [ ] **Verificar espaço em disco**
  ```bash
  df -h
  # Database: > 50% livre
  # Application: > 30% livre
  ```
  - Responsável: DevOps
  - Threshold: > 30% livre

- [ ] **Escalar recursos se necessário**
  - CPU: Adicionar 20% de capacidade
  - RAM: Adicionar 30% de capacidade
  - Database connections: Pool de 5 → 20
  - Responsável: DevOps

- [ ] **Configurar monitoring**
  ```bash
  # Grafana dashboards
  - kanban-v2-overview
  - kanban-v2-performance
  - kanban-v2-rollout

  # Alertas configurados
  - Error rate > 0.5%
  - Socket disconnect > 5%
  - DnD latency > 500ms
  ```
  - Responsável: DevOps
  - Validação: Trigger teste de alerta

- [ ] **Configurar logs estruturados**
  ```bash
  # Winston log levels
  - Production: info, warn, error
  - Staging: debug

  # Log rotation
  - Max size: 100MB
  - Max files: 10
  ```
  - Responsável: Backend Engineer

- [ ] **Configurar Redis cache (opcional)**
  ```bash
  # Install Redis
  apt-get install redis-server

  # Configure
  redis-cli CONFIG SET maxmemory 256mb
  redis-cli CONFIG SET maxmemory-policy allkeys-lru
  ```
  - Responsável: DevOps
  - Verificar: `redis-cli PING` → PONG

- [ ] **Load balancer pronto para WebSocket**
  ```nginx
  # NGINX config
  location /socket.io/ {
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 86400;
  }
  ```
  - Responsável: DevOps
  - Testar: Conexão Socket.IO em staging

- [ ] **Feature flag infrastructure**
  ```sql
  -- Verificar que campo existe
  SELECT settings FROM Companies LIMIT 1;
  -- Expected: {"kanbanV2Enabled": false}
  ```
  - Responsável: Backend Engineer

---

### Database

- [ ] **Rodar migrations em staging**
  ```bash
  cd backend
  NODE_ENV=staging npm run migration:run
  ```
  - Responsável: Backend Engineer
  - Validação: Verificar todas as tabelas criadas

- [ ] **Verificar indexes criados**
  ```sql
  SELECT
    tablename,
    indexname
  FROM pg_indexes
  WHERE tablename IN ('Tags', 'TicketTags', 'Tickets')
  ORDER BY tablename;
  ```
  - Responsável: DBA
  - Esperado: Mínimo 5 indexes

- [ ] **Testar rollback das migrations**
  ```bash
  npm run migration:undo
  npm run migration:run
  ```
  - Responsável: Backend Engineer
  - Validação: Zero erros

- [ ] **Analyze query performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT t.*, array_agg(tg.*) as tags
  FROM Tickets t
  LEFT JOIN TicketTags tt ON tt.ticketId = t.id
  LEFT JOIN Tags tg ON tg.id = tt.tagId
  WHERE t.companyId = 'TEST_COMPANY_ID'
  GROUP BY t.id;
  ```
  - Responsável: DBA
  - Target: < 50ms para 100 tickets

- [ ] **Verificar constraints**
  ```sql
  SELECT
    conname,
    contype,
    conrelid::regclass,
    pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid IN ('Tags'::regclass, 'TicketTags'::regclass);
  ```
  - Responsável: DBA

- [ ] **Verificar foreign keys**
  ```sql
  SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('Tags', 'TicketTags');
  ```
  - Responsável: DBA

- [ ] **Setup database monitoring**
  - pg_stat_statements habilitado
  - Slow query log (> 1s)
  - Connection pool monitoring
  - Responsável: DBA

---

### Code

- [ ] **Pull request aprovado**
  - Code review completo
  - Testes passando
  - Sem conflitos
  - Branch atualizada com main
  - Responsável: Tech Lead

- [ ] **Testes unitários passando**
  ```bash
  npm run test
  # Expected: 100% tests passing
  ```
  - Responsável: QA + Engineers
  - Target: > 80% coverage

- [ ] **Testes de integração passando**
  ```bash
  npm run test:integration
  ```
  - Responsável: QA
  - Cenários críticos testados

- [ ] **Testes E2E passando**
  ```bash
  npm run test:e2e
  ```
  - Responsável: QA
  - Fluxos principais validados

- [ ] **Performance tests**
  ```bash
  # Load test com k6
  k6 run load-test.js
  # Target: < 100ms p95 latency
  ```
  - Responsável: QA
  - 1000 requests/min sem degradação

- [ ] **Security audit**
  ```bash
  npm audit
  npm audit fix
  ```
  - Responsável: Security Team
  - Zero vulnerabilidades críticas

- [ ] **Linting e formatting**
  ```bash
  npm run lint
  npm run format:check
  ```
  - Responsável: Engineers
  - Zero warnings

- [ ] **Build de produção testado**
  ```bash
  npm run build
  # Verificar bundle size
  ls -lh build/
  ```
  - Responsável: Frontend Engineer
  - Bundle < 2MB

---

### Documentation

- [ ] **README atualizado**
  - Instruções de instalação
  - Novos scripts
  - Variáveis de ambiente
  - Responsável: Tech Lead

- [ ] **API documentation atualizada**
  - Swagger/OpenAPI
  - Novos endpoints documentados
  - Exemplos de uso
  - Responsável: Backend Engineer

- [ ] **Database schema documentado**
  - ERD atualizado
  - Relacionamentos claros
  - Constraints documentadas
  - Responsável: DBA

- [ ] **Runbooks criados**
  - [ ] ROLLOUT-STRATEGY.md
  - [ ] ROLLBACK-PLAN.md
  - [ ] MONITORING.md
  - [ ] TROUBLESHOOTING.md
  - [ ] USER-GUIDE.md
  - Responsável: Tech Lead

- [ ] **Changelog atualizado**
  - Versão 2.0.0
  - Breaking changes
  - Novas features
  - Bug fixes
  - Responsável: Product Manager

---

### Team Preparation

- [ ] **DevOps treinado**
  - Rollout procedure
  - Rollback procedure
  - Monitoring dashboards
  - Troubleshooting guide
  - Responsável: Tech Lead

- [ ] **Support team treinado**
  - Novas features
  - Como habilitar/desabilitar
  - Troubleshooting básico
  - Escalation path
  - Responsável: Support Lead

- [ ] **QA team treinado**
  - Test cases atualizados
  - Smoke tests preparados
  - Regression test suite
  - Responsável: QA Lead

- [ ] **On-call schedule definido**
  - Engenheiro de plantão 24/7
  - Backup on-call
  - Escalation contacts
  - Responsável: Engineering Manager

---

## Deployment (Deploy day)

### Pre-Deploy Checks (08:00 - 09:00)

- [ ] **Status meeting**
  - Time reunido
  - Go/No-Go decision
  - Responsável: Tech Lead

- [ ] **Verificar que é dia útil**
  - Segunda a quinta (nunca sexta!)
  - Não é véspera de feriado
  - Time completo disponível

- [ ] **Backup final do banco**
  ```bash
  pg_dump -U postgres -d chatia_db -F c -b -v \
    -f backup_predeploy_$(date +%Y%m%d_%H%M%S).dump
  ```
  - Responsável: DBA
  - Guardar por 90 dias

- [ ] **Verificar health dos serviços**
  ```bash
  curl http://localhost:8080/health
  # Expected: 200 OK

  pm2 status
  # All processes: online

  systemctl status postgresql
  systemctl status nginx
  ```
  - Responsável: DevOps

- [ ] **Notificar stakeholders**
  - "Deploy iniciando às 09:00"
  - ETA: 10:00
  - Slack: #engineering, #product
  - Responsável: Tech Lead

- [ ] **Ativar modo de manutenção (se necessário)**
  ```bash
  # Apenas se deploy requer downtime
  touch /var/www/chatia/maintenance.flag
  ```
  - Responsável: DevOps

---

### Deploy (09:00 - 10:00)

- [ ] **Merge para main**
  ```bash
  git checkout main
  git pull origin main
  git merge feature/kanban-v2
  git push origin main
  ```
  - Responsável: Tech Lead

- [ ] **Deploy backend**
  ```bash
  # Em produção
  cd /opt/chatia/backend
  git pull origin main
  npm install --production
  npm run build
  ```
  - Responsável: DevOps

- [ ] **Rodar migrations em produção**
  ```bash
  NODE_ENV=production npm run migration:run
  # Verificar output: 0 errors
  ```
  - Responsável: DBA + Backend Engineer
  - Rollback pronto se falhar

- [ ] **Restart backend**
  ```bash
  pm2 restart backend
  pm2 logs backend --lines 50
  # Verificar: "Server started" sem erros
  ```
  - Responsável: DevOps

- [ ] **Deploy frontend**
  ```bash
  cd /opt/chatia/frontend
  git pull origin main
  npm install --production
  npm run build
  ```
  - Responsável: DevOps

- [ ] **Aplicar fix crítico de Socket.IO**
  ```bash
  cd /opt/chatia
  bash scripts/fix-socket-namespace.sh
  # Verificar output: "✅ Fixed"
  ```
  - Responsável: Backend Engineer
  - IMPORTANTE: Rodar antes de restart

- [ ] **Rebuild frontend com fix**
  ```bash
  cd /opt/chatia/frontend
  npm run build
  ```
  - Responsável: DevOps

- [ ] **Deploy frontend build**
  ```bash
  rsync -avz build/ /var/www/chatia/
  # Ou com CDN:
  aws s3 sync build/ s3://chatia-frontend/ --delete
  aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
  ```
  - Responsável: DevOps

---

## Post-Deployment (D-Day)

### Immediate Checks (10:00 - 10:30)

- [ ] **Smoke tests**
  ```bash
  # Testar endpoints críticos
  curl https://api.chatia.com/health
  curl https://api.chatia.com/api/companies
  curl https://api.chatia.com/api/tickets
  ```
  - Responsável: QA
  - Expected: Todos 200 OK

- [ ] **Verificar feature flag**
  ```sql
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN settings->>'kanbanV2Enabled' = 'true' THEN 1 ELSE 0 END) as enabled
  FROM Companies;
  ```
  - Responsável: Backend Engineer
  - Expected: enabled = 0 (dark launch)

- [ ] **Verificar logs sem erros críticos**
  ```bash
  pm2 logs | grep -i error | tail -50
  ```
  - Responsável: DevOps
  - Expected: Sem novos erros relacionados a Kanban

- [ ] **Verificar métricas baseline**
  - Error rate: < 0.1%
  - Response time p95: < 200ms
  - Memory usage: < 70%
  - CPU usage: < 60%
  - Responsável: DevOps

- [ ] **Testar rollback procedure**
  ```bash
  # Em staging
  bash scripts/rollback.sh
  # Verificar: Sistema volta ao estado anterior
  ```
  - Responsável: DevOps

- [ ] **Desativar modo de manutenção**
  ```bash
  rm /var/www/chatia/maintenance.flag
  ```
  - Responsável: DevOps

- [ ] **Notificar sucesso do deploy**
  - Slack: #engineering
  - "✅ Deploy completo, sistema operacional"
  - Responsável: Tech Lead

---

### Monitoring Day 1 (10:30 - 18:00)

- [ ] **Monitorar dashboards a cada 30min**
  - Grafana: kanban-v2-overview
  - Error rate
  - Response time
  - Database performance
  - Responsável: DevOps (rotativo)

- [ ] **Verificar logs a cada hora**
  ```bash
  # Erros
  pm2 logs | grep -i error | tail -100

  # Warnings
  pm2 logs | grep -i warn | tail -100

  # Socket.IO
  pm2 logs | grep -i socket | tail -50
  ```
  - Responsável: On-call engineer

- [ ] **Verificar tickets de suporte**
  - Novos tickets relacionados a Kanban
  - Severity e frequência
  - Responsável: Support Lead

- [ ] **Database health check**
  ```sql
  -- Conexões ativas
  SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

  -- Queries lentas
  SELECT * FROM pg_stat_statements
  WHERE mean_time > 1000
  ORDER BY mean_time DESC LIMIT 5;

  -- Lock waits
  SELECT * FROM pg_locks WHERE NOT granted;
  ```
  - Responsável: DBA

- [ ] **End of day report**
  - Resumo do dia
  - Métricas principais
  - Issues encontrados
  - Ações para amanhã
  - Responsável: Tech Lead

---

### Week 1 Stabilization

- [ ] **Daily health checks**
  - [ ] Segunda
  - [ ] Terça
  - [ ] Quarta
  - [ ] Quinta
  - [ ] Sexta
  - Checklist: Metrics, logs, support tickets
  - Responsável: On-call engineer

- [ ] **Database performance review**
  - Slow queries identificadas
  - Indexes adicionados se necessário
  - Query optimization
  - Responsável: DBA

- [ ] **Support tickets review**
  - Padrões identificados
  - FAQs atualizadas
  - Bugs críticos resolvidos
  - Responsável: Support Lead

- [ ] **Capacity planning**
  - Uso de CPU/RAM trend
  - Database growth rate
  - Planejar scale up se necessário
  - Responsável: DevOps

- [ ] **Retrospective meeting**
  - O que foi bem
  - O que pode melhorar
  - Action items
  - Responsável: Tech Lead

---

## Rollout (Semanas 2-6)

### Phase 1: Dark Launch (Week 2)

- [ ] **Confirmar estabilidade**
  - 7 dias sem incidentes críticos
  - Error rate < 0.1%
  - Zero rollbacks necessários
  - Responsável: Tech Lead

- [ ] **Documentar baseline metrics**
  - Error rate: [X]%
  - Response time p95: [Y]ms
  - Active users: [Z]
  - Responsável: DevOps

---

### Phase 2: Beta Interna (Week 2-3)

- [ ] **Selecionar company de teste**
  - Company interna (QA team)
  - Poucos tickets (< 100)
  - Team tech-savvy
  - Responsável: Product Manager

- [ ] **Habilitar Kanban V2**
  ```sql
  UPDATE Companies
  SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'true')
  WHERE id = 'BETA_COMPANY_ID';
  ```
  - Responsável: Backend Engineer

- [ ] **Treinar beta testers**
  - Demo das novas features
  - Como reportar bugs
  - Expectativas
  - Responsável: Product Manager

- [ ] **Daily check-ins com beta testers**
  - [ ] Dia 1
  - [ ] Dia 2
  - [ ] Dia 3
  - [ ] Dia 4
  - [ ] Dia 5
  - Feedback e bugs
  - Responsável: Product Manager

- [ ] **Fix de bugs críticos**
  - Priorizar P0/P1
  - Deploy hotfix se necessário
  - Responsável: Engineering Team

- [ ] **Beta success criteria met**
  - Zero bugs críticos
  - Feedback positivo
  - Performance adequada
  - Responsável: Tech Lead

---

### Phase 3: Pilot (Week 3-4)

- [ ] **Selecionar 10% das companies**
  ```sql
  -- Ver ROLLOUT-STRATEGY.md para query
  ```
  - Responsável: Product Manager + Data Analyst

- [ ] **Comunicação para companies piloto**
  - Email explicando nova feature
  - Link para USER-GUIDE.md
  - Canal de feedback
  - Responsável: Product Manager

- [ ] **Habilitar gradualmente**
  - [ ] Lote 1 (2%)
  - [ ] Lote 2 (3%)
  - [ ] Lote 3 (5%)
  - 2-3 dias entre lotes
  - Responsável: Backend Engineer

- [ ] **Monitoramento intensivo**
  - Dashboard dedicado
  - Alertas por company
  - Daily reports
  - Responsável: DevOps

- [ ] **Support preparado**
  - FAQs atualizadas
  - Response templates
  - Escalation path claro
  - Responsável: Support Lead

- [ ] **Weekly review**
  - [ ] Semana 1
  - [ ] Semana 2
  - Métricas e feedback
  - Responsável: Tech Lead

---

### Phase 4: Expansion (Week 4-5)

- [ ] **Expandir para 50%**
  - [ ] +10% (Total: 20%)
  - [ ] +10% (Total: 30%)
  - [ ] +10% (Total: 40%)
  - [ ] +10% (Total: 50%)
  - 1-2 dias entre lotes
  - Responsável: Backend Engineer

- [ ] **Monitoring automatizado**
  - Alertas configurados
  - Auto-rollback em caso de P0
  - Dashboard público (status page)
  - Responsável: DevOps

- [ ] **Performance optimization**
  - Identificar gargalos
  - Otimizar queries
  - Adicionar cache se necessário
  - Responsável: Engineering Team

- [ ] **Support metrics tracking**
  - Volume de tickets
  - CSAT score
  - Resolution time
  - Responsável: Support Lead

---

### Phase 5: Full Rollout (Week 5-6)

- [ ] **Comunicação geral**
  - Blog post
  - Email para todos os clientes
  - In-app notification
  - Social media
  - Responsável: Marketing + Product

- [ ] **Habilitar para 100%**
  ```sql
  UPDATE Companies
  SET settings = jsonb_set(settings, '{kanbanV2Enabled}', 'true')
  WHERE status = 'active';
  ```
  - Responsável: Backend Engineer
  - Confirmação de 2 pessoas

- [ ] **Video tutorial publicado**
  - YouTube
  - In-app help
  - Responsável: Product + Design

- [ ] **Monitoramento 24/7**
  - Primeiras 48h críticas
  - On-call disponível
  - Responsável: DevOps + Engineers

- [ ] **Celebração do sucesso!**
  - Team announcement
  - Agradecer contributors
  - Documentar lições aprendidas
  - Responsável: Tech Lead + Manager

---

### Phase 6: Cleanup (Week 7-8)

- [ ] **2 semanas de estabilidade confirmadas**
  - Zero rollbacks
  - Error rate estável
  - Feedback positivo
  - Responsável: Tech Lead

- [ ] **Remover código legado**
  - Kanban V1 components
  - Old API endpoints
  - Unused dependencies
  - Responsável: Engineering Team

- [ ] **Remover feature flags**
  ```sql
  UPDATE Companies
  SET settings = settings - 'kanbanV2Enabled';
  ```
  - Responsável: Backend Engineer

- [ ] **Database cleanup**
  - Remover colunas não utilizadas
  - Consolidar dados
  - Vacuum full
  - Responsável: DBA

- [ ] **Documentation final**
  - Atualizar README
  - Remover docs de migração
  - Atualizar onboarding
  - Responsável: Tech Lead

- [ ] **Post-mortem final**
  - O que aprendemos
  - Métricas finais
  - Processo de rollout
  - Próximos passos
  - Responsável: Tech Lead + Team

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Tech Lead | - | - | - |
| DevOps Lead | - | - | - |
| DBA | - | - | - |
| Product Manager | - | - | - |
| Support Lead | - | - | - |
| CTO | - | - | - |

---

## Rollback Triggers

**Immediate Rollback (P0):**
- Data corruption detectada
- Sistema completamente down
- Security vulnerability
- Error rate > 5%

**Planned Rollback (P1):**
- Error rate > 1% por 30min
- Performance degradation > 50%
- > 10 support tickets críticos/hora
- Socket.IO disconnect > 20%

**Ver detalhes em:** `docs/kanban/ROLLBACK-PLAN.md`

---

## Success Criteria

### Technical

- [ ] Error rate < 0.1% (7 day average)
- [ ] Response time p95 < 100ms
- [ ] Socket.IO uptime > 99%
- [ ] DnD success rate > 99%
- [ ] Zero data loss
- [ ] Zero security incidents

### Business

- [ ] 100% companies migrated
- [ ] Support tickets < 1% of total
- [ ] CSAT score > 4.5/5
- [ ] NPS > 8/10
- [ ] Zero customer churn related to Kanban
- [ ] User adoption > 80%

### Operational

- [ ] Deployment process documented
- [ ] Rollback tested and validated
- [ ] Monitoring comprehensive
- [ ] Team trained
- [ ] On-call rotation established
- [ ] Post-mortem completed

---

## Sign-off

| Phase | Date | Sign-off | Notes |
|-------|------|----------|-------|
| Pre-Deployment Complete | YYYY-MM-DD | [Name] | - |
| Deployment Complete | YYYY-MM-DD | [Name] | - |
| Phase 1: Dark Launch | YYYY-MM-DD | [Name] | - |
| Phase 2: Beta | YYYY-MM-DD | [Name] | - |
| Phase 3: Pilot | YYYY-MM-DD | [Name] | - |
| Phase 4: Expansion | YYYY-MM-DD | [Name] | - |
| Phase 5: Full Rollout | YYYY-MM-DD | [Name] | - |
| Phase 6: Cleanup | YYYY-MM-DD | [Name] | - |
| Project Complete | YYYY-MM-DD | [Name] | - |

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Owner:** Engineering Team
**Next Review:** Após cada fase do rollout
