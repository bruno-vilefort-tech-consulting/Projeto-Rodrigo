-- Script para adicionar coluna matchType na tabela FlowCampaigns
-- Execute este script diretamente no PostgreSQL

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='FlowCampaigns'
        AND column_name='matchType'
    ) THEN
        ALTER TABLE "FlowCampaigns"
        ADD COLUMN "matchType" VARCHAR(20) NOT NULL DEFAULT 'exact';

        RAISE NOTICE 'Coluna matchType adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna matchType já existe.';
    END IF;
END $$;

-- Verificar as colunas da tabela
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'FlowCampaigns'
ORDER BY ordinal_position;
