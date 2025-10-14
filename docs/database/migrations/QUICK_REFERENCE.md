# Quick Reference Card: Companies Document UNIQUE Constraint

**Imprimir este card e manter próximo durante deploy** 📋

---

## Arquivos Principais

```
backend/src/database/migrations/
├── 20251013170000-normalize-companies-document.ts      (Migration 1)
└── 20251013170001-add-unique-constraint-companies-document.ts  (Migration 2)

docs/database/migrations/
├── EXECUTIVE_SUMMARY.md         (Leia primeiro!)
├── COMPANIES_DOCUMENT_UNIQUE.md (Documentação técnica)
├── VALIDATION_CHECKLIST.md      (Checklist de deploy)
└── MODEL_UPDATE_GUIDE.md        (Atualizar model após)

backend/src/database/migrations/scripts/
└── test-document-unique.sql     (Testes automatizados)
```

---

## Comandos Essenciais

### Backup (OBRIGATÓRIO antes de qualquer operação)
```bash
pg_dump -U postgres -d chatia_[env] > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Executar Migrations
```bash
cd backend
npm run sequelize db:migrate
```

### Verificar Status
```bash
npm run sequelize db:migrate:status
```

### Rollback (Reverter)
```bash
npm run sequelize db:migrate:undo  # Reverte última migration
npm run sequelize db:migrate:undo  # Reverte mais uma
```

### Executar Testes
```bash
psql -U postgres -d chatia_[env] < backend/src/database/migrations/scripts/test-document-unique.sql
```

---

## Validações Rápidas (SQL)

### 1. Identificar Duplicatas (ANTES da migration)
```sql
SELECT document, COUNT(*) as count, ARRAY_AGG(id) as ids
FROM "Companies"
WHERE document IS NOT NULL AND document != ''
GROUP BY document
HAVING COUNT(*) > 1;
```
**Esperado**: 0 linhas (sem duplicatas) ou revisar duplicatas manualmente

### 2. Verificar Índice (DEPOIS da migration)
```sql
\d Companies
-- ou
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'Companies' AND indexname = 'idx_companies_document_unique';
```
**Esperado**: 1 linha com definição do índice

### 3. Testar UNIQUE (DEPOIS da migration)
```sql
-- Inserir registro com documento
INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES ('Test Unique', 'test@unique.com', '99999999999', NOW(), NOW());

-- Tentar inserir duplicata (deve FALHAR)
INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES ('Test Duplicate', 'test@dup.com', '99999999999', NOW(), NOW());
```
**Esperado**: Segundo INSERT retorna erro `duplicate key value violates unique constraint`

### 4. Testar Múltiplos NULL (DEPOIS da migration)
```sql
INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES
  ('Test NULL 1', 'null1@test.com', NULL, NOW(), NOW()),
  ('Test NULL 2', 'null2@test.com', NULL, NOW(), NOW());
```
**Esperado**: SUCCESS (múltiplos NULL permitidos)

### 5. Cleanup de Testes
```sql
DELETE FROM "Companies" WHERE name LIKE 'Test%';
```

---

## Comportamento do UNIQUE Constraint

| Operação | Resultado |
|----------|-----------|
| INSERT company com document NULL | ✅ PERMITIDO (infinitos NULL) |
| INSERT company com document único | ✅ PERMITIDO |
| INSERT company com document duplicado | ❌ REJEITADO (erro unique constraint) |
| UPDATE para document NULL | ✅ PERMITIDO (sempre) |
| UPDATE para document único | ✅ PERMITIDO |
| UPDATE para document duplicado | ❌ REJEITADO (erro unique constraint) |

---

## Tempos Estimados

| Ação | Tempo |
|------|-------|
| Backup (10K empresas) | 5-10s |
| Migration 1 (normalize) | 2-10s (COM lock) |
| Migration 2 (UNIQUE) | 5-20s (SEM lock - CONCURRENTLY) |
| Rollback Migration 2 | 1-2s |
| Rollback Migration 1 | 2-5s |
| Restore completo de backup | 1-5 minutos |

---

## Checklist Mínimo de Deploy

### Pré-Deploy
- [ ] Backup criado e validado
- [ ] Query de duplicatas executada
- [ ] Duplicatas revisadas (se existirem)
- [ ] Janela de manutenção agendada (opcional)

### Deploy
- [ ] `npm run sequelize db:migrate` executado
- [ ] Sem erros nos logs da migration
- [ ] Índice criado verificado (`\d Companies`)
- [ ] Teste de duplicata executado (deve rejeitar)
- [ ] Teste de NULL executado (deve permitir)

### Pós-Deploy
- [ ] Monitorar latência (< 20% aumento)
- [ ] Monitorar erros de duplicata (< 1%)
- [ ] Atualizar `Company.ts` (ver MODEL_UPDATE_GUIDE.md)
- [ ] Validar testes unitários/integração

---

## Troubleshooting Rápido

### Erro: "duplicate key violates unique constraint" durante Migration 2
**Causa**: Ainda existem duplicatas na tabela
**Solução**: Executar query de identificação, corrigir manualmente, re-executar Migration 1

### Erro: "cannot run inside a transaction block" durante Migration 2
**Causa**: CONCURRENTLY não funciona em contexto transacional
**Solução**: Migration possui fallback automático (ignora o erro, tenta sem CONCURRENTLY)

### Erro: Aplicação rejeitando inserções legítimas com "duplicate key"
**Causa**: Tentando inserir documento já existente
**Solução**: Backend deve capturar exceção e retornar erro amigável ao usuário

### EXPLAIN ANALYZE mostra "Seq Scan" ao invés de "Index Scan"
**Causa**: Tabela muito pequena (< 1000 registros)
**Solução**: Comportamento esperado, PostgreSQL prefere table scan para tabelas pequenas

---

## Contatos de Emergência

**Durante Deploy**:
- Database Administrator: __________________
- Backend Lead: __________________
- DevOps Engineer: __________________

**Decisão de Rollback**:
- Product Owner: __________________
- CTO: __________________

**Telefone/Slack de Emergência**: __________________

---

## Rollback Decision Tree

```
┌─ Erro durante migration?
│  ├─ SIM → Revisar logs, corrigir causa, re-executar
│  └─ NÃO → Prosseguir
│
┌─ Dados perdidos/corrompidos?
│  ├─ SIM → ROLLBACK IMEDIATO + restore backup
│  └─ NÃO → Prosseguir
│
┌─ Performance degradou > 50%?
│  ├─ SIM → Considerar rollback, investigar
│  └─ NÃO → Monitorar
│
┌─ Taxa de erro > 5%?
│  ├─ SIM → Rollback recomendado
│  └─ NÃO → Monitorar por 24-72h
│
└─ Tudo OK? → Atualizar Model, implementar validações
```

---

## Notas de Campo (Preencher durante deploy)

**Ambiente**: [ ] Dev [ ] Staging [ ] Produção

**Data/Hora Início**: _______________________

**Backup Criado**: [ ] Sim (localização: _______________)

**Duplicatas Encontradas**: _______ documentos

**Migration 1 Tempo**: _______ segundos

**Migration 2 Tempo**: _______ segundos

**Erros Encontrados**: _______________________

**Rollback Necessário**: [ ] Sim [ ] Não

**Data/Hora Conclusão**: _______________________

**Aprovado por**: _______________________

**Observações**:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**IMPORTANTE**:
- Sempre faça BACKUP antes de qualquer operação
- Execute primeiro em DEV, depois STAGING, por último PRODUÇÃO
- Em caso de dúvida, NÃO prossiga - consulte documentação completa

**Documentação Completa**: `docs/database/migrations/COMPANIES_DOCUMENT_UNIQUE.md`

---

**Versão**: 1.0 | **Data**: 2025-10-13 | **Válido até**: Após deploy bem-sucedido
