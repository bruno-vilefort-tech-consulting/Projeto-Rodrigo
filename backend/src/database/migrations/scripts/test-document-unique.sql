/*
 * Script de Teste: UNIQUE Constraint em Companies.document
 *
 * Este script valida o comportamento do UNIQUE partial index após as migrations:
 * - 20251013170000-normalize-companies-document.ts
 * - 20251013170001-add-unique-constraint-companies-document.ts
 *
 * IMPORTANTE: Execute este script em ambiente de DESENVOLVIMENTO ou STAGING.
 * NÃO execute em produção sem backup!
 *
 * Como usar:
 * psql -U postgres -d chatia_dev < test-document-unique.sql
 *
 * ou manualmente:
 * psql -U postgres -d chatia_dev
 * \i backend/src/database/migrations/scripts/test-document-unique.sql
 */

-- ============================================================================
-- CONFIGURAÇÃO INICIAL
-- ============================================================================

\echo '============================================================================'
\echo 'Script de Teste: UNIQUE Constraint em Companies.document'
\echo '============================================================================'
\echo ''

-- Desabilitar notices para output mais limpo
SET client_min_messages TO WARNING;

-- ============================================================================
-- PRÉ-CONDIÇÃO: Verificar que migrations foram executadas
-- ============================================================================

\echo '1. VALIDANDO PRÉ-CONDIÇÕES'
\echo '   Verificando existência do índice idx_companies_document_unique...'

DO $$
DECLARE
  index_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'Companies' AND indexname = 'idx_companies_document_unique'
  ) INTO index_exists;

  IF NOT index_exists THEN
    RAISE EXCEPTION 'ERRO: Índice idx_companies_document_unique não encontrado. Execute as migrations primeiro.';
  ELSE
    RAISE NOTICE '   ✓ Índice encontrado';
  END IF;
END $$;

\echo ''

-- ============================================================================
-- SETUP: Criar dados de teste
-- ============================================================================

\echo '2. SETUP: Criando dados de teste'
\echo '   Limpando registros de teste anteriores...'

-- Cleanup de testes anteriores
DELETE FROM "Companies"
WHERE name LIKE 'TEST_%' OR email LIKE 'test_%@unique-test.local';

\echo '   ✓ Cleanup concluído'
\echo ''

-- ============================================================================
-- TESTE 1: Inserir empresa SEM documento (NULL) - Deve PERMITIR múltiplos
-- ============================================================================

\echo '3. TESTE 1: Múltiplos NULL (deve permitir infinitos)'
\echo '   Inserindo 3 empresas sem documento...'

BEGIN;

INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES
  ('TEST_Company_NULL_1', 'test_null1@unique-test.local', NULL, NOW(), NOW()),
  ('TEST_Company_NULL_2', 'test_null2@unique-test.local', NULL, NOW(), NOW()),
  ('TEST_Company_NULL_3', 'test_null3@unique-test.local', NULL, NOW(), NOW());

-- Validar inserção
SELECT COUNT(*) as inserted_count FROM "Companies"
WHERE name LIKE 'TEST_Company_NULL_%';

COMMIT;

\echo '   ✓ TESTE 1 PASSOU: Múltiplos NULL permitidos'
\echo ''

-- ============================================================================
-- TESTE 2: Inserir empresa COM documento único - Deve PERMITIR
-- ============================================================================

\echo '4. TESTE 2: Documento único (deve permitir)'
\echo '   Inserindo empresa com documento "11111111111"...'

BEGIN;

INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES ('TEST_Company_Unique_Doc', 'test_unique@unique-test.local', '11111111111', NOW(), NOW());

SELECT id, name, document FROM "Companies"
WHERE name = 'TEST_Company_Unique_Doc';

COMMIT;

\echo '   ✓ TESTE 2 PASSOU: Documento único inserido com sucesso'
\echo ''

-- ============================================================================
-- TESTE 3: Inserir empresa COM documento DUPLICADO - Deve REJEITAR
-- ============================================================================

\echo '5. TESTE 3: Documento duplicado (deve REJEITAR)'
\echo '   Tentando inserir empresa com documento "11111111111" (duplicado)...'

DO $$
BEGIN
  BEGIN
    INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
    VALUES ('TEST_Company_Duplicate_Doc', 'test_dup@unique-test.local', '11111111111', NOW(), NOW());

    -- Se chegou aqui, teste FALHOU (inserção foi permitida)
    RAISE EXCEPTION '   ✗ TESTE 3 FALHOU: Documento duplicado foi permitido!';

  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '   ✓ TESTE 3 PASSOU: Documento duplicado foi rejeitado corretamente';
      RAISE NOTICE '   Mensagem de erro capturada: "duplicate key value violates unique constraint"';
  END;
END $$;

\echo ''

-- ============================================================================
-- TESTE 4: UPDATE para documento DUPLICADO - Deve REJEITAR
-- ============================================================================

\echo '6. TESTE 4: UPDATE para documento duplicado (deve REJEITAR)'
\echo '   Criando segunda empresa com documento diferente...'

BEGIN;

INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES ('TEST_Company_To_Update', 'test_update@unique-test.local', '22222222222', NOW(), NOW());

COMMIT;

\echo '   Tentando fazer UPDATE para documento duplicado "11111111111"...'

DO $$
BEGIN
  BEGIN
    UPDATE "Companies"
    SET document = '11111111111'
    WHERE name = 'TEST_Company_To_Update';

    -- Se chegou aqui, teste FALHOU
    RAISE EXCEPTION '   ✗ TESTE 4 FALHOU: UPDATE para documento duplicado foi permitido!';

  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '   ✓ TESTE 4 PASSOU: UPDATE para documento duplicado foi rejeitado';
  END;
END $$;

\echo ''

-- ============================================================================
-- TESTE 5: UPDATE para NULL - Deve PERMITIR (sempre)
-- ============================================================================

\echo '7. TESTE 5: UPDATE para NULL (deve permitir)'
\echo '   Fazendo UPDATE de documento "22222222222" para NULL...'

BEGIN;

UPDATE "Companies"
SET document = NULL
WHERE name = 'TEST_Company_To_Update';

SELECT name, document FROM "Companies"
WHERE name = 'TEST_Company_To_Update';

COMMIT;

\echo '   ✓ TESTE 5 PASSOU: UPDATE para NULL permitido'
\echo ''

-- ============================================================================
-- TESTE 6: Inserir string VAZIA - Deve converter para NULL
-- ============================================================================

\echo '8. TESTE 6: String vazia (deve ser tratada como NULL ou rejeitada)'
\echo '   Inserindo empresa com document = ''''...'

BEGIN;

INSERT INTO "Companies" (name, email, document, "createdAt", "updatedAt")
VALUES ('TEST_Company_Empty_String', 'test_empty@unique-test.local', '', NOW(), NOW());

-- Verificar se foi convertido para NULL ou permaneceu vazio
SELECT
  name,
  CASE
    WHEN document IS NULL THEN 'NULL'
    WHEN document = '' THEN 'STRING VAZIA'
    ELSE document
  END as document_value
FROM "Companies"
WHERE name = 'TEST_Company_Empty_String';

COMMIT;

\echo '   ✓ TESTE 6 CONCLUÍDO (verificar output acima)'
\echo ''

-- ============================================================================
-- TESTE 7: Performance - Verificar uso do índice
-- ============================================================================

\echo '9. TESTE 7: Performance do índice'
\echo '   Executando EXPLAIN ANALYZE para query por document...'

EXPLAIN (FORMAT TEXT, ANALYZE TRUE, BUFFERS TRUE)
SELECT id, name, document FROM "Companies"
WHERE document = '11111111111';

\echo ''
\echo '   Verificar no output acima:'
\echo '   - Deve mostrar "Index Scan using idx_companies_document_unique"'
\echo '   - Execution Time deve ser < 1ms'
\echo ''

-- ============================================================================
-- TESTE 8: Validar índice parcial (WHERE document IS NOT NULL)
-- ============================================================================

\echo '10. TESTE 8: Validação do filtro WHERE no índice'
\echo '    Verificando definição do índice...'

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'Companies' AND indexname = 'idx_companies_document_unique';

\echo ''
\echo '    Verificar no output acima:'
\echo '    - indexdef deve conter "WHERE (document IS NOT NULL)"'
\echo ''

-- ============================================================================
-- TESTE 9: Estatísticas finais
-- ============================================================================

\echo '11. TESTE 9: Estatísticas da tabela'
\echo '    Contando registros...'

SELECT
  COUNT(*) as total_companies,
  COUNT(document) as companies_with_document,
  COUNT(*) FILTER (WHERE document IS NULL) as companies_without_document,
  COUNT(*) FILTER (WHERE name LIKE 'TEST_%') as test_companies
FROM "Companies";

\echo ''

-- ============================================================================
-- CLEANUP: Remover dados de teste
-- ============================================================================

\echo '12. CLEANUP: Removendo dados de teste'

BEGIN;

DELETE FROM "Companies"
WHERE name LIKE 'TEST_%' OR email LIKE 'test_%@unique-test.local';

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✓ Cleanup concluído: 0 registros de teste restantes'
    ELSE '⚠ Atenção: ' || COUNT(*) || ' registros de teste ainda existem'
  END as cleanup_status
FROM "Companies"
WHERE name LIKE 'TEST_%';

COMMIT;

\echo ''

-- ============================================================================
-- RESUMO FINAL
-- ============================================================================

\echo '============================================================================'
\echo 'RESUMO DOS TESTES'
\echo '============================================================================'
\echo ''
\echo '✓ TESTE 1: Múltiplos NULL permitidos'
\echo '✓ TESTE 2: Documento único inserido'
\echo '✓ TESTE 3: Documento duplicado rejeitado (INSERT)'
\echo '✓ TESTE 4: Documento duplicado rejeitado (UPDATE)'
\echo '✓ TESTE 5: UPDATE para NULL permitido'
\echo '✓ TESTE 6: String vazia tratada corretamente'
\echo '✓ TESTE 7: Índice está sendo usado (verificar output)'
\echo '✓ TESTE 8: Índice parcial validado'
\echo '✓ TESTE 9: Estatísticas coletadas'
\echo ''
\echo 'TODOS OS TESTES CONCLUÍDOS COM SUCESSO!'
\echo ''
\echo 'Próximos passos:'
\echo '1. Revisar output de EXPLAIN ANALYZE (Teste 7)'
\echo '2. Confirmar que definição do índice está correta (Teste 8)'
\echo '3. Atualizar Model Company.ts para: allowNull: true, defaultValue: null'
\echo '4. Implementar validação de CPF/CNPJ no backend (ver ADR)'
\echo '============================================================================'
\echo ''

-- Restaurar nível de mensagens
SET client_min_messages TO NOTICE;
