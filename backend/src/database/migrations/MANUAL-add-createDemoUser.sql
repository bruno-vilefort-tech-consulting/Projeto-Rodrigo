-- Migration Manual: Adicionar campo createDemoUser
-- Data: 2025-10-12
-- Descrição: Adiciona campo createDemoUser à tabela CompaniesSettings

-- ============================================
-- UP: Adicionar coluna
-- ============================================

-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'CompaniesSettings'
        AND column_name = 'createDemoUser'
    ) THEN
        ALTER TABLE "CompaniesSettings"
        ADD COLUMN "createDemoUser" VARCHAR(255) NOT NULL DEFAULT 'disabled';

        COMMENT ON COLUMN "CompaniesSettings"."createDemoUser" IS 'Controls automatic demo user creation: enabled or disabled';

        RAISE NOTICE 'Coluna createDemoUser adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna createDemoUser já existe, pulando...';
    END IF;
END $$;

-- ============================================
-- DOWN: Remover coluna (rollback)
-- ============================================

-- Para fazer rollback, execute:
-- ALTER TABLE "CompaniesSettings" DROP COLUMN IF EXISTS "createDemoUser";

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se a coluna foi adicionada:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'CompaniesSettings'
AND column_name = 'createDemoUser';

-- Verificar registros existentes (devem ter 'disabled' como valor padrão):
SELECT id, "companyId", "createDemoUser"
FROM "CompaniesSettings"
LIMIT 5;
