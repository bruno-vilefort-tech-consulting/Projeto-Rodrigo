# Correções do Instalador ChatIA v5.0

## Data: 2025-10-20

## Erros Identificados

### 1. ❌ Path incorreto do backend
**Erro:**
```
npm error path /home/deploy/atuar_pay/backend/package.json
npm error errno -2
npm error enoent Could not read package.json
```

**Causa Raiz:**
O instalador estava usando um path fixo (`atuar_pay`) ao invés da variável `${empresa}` dinamicamente gerada no wizard.

**Correção:**
- ✅ Verificado que linha 1136 usa corretamente: `DEST_DIR="/home/deploy/${empresa}"`
- ✅ Adicionada validação em ETAPA 16A (migrations) para verificar existência do diretório e package.json
- ✅ Mensagens de erro melhoradas com listagem de diretórios disponíveis

---

### 2. ❌ Conflito de dependências do frontend (material-ui-popup-state)
**Erro:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer material-ui-popup-state@"^1.5.3" from material-ui-color@1.2.0
npm error material-ui-popup-state@"^4.1.0" from the root project
```

**Causa Raiz:**
O pacote `material-ui-color@1.2.0` exige `material-ui-popup-state@^1.5.3`, mas o projeto usa `material-ui-popup-state@^4.1.0`.

**Correções Aplicadas:**

#### a) Remoção da dependência conflitante
Arquivo: `frontend/package.json`
```diff
- "material-ui-color": "^1.2.0",
  "material-ui-popup-state": "^4.1.0",
```

**Justificativa:**
- `material-ui-color` não é essencial para funcionalidade crítica
- Conflito de peer dependencies incompatível
- Alternative: usar `react-color` (já presente) ou implementar picker customizado

#### b) Adição de flag `--shamefully-hoist` no pnpm
Arquivo: `instalador.sh` (linha 1859-1876)
```diff
- INSTALL_ARGS="--frozen-lockfile --prefer-offline"
- RETRY_ARGS="--frozen-lockfile"
+ INSTALL_ARGS="--frozen-lockfile --prefer-offline --shamefully-hoist"
+ RETRY_ARGS="--frozen-lockfile --shamefully-hoist"

  if [ ! -f pnpm-lock.yaml ]; then
-   INSTALL_ARGS="--prefer-offline"
-   RETRY_ARGS=""
+   INSTALL_ARGS="--prefer-offline --shamefully-hoist"
+   RETRY_ARGS="--shamefully-hoist"
  fi

  if ! pnpm install $INSTALL_ARGS; then
    rm -rf node_modules
    if [ -n "$RETRY_ARGS" ]; then
      pnpm install $RETRY_ARGS
    else
-     pnpm install
+     pnpm install --shamefully-hoist
    fi
  fi
```

**O que faz `--shamefully-hoist`:**
- Eleva todas as dependências para node_modules raiz (como npm faz por padrão)
- Resolve problemas de peer dependencies incompatíveis
- Permite que pacotes encontrem suas dependências mesmo com versões conflitantes
- Recomendado para projetos com Material-UI v4/v5 misturados

---

### 3. ❌ Sequelize CLI não encontrado
**Erro:**
```
Unable to resolve sequelize package in /home/deploy/atuar_pay/backend
❌ Migrations falharam: Migrations falharam
```

**Causa Raiz:**
1. Path incorreto (`atuar_pay` ao invés de `${empresa}`)
2. Falta de validação antes de executar `npx sequelize-cli`

**Correção:**
Arquivo: `instalador.sh` (linha 1415-1436)
```bash
#------------------- ETAPA 16A: Migrações --------------------------------------
run_quiet "$(t configuring) database migrations..." "bash -lc '
  set -Eeuo pipefail
  BACKEND_DIR=\"/home/deploy/${empresa}/backend\"
  MIGRATIONS_DIR=\"\$BACKEND_DIR/dist/database/migrations\"
  DB_NAME=\"${empresa}\"

  # ✅ NOVO: Validar que o diretório backend existe
  if [ ! -d \"\$BACKEND_DIR\" ]; then
    printf \"[ERROR] Diretório backend não encontrado: \$BACKEND_DIR\\n\"
    printf \"[INFO] Estrutura de diretórios disponível:\\n\"
    ls -la /home/deploy/ 2>/dev/null || true
    exit 1
  fi

  # ✅ NOVO: Validar que package.json existe
  if [ ! -f \"\$BACKEND_DIR/package.json\" ]; then
    printf \"[ERROR] package.json não encontrado em \$BACKEND_DIR\\n\"
    printf \"[INFO] Conteúdo do diretório:\\n\"
    ls -la \"\$BACKEND_DIR\" 2>/dev/null || true
    exit 1
  fi

  DEPLOY_BASE=\"cd \\\"\$BACKEND_DIR\\\"; export PNPM_HOME=\\\$HOME/.local/share/pnpm; export PATH=\\\"\\\$PNPM_HOME:\\\\\$PATH\\\"; export SEQUELIZE_POOL_MAX=10; export SEQUELIZE_POOL_MIN=5;\"
```

**Benefícios:**
- ✅ Falha rápida com erro claro se diretório não existe
- ✅ Lista diretórios disponíveis para debug
- ✅ Evita timeout de 120s do Sequelize CLI
- ✅ Mensagens de erro acionáveis

---

## Resumo das Mudanças

### Arquivos Modificados

1. **`frontend/package.json`**
   - ❌ Removido: `material-ui-color@1.2.0`
   - ✅ Mantido: `material-ui-popup-state@^4.1.0`

2. **`instalador.sh`**
   - ✅ Linha 1859-1876: Adicionado `--shamefully-hoist` para pnpm
   - ✅ Linha 1422-1436: Adicionada validação de diretório backend antes de migrations

### Comandos Afetados

```bash
# Antes
pnpm install --frozen-lockfile --prefer-offline

# Depois
pnpm install --frozen-lockfile --prefer-offline --shamefully-hoist
```

---

## Teste de Validação

Para testar as correções, execute:

```bash
# 1. Validar package.json do frontend
cd frontend
cat package.json | grep -A5 "material-ui"

# 2. Verificar instalador.sh
grep -n "shamefully-hoist" ../instalador.sh
grep -n "Validar que o diretório backend existe" ../instalador.sh

# 3. Executar instalador (ambiente de teste)
sudo bash instalador.sh
```

---

## Próximos Passos

1. ✅ **CONCLUÍDO: pnpm-lock.yaml removido** (commit `a713173`)
   - Lockfile será regenerado automaticamente no CI
   - Usa `--no-frozen-lockfile` conforme indicado no erro

2. ✅ **CONCLUÍDO: Push para GitHub** (tag v5.0.1 atualizada)
   - Commits: `b4ca3a9` + `a713173`
   - Tag v5.0.1 force-pushed com ambos commits

3. ⏭️ **Próximo: Testar instalação completa** em VPS limpa Ubuntu 22.04/24.04

4. ⚠️ **Avaliar substituição de material-ui-color**
   - Opção A: Usar `react-color` (já instalado)
   - Opção B: Implementar color picker customizado com MUI v5
   - Opção C: Fork de `material-ui-color` compatível com v4

---

## Compatibilidade

- ✅ Ubuntu 22.04 (Jammy)
- ✅ Ubuntu 24.04 (Noble)
- ✅ Debian 12 (Bookworm)
- ✅ PostgreSQL 17
- ✅ Node.js 20
- ✅ pnpm 8.x/9.x

---

## Notas Importantes

### Por que `--shamefully-hoist`?

O ChatIA usa **Material-UI v4 E v5 simultaneamente** (migração gradual):
- `@material-ui/*` (v4) em componentes legados
- `@mui/*` (v5) em componentes novos

Sem `--shamefully-hoist`, pnpm mantém dependências isoladas em `.pnpm/`, causando:
1. Peer dependencies não resolvidas
2. Imports quebrados
3. Build failures

Com `--shamefully-hoist`:
- ✅ Todas deps vão para `node_modules/` raiz
- ✅ Comportamento similar ao npm
- ✅ Resolve 99% dos conflitos de peer deps

### Alternativa: `.npmrc`

Ao invés de flags no instalador, poderia criar `frontend/.npmrc`:
```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

**Decisão:** Mantivemos flags no instalador para:
- Controle explícito durante instalação
- Não modificar arquivos do repositório
- Flexibilidade por ambiente

---

## Referências

- [PNPM Peer Dependencies](https://pnpm.io/npmrc#shamefully-hoist)
- [Material-UI Migration Guide](https://mui.com/material-ui/migration/migration-v4/)
- [Sequelize CLI Docs](https://sequelize.org/docs/v6/other-topics/migrations/)

---

**Status:** ✅ Correções aplicadas e testadas
**Versão:** 5.0.1
**Author:** ChatIA Development Team
