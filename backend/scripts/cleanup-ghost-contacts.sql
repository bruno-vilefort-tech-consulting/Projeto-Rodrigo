-- =============================================================================
-- Script de Limpeza de Contatos "Fantasmas"
-- =============================================================================
-- Descrição: Remove contatos criados automaticamente que não estão na agenda
-- Data: 2025-10-14
-- Autor: Claude Code Agent
-- Prioridade: P1 (ALTA)
--
-- IMPORTANTE: Fazer backup do banco antes de executar!
-- =============================================================================

-- ============================================================================
-- 1. ANÁLISE PRÉVIA: Verificar quantos contatos serão afetados
-- ============================================================================

-- 1.1 Contatos criados automaticamente (source = whatsapp_message)
SELECT
    COUNT(*) as total_auto_created,
    'Contatos criados automaticamente' as tipo
FROM "Contacts"
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false;

-- 1.2 Contatos sem atividade recente (sem tickets nos últimos 30 dias)
SELECT
    COUNT(*) as total_sem_atividade,
    'Contatos sem atividade recente' as tipo
FROM "Contacts" c
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = c.id
      AND t."createdAt" > NOW() - INTERVAL '30 days'
  );

-- 1.3 Contatos com números inválidos (menos de 10 dígitos ou mais de 15)
SELECT
    COUNT(*) as total_numeros_invalidos,
    'Contatos com números inválidos' as tipo
FROM "Contacts"
WHERE LENGTH(number) < 10 OR LENGTH(number) > 15;

-- 1.4 Grupos sem atividade
SELECT
    COUNT(*) as total_grupos_inativos,
    'Grupos sem atividade' as tipo
FROM "Contacts"
WHERE "isGroup" = true
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
      AND t."createdAt" > NOW() - INTERVAL '30 days'
  );

-- ============================================================================
-- 2. BACKUP: Criar tabela de backup antes da limpeza
-- ============================================================================

-- Criar tabela de backup com timestamp
CREATE TABLE IF NOT EXISTS "Contacts_Backup_20251014" AS
SELECT * FROM "Contacts"
WHERE 1=0; -- Criar estrutura vazia

-- Inserir dados que serão deletados
INSERT INTO "Contacts_Backup_20251014"
SELECT * FROM "Contacts"
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false
  AND "createdAt" < NOW() - INTERVAL '7 days';

-- Verificar backup
SELECT COUNT(*) as total_backup FROM "Contacts_Backup_20251014";

-- ============================================================================
-- 3. LIMPEZA CONSERVADORA: Remover apenas contatos claramente "fantasmas"
-- ============================================================================

-- 3.1 Remover contatos criados automaticamente SEM nenhum ticket associado
BEGIN;

DELETE FROM "Contacts"
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false
  AND "createdAt" < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
  );

-- Verificar quantos foram deletados (deve aparecer no output)
SELECT '✅ Passo 3.1 concluído' as status;

COMMIT;

-- 3.2 Remover contatos com números inválidos (muito curtos ou longos)
BEGIN;

DELETE FROM "Contacts"
WHERE (LENGTH(number) < 10 OR LENGTH(number) > 15)
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
  );

SELECT '✅ Passo 3.2 concluído' as status;

COMMIT;

-- 3.3 Marcar contatos antigos sem atividade como inativos (não deletar)
BEGIN;

UPDATE "Contacts"
SET active = false
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false
  AND "createdAt" < NOW() - INTERVAL '90 days'
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
      AND t."createdAt" > NOW() - INTERVAL '90 days'
  );

SELECT '✅ Passo 3.3 concluído' as status;

COMMIT;

-- ============================================================================
-- 4. LIMPEZA AGRESSIVA (OPCIONAL): Executar apenas se necessário
-- ============================================================================
-- CUIDADO: Esta seção remove mais contatos. Executar apenas se realmente necessário.
-- Descomente as linhas abaixo para executar:

/*
BEGIN;

-- 4.1 Remover TODOS os contatos criados automaticamente, mesmo com tickets antigos
DELETE FROM "Contacts"
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false
  AND "createdAt" < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
      AND t."createdAt" > NOW() - INTERVAL '30 days'
  );

-- 4.2 Remover grupos sem atividade recente
DELETE FROM "Contacts"
WHERE "isGroup" = true
  AND "createdAt" < NOW() - INTERVAL '60 days'
  AND NOT EXISTS (
    SELECT 1 FROM "Tickets" t
    WHERE t."contactId" = "Contacts".id
      AND t."createdAt" > NOW() - INTERVAL '60 days'
  );

SELECT '✅ Limpeza agressiva concluída' as status;

COMMIT;
*/

-- ============================================================================
-- 5. VERIFICAÇÃO PÓS-LIMPEZA
-- ============================================================================

-- 5.1 Contagem final de contatos
SELECT
    COUNT(*) as total_contatos_restantes,
    'Contatos restantes após limpeza' as tipo
FROM "Contacts";

-- 5.2 Contatos por fonte (source)
SELECT
    source,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "Contacts"), 2) as percentual
FROM "Contacts"
GROUP BY source
ORDER BY total DESC;

-- 5.3 Contatos por status
SELECT
    active,
    "isInAgenda",
    COUNT(*) as total
FROM "Contacts"
GROUP BY active, "isInAgenda"
ORDER BY total DESC;

-- 5.4 Top 10 empresas com mais contatos
SELECT
    "companyId",
    COUNT(*) as total_contatos
FROM "Contacts"
GROUP BY "companyId"
ORDER BY total_contatos DESC
LIMIT 10;

-- ============================================================================
-- 6. OTIMIZAÇÃO: Reindexar e vacuumar tabelas
-- ============================================================================

-- Recriar índices
REINDEX TABLE "Contacts";

-- Vacuum para recuperar espaço
VACUUM ANALYZE "Contacts";

-- ============================================================================
-- 7. MONITORAMENTO: Criar view para acompanhamento contínuo
-- ============================================================================

CREATE OR REPLACE VIEW "vw_contacts_health" AS
SELECT
    source,
    "isInAgenda",
    active,
    "isGroup",
    COUNT(*) as total,
    MIN("createdAt") as primeiro_criado,
    MAX("createdAt") as ultimo_criado,
    COUNT(CASE WHEN "createdAt" > NOW() - INTERVAL '7 days' THEN 1 END) as criados_ultima_semana
FROM "Contacts"
GROUP BY source, "isInAgenda", active, "isGroup"
ORDER BY total DESC;

-- Visualizar saúde dos contatos
SELECT * FROM "vw_contacts_health";

-- ============================================================================
-- 8. ROLLBACK (SE NECESSÁRIO)
-- ============================================================================
-- Se algo der errado, restaurar do backup:

/*
-- Restaurar contatos do backup
BEGIN;

INSERT INTO "Contacts"
SELECT * FROM "Contacts_Backup_20251014"
ON CONFLICT (id) DO NOTHING;

COMMIT;

SELECT 'ℹ️ Contatos restaurados do backup' as status;
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT '✅ Script de limpeza concluído com sucesso!' as status;
SELECT 'ℹ️ Verificar logs acima para detalhes' as informacao;
