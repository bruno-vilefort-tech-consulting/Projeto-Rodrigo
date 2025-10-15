-- ================================================================================
-- MIGRATION MANUAL: Adicionar campos de timer de lane aos Tickets
-- Arquivo: add-lane-timer-fields-manual.sql
-- Data: 2025-10-15
-- ================================================================================
--
-- Esta migration adiciona dois campos à tabela Tickets para suportar
-- a movimentação automática de cards no kanban baseada em timer.
--
-- Execute este SQL APENAS SE a migration automática não funcionar.
--
-- ================================================================================

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar laneTimerStartedAt se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='Tickets' AND column_name='laneTimerStartedAt'
    ) THEN
        ALTER TABLE "Tickets"
        ADD COLUMN "laneTimerStartedAt" TIMESTAMP NULL;

        COMMENT ON COLUMN "Tickets"."laneTimerStartedAt" IS
            'Data/hora quando o timer da lane foi iniciado (quando atendente enviou mensagem)';

        RAISE NOTICE 'Coluna laneTimerStartedAt adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna laneTimerStartedAt já existe, pulando';
    END IF;

    -- Adicionar laneNextMoveAt se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='Tickets' AND column_name='laneNextMoveAt'
    ) THEN
        ALTER TABLE "Tickets"
        ADD COLUMN "laneNextMoveAt" TIMESTAMP NULL;

        COMMENT ON COLUMN "Tickets"."laneNextMoveAt" IS
            'Data/hora quando o ticket deve ser movido automaticamente para nextLaneId';

        RAISE NOTICE 'Coluna laneNextMoveAt adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna laneNextMoveAt já existe, pulando';
    END IF;
END $$;

-- Criar índices para melhorar performance das queries do cron job
CREATE INDEX IF NOT EXISTS "idx_tickets_lane_next_move_at"
    ON "Tickets" ("laneNextMoveAt")
    WHERE "laneNextMoveAt" IS NOT NULL;

COMMENT ON INDEX "idx_tickets_lane_next_move_at" IS
    'Índice para otimizar busca de tickets com timer de lane expirado';

-- Verificação final
SELECT
    'laneTimerStartedAt' AS campo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='Tickets' AND column_name='laneTimerStartedAt'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END AS status
UNION ALL
SELECT
    'laneNextMoveAt' AS campo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='Tickets' AND column_name='laneNextMoveAt'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END AS status;

-- ================================================================================
-- ROLLBACK (caso precise reverter a migration)
-- ================================================================================
--
-- Para reverter estas alterações, execute:
--
-- ALTER TABLE "Tickets" DROP COLUMN IF EXISTS "laneTimerStartedAt";
-- ALTER TABLE "Tickets" DROP COLUMN IF EXISTS "laneNextMoveAt";
-- DROP INDEX IF EXISTS "idx_tickets_lane_next_move_at";
--
-- ================================================================================
