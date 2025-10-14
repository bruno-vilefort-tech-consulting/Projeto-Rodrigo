# Checklist de Validação: UNIQUE Constraint em Companies.document

**Data**: 2025-10-13
**Migrations**: `20251013170000` e `20251013170001`
**Responsável**: Database Administrator / Backend Lead

---

## Instrução de Uso

Este checklist DEVE ser executado sequencialmente em cada ambiente (desenvolvimento, staging, produção) antes de considerar o deploy bem-sucedido.

**Notação**:
- [ ] Tarefa pendente
- [x] Tarefa concluída
- [!] Tarefa falhou (investigar antes de prosseguir)

---

## Fase 1: Pré-Migration (Planejamento)

### Backup e Preparação

- [ ] **1.1** Backup completo do banco de dados criado
  ```bash
  pg_dump -U postgres -d chatia_[env] > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
  ```
  - Tamanho do backup: _______ MB/GB
  - Localização: _______________________
  - Tempo de criação: _______ minutos

- [ ] **1.2** Backup da tabela Companies criado (adicional)
  ```bash
  pg_dump -U postgres -d chatia_[env] -t Companies > companies_backup_$(date +%Y%m%d_%H%M%S).sql
  ```
  - Tamanho do backup: _______ MB
  - Localização: _______________________

- [ ] **1.3** Backup testado (restore em banco temporário)
  ```bash
  createdb chatia_test_restore
  psql -U postgres -d chatia_test_restore < backup_pre_migration_*.sql
  ```
  - Resultado: ✓ Sucesso / ✗ Falhou
  - Observações: _______________________

### Análise de Duplicatas

- [ ] **1.4** Query de identificação de duplicatas executada
  ```sql
  SELECT document, COUNT(*) as count, ARRAY_AGG(id ORDER BY id) as ids
  FROM "Companies"
  WHERE document IS NOT NULL AND document != '' AND TRIM(document) != ''
  GROUP BY document
  HAVING COUNT(*) > 1;
  ```
  - Duplicatas encontradas: _______ documentos
  - Total de registros afetados: _______ companies
  - Ver detalhes em: _______________________

- [ ] **1.5** Duplicatas revisadas manualmente (se existirem)
  - [ ] Todas as duplicatas são registros ilegítimos (pode deletar)
  - [ ] Algumas duplicatas requerem merge manual
  - [ ] Nenhuma duplicata encontrada (prosseguir direto)

- [ ] **1.6** Estratégia de resolução definida
  - [ ] Automática (Migration 1 remove duplicatas, mantém mais antigo)
  - [ ] Manual (corrigir duplicatas antes da migration)
  - [ ] N/A (sem duplicatas)

### Estimativa de Impacto

- [ ] **1.7** Estatísticas coletadas
  ```sql
  SELECT
    COUNT(*) as total_companies,
    COUNT(document) FILTER (WHERE document != '') as with_document,
    COUNT(*) FILTER (WHERE document = '' OR document IS NULL) as without_document
  FROM "Companies";
  ```
  - Total de empresas: _______
  - Com documento: _______
  - Sem documento: _______

- [ ] **1.8** Tempo estimado de migration calculado
  - Volume de empresas: _______
  - Tempo estimado Migration 1: _______ segundos
  - Tempo estimado Migration 2: _______ segundos
  - Janela de manutenção necessária: [ ] Sim / [ ] Não

### Comunicação

- [ ] **1.9** Stakeholders notificados sobre deploy
  - Data/hora planejada: _______________________
  - Downtime esperado: _______ segundos (ou zero para Migration 2 CONCURRENTLY)
  - Canal de comunicação: _______________________

- [ ] **1.10** Plano de rollback documentado e aprovado
  - Tempo de rollback: _______ minutos
  - Responsável pelo rollback: _______________________

---

## Fase 2: Execução de Migrations

### Migration 1: Normalização

- [ ] **2.1** Migration status verificado
  ```bash
  npm run sequelize db:migrate:status
  ```
  - Status: _______________________

- [ ] **2.2** Migration 1 executada
  ```bash
  npm run sequelize db:migrate --to 20251013170000-normalize-companies-document.ts
  ```
  - Data/hora de execução: _______________________
  - Tempo de execução: _______ segundos
  - Resultado: ✓ Sucesso / ✗ Falhou

- [ ] **2.3** Logs de Migration 1 revisados
  - Duplicatas encontradas: _______ (conforme esperado: Sim/Não)
  - Registros removidos: _______
  - Strings vazias convertidas: _______
  - Validação de integridade: ✓ Passou / ✗ Falhou

- [ ] **2.4** Dados após normalização verificados
  ```sql
  SELECT COUNT(*) FROM "Companies" WHERE document = '';
  ```
  - Strings vazias restantes: _______ (esperado: 0)

  ```sql
  SELECT document, COUNT(*) FROM "Companies"
  WHERE document IS NOT NULL
  GROUP BY document
  HAVING COUNT(*) > 1;
  ```
  - Duplicatas restantes: _______ (esperado: 0)

### Migration 2: UNIQUE Constraint

- [ ] **2.5** Migration 2 executada
  ```bash
  npm run sequelize db:migrate --to 20251013170001-add-unique-constraint-companies-document.ts
  ```
  - Data/hora de execução: _______________________
  - Tempo de execução: _______ segundos
  - Resultado: ✓ Sucesso / ✗ Falhou

- [ ] **2.6** Logs de Migration 2 revisados
  - Pré-condições validadas: ✓ Sim / ✗ Não
  - Índice criado com CONCURRENTLY: ✓ Sim / ✗ Não (fallback)
  - Validação de índice: ✓ Passou / ✗ Falhou

- [ ] **2.7** Índice verificado no banco
  ```sql
  SELECT indexname, indexdef FROM pg_indexes
  WHERE tablename = 'Companies' AND indexname = 'idx_companies_document_unique';
  ```
  - Índice encontrado: ✓ Sim / ✗ Não
  - Definição contém "WHERE document IS NOT NULL": ✓ Sim / ✗ Não

---

## Fase 3: Validação Pós-Migration

### Validação Funcional

- [ ] **3.1** Script de teste executado
  ```bash
  psql -U postgres -d chatia_[env] < backend/src/database/migrations/scripts/test-document-unique.sql
  ```
  - Resultado geral: ✓ Todos os testes passaram / ✗ Alguns falharam
  - Testes com falha: _______________________

- [ ] **3.2** TESTE 1: Múltiplos NULL permitidos
  ```sql
  INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
  VALUES
    ('Test NULL 1', 'null1@test.com', NULL, NOW(), NOW()),
    ('Test NULL 2', 'null2@test.com', NULL, NOW(), NOW());
  ```
  - Resultado: ✓ Permitido (esperado) / ✗ Rejeitado (erro)

- [ ] **3.3** TESTE 2: Documento único permitido
  ```sql
  INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
  VALUES ('Test Unique', 'unique@test.com', '99999999999', NOW(), NOW());
  ```
  - Resultado: ✓ Permitido (esperado) / ✗ Rejeitado (erro)

- [ ] **3.4** TESTE 3: Documento duplicado rejeitado
  ```sql
  INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
  VALUES ('Test Duplicate', 'dup@test.com', '99999999999', NOW(), NOW());
  ```
  - Resultado: ✓ Rejeitado com "unique constraint" (esperado) / ✗ Permitido (erro crítico)

- [ ] **3.5** TESTE 4: UPDATE para documento duplicado rejeitado
  ```sql
  UPDATE "Companies" SET document = '99999999999' WHERE id = <outro_id>;
  ```
  - Resultado: ✓ Rejeitado (esperado) / ✗ Permitido (erro)

- [ ] **3.6** TESTE 5: UPDATE para NULL permitido
  ```sql
  UPDATE "Companies" SET document = NULL WHERE document = '99999999999';
  ```
  - Resultado: ✓ Permitido (esperado) / ✗ Rejeitado (erro)

- [ ] **3.7** Cleanup de testes realizado
  ```sql
  DELETE FROM "Companies" WHERE name LIKE 'Test %';
  ```

### Validação de Performance

- [ ] **3.8** Query EXPLAIN ANALYZE executado
  ```sql
  EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM "Companies" WHERE document = '12345678900';
  ```
  - Índice usado: ✓ idx_companies_document_unique / ✗ Seq Scan (table scan)
  - Tempo de execução: _______ ms (esperado: < 1ms para tabelas grandes)
  - Observações: _______________________

- [ ] **3.9** Tamanho do índice verificado
  ```sql
  SELECT pg_size_pretty(pg_relation_size('idx_companies_document_unique')) as index_size,
         pg_size_pretty(pg_total_relation_size('Companies')) as table_size;
  ```
  - Tamanho do índice: _______ MB
  - Tamanho da tabela: _______ MB
  - Percentual: _______ % (esperado: 2-5%)

- [ ] **3.10** Latência de INSERT/UPDATE medida
  - **Antes da migration** (baseline): _______ ms
  - **Depois da migration**: _______ ms
  - **Diferença**: _______ ms / _______ % (esperado: < 5ms ou < 20%)

### Validação de Integridade

- [ ] **3.11** Estatísticas finais coletadas
  ```sql
  SELECT
    COUNT(*) as total,
    COUNT(document) as with_document,
    COUNT(*) FILTER (WHERE document IS NULL) as with_null
  FROM "Companies";
  ```
  - Total: _______
  - Com documento: _______
  - Com NULL: _______
  - Soma confere: ✓ Sim / ✗ Não

- [ ] **3.12** Verificação de constraints
  ```sql
  SELECT conname, contype FROM pg_constraint
  WHERE conrelid = 'Companies'::regclass;
  ```
  - UNIQUE constraint presente: ✓ Sim / ✗ Não

---

## Fase 4: Validação de Aplicação

### Backend

- [ ] **4.1** Servidor backend reiniciado (se necessário)
  - Reiniciado: [ ] Sim / [ ] Não (não necessário)
  - Logs de inicialização limpos: ✓ Sim / ✗ Erros encontrados

- [ ] **4.2** Endpoint de criação de empresa testado (sem documento)
  ```bash
  curl -X POST http://localhost:3000/api/companies \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Company", "email": "test@example.com"}'
  ```
  - Status: _______ (esperado: 200/201)
  - Campo document no response: _______ (esperado: null)

- [ ] **4.3** Endpoint de criação de empresa testado (com documento único)
  ```bash
  curl -X POST http://localhost:3000/api/companies \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Company 2", "email": "test2@example.com", "document": "12345678901"}'
  ```
  - Status: _______ (esperado: 200/201)
  - Campo document no response: _______ (esperado: "12345678901")

- [ ] **4.4** Endpoint de criação de empresa testado (com documento duplicado)
  ```bash
  curl -X POST http://localhost:3000/api/companies \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Company 3", "email": "test3@example.com", "document": "12345678901"}'
  ```
  - Status: _______ (esperado: 400/409/422)
  - Mensagem de erro: _______ (esperado: "CPF/CNPJ já cadastrado" ou similar)

- [ ] **4.5** Logs do backend verificados
  - Erros relacionados a UNIQUE constraint: [ ] Nenhum / [ ] Encontrados (detalhar)
  - Stack traces: [ ] Nenhum / [ ] Encontrados
  - Observações: _______________________

### Frontend (se aplicável)

- [ ] **4.6** Interface de criação de empresa testada
  - Empresa sem documento: ✓ Criada / ✗ Erro
  - Empresa com documento único: ✓ Criada / ✗ Erro
  - Empresa com documento duplicado: ✓ Erro exibido ao usuário / ✗ Erro não capturado

- [ ] **4.7** Mensagens de erro amigáveis (se validação implementada)
  - Mensagem para documento duplicado: _______________________
  - UX adequada: ✓ Sim / ✗ Melhorar

---

## Fase 5: Monitoramento Pós-Deploy

### Métricas (Primeiras 24h)

- [ ] **5.1** Taxa de erro de UNIQUE constraint monitorada
  - Erros de duplicata nas primeiras 1h: _______
  - Erros de duplicata nas primeiras 24h: _______
  - Taxa aceitável (< 1% de tentativas de criação): ✓ Sim / ✗ Investigar

- [ ] **5.2** Latência de operações monitorada
  - INSERT latency p50: _______ ms (baseline: _______ ms)
  - INSERT latency p95: _______ ms (baseline: _______ ms)
  - UPDATE latency p50: _______ ms (baseline: _______ ms)
  - UPDATE latency p95: _______ ms (baseline: _______ ms)
  - Degradação aceitável (< 20%): ✓ Sim / ✗ Investigar

- [ ] **5.3** Uso de recursos do banco monitorado
  - CPU: _______ % (baseline: _______ %)
  - Memória: _______ % (baseline: _______ %)
  - IOPS: _______ (baseline: _______ )
  - Degradação aceitável: ✓ Sim / ✗ Investigar

### Logs e Alertas

- [ ] **5.4** Sentry/Error tracking verificado
  - Novos erros relacionados a UNIQUE: _______
  - Padrão identificado: _______________________
  - Ação necessária: _______________________

- [ ] **5.5** Logs de aplicação revisados
  - Erros críticos: [ ] Nenhum / [ ] Encontrados (detalhar)
  - Warnings relevantes: _______________________

---

## Fase 6: Rollback (Apenas se necessário)

### Critérios para Rollback

- [ ] **6.1** Avaliação de necessidade de rollback
  - [ ] Taxa de erro > 5% (rollback recomendado)
  - [ ] Degradação de performance > 50% (rollback recomendado)
  - [ ] Perda de dados detectada (rollback URGENTE)
  - [ ] Bugs críticos bloqueando operação (avaliar rollback)
  - [ ] Nenhum problema crítico (manter migrations)

### Execução de Rollback (se necessário)

- [ ] **6.2** Rollback da Migration 2 (UNIQUE constraint)
  ```bash
  npm run sequelize db:migrate:undo
  ```
  - Data/hora: _______________________
  - Resultado: ✓ Sucesso / ✗ Falhou
  - Índice removido confirmado: ✓ Sim / ✗ Não

- [ ] **6.3** Rollback da Migration 1 (normalização)
  ```bash
  npm run sequelize db:migrate:undo
  ```
  - Data/hora: _______________________
  - Resultado: ✓ Sucesso / ✗ Falhou
  - NULL → '' conversão confirmada: ✓ Sim / ✗ Não

- [ ] **6.4** Restore de backup (se necessário restaurar duplicatas)
  ```bash
  psql -U postgres -d chatia_[env] < companies_backup_*.sql
  ```
  - Executado: [ ] Sim / [ ] Não necessário
  - Resultado: ✓ Sucesso / ✗ Falhou

- [ ] **6.5** Validação pós-rollback
  - Sistema operacional: ✓ Sim / ✗ Não
  - Dados íntegros: ✓ Sim / ✗ Não

---

## Fase 7: Atualização de Código (Pós-Migration)

### Model Sequelize

- [ ] **7.1** Model Company.ts atualizado
  ```typescript
  @Column({
    type: DataTypes.STRING(255),
    allowNull: true,      // Mudado de false/undefined
    defaultValue: null     // Mudado de ""
  })
  document: string | null;
  ```
  - Arquivo: `backend/src/models/Company.ts`
  - Linhas 46-47 atualizadas: ✓ Sim / ✗ Pendente

- [ ] **7.2** Testes de model executados
  ```bash
  npm test -- Company.test.ts
  ```
  - Resultado: ✓ Passou / ✗ Falhou

### Validações (se implementadas)

- [ ] **7.3** DocumentValidator implementado (opcional, conforme ADR)
  - Arquivo: `backend/src/helpers/DocumentValidator.ts`
  - Testes unitários: ✓ Passando / ✗ Pendente / [ ] N/A

- [ ] **7.4** Services atualizados com validação (opcional)
  - CreateCompanyService: ✓ Atualizado / [ ] Pendente / [ ] N/A
  - UpdateCompanyService: ✓ Atualizado / [ ] Pendente / [ ] N/A

---

## Fase 8: Documentação e Fechamento

### Documentação

- [ ] **8.1** Documentação atualizada
  - README.md ou MIGRATIONS.md: ✓ Atualizado / [ ] Pendente
  - Changelog: ✓ Atualizado / [ ] Pendente
  - ADR-2025-10-13: ✓ Status atualizado para "Implementado" / [ ] Pendente

- [ ] **8.2** Lessons learned documentadas
  - Problemas encontrados: _______________________
  - Soluções aplicadas: _______________________
  - Melhorias para próxima migration: _______________________

### Comunicação Final

- [ ] **8.3** Stakeholders notificados sobre conclusão
  - Data/hora de notificação: _______________________
  - Canal: _______________________
  - Feedback recebido: _______________________

- [ ] **8.4** Post-mortem agendado (se houve problemas)
  - Data: _______________________
  - Participantes: _______________________

---

## Aprovação Final

### Assinaturas

- [ ] **Database Administrator**
  - Nome: _______________________
  - Data: _______________________
  - Assinatura: _______________________
  - Status: ✓ Aprovado / ✗ Requer ação

- [ ] **Backend Lead**
  - Nome: _______________________
  - Data: _______________________
  - Assinatura: _______________________
  - Status: ✓ Aprovado / ✗ Requer ação

- [ ] **DevOps Engineer**
  - Nome: _______________________
  - Data: _______________________
  - Assinatura: _______________________
  - Status: ✓ Aprovado / ✗ Requer ação

- [ ] **Product Owner** (opcional)
  - Nome: _______________________
  - Data: _______________________
  - Assinatura: _______________________
  - Status: ✓ Aprovado / ✗ Requer ação

---

## Notas Adicionais

**Observações Gerais**:
_______________________________________________________________________________________
_______________________________________________________________________________________
_______________________________________________________________________________________

**Problemas Encontrados**:
_______________________________________________________________________________________
_______________________________________________________________________________________
_______________________________________________________________________________________

**Ações de Follow-up**:
_______________________________________________________________________________________
_______________________________________________________________________________________
_______________________________________________________________________________________

---

**Data de Conclusão do Checklist**: _______________________

**Status Final**: [ ] Completo e Aprovado / [ ] Requer Ações Adicionais / [ ] Rollback Executado

---

**Fim do Checklist**
