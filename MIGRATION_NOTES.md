# Migration Notes: Installer Patch Migration

## Patch Inventory (instalador.sh)
| Linhas | Comando | Alvo | Resumo |
| --- | --- | --- | --- |
| 1428 | `pnpm add …`; `printf … > tsconfig.json` | `/home/deploy/${empresa}/backend/package.json`, `pnpm-lock.yaml`, `tsconfig.json` | Força reinstalação, injeta dependências extras e sobrescreve `backend/tsconfig.json`. |
| 1429 | `find … -exec sed -i` | `backend/src/**/*.ts` | Troca imports `mime-types` → `mime` em todos os arquivos TypeScript. |
| 1430 | `sed -i` | `backend/src/services/WbotServices/SendWhatsAppMediaFlow.ts` | Aplica fallback `|| 'application/octet-stream'` para `mime.lookup()`. |
| 1432 | `sed -i`; `echo >` | `backend/node_modules/@ffmpeg-installer/ffmpeg/index.js`, `backend/node_modules/@ffmpeg-installer/linux-x64/package.json` | Força binário `/usr/bin/ffmpeg` editando `node_modules` e cria `package.json` sintético. |
| 1477–1489 | `pnpm add …` | `/home/deploy/${empresa}/frontend/package.json`, `pnpm-lock.yaml` | Remove `node_modules`/locks e injeta dependências adicionais (axios, clsx, polyfills, craco plugins etc.). |
| 1490–1492 | `sed -i` | `frontend/package.json` | Substitui scripts `react-scripts` por `craco`. |
| 1493–1521 | `cat > craco.config.js` | `frontend/craco.config.js` | Gera configuração webpack customizada (fallbacks, remove ESLint/ModuleScope). |
| 1522–1536 | `cat > server.js` | `frontend/server.js` | Cria servidor Express com `dotenv` para servir build. |
| 1537 | `pnpm add express dotenv` | `frontend/package.json`, `pnpm-lock.yaml` | Injeta dependências runtime para o servidor customizado. |
| 1538–1559 | `cat > src/config/env.{js,Js}` | `frontend/src/config/env.js`, `Env.js` | Cria módulos JS para ler variáveis em runtime e exportar constantes. |
| 1560–1593 | `cat > src/config/env.{ts,Ts}` | `frontend/src/config/env.ts`, `Env.ts` | Cria contrapartes TypeScript com tipagem forte e exportações. |
| 1595–1598 | `pnpm remove react-trello` | `frontend/package.json` | Remove dependência `react-trello` (ou apaga manualmente). |
| 1600–1644 | `cat > src/pages/Kanban/index.js` | `frontend/src/pages/Kanban/index.js` | Substitui tela Kanban por placeholder informativo. |
| 1645–1688 | `cat > src/pages/TagsKanban/index.js` | `frontend/src/pages/TagsKanban/index.js` | Substitui tela Tags Kanban por placeholder similar. |
| 1690–1696 | `sed -i` | `frontend/src/index.js`, `src/index.tsx` | Força `serviceWorker.unregister()` para evitar cache legado. |

## Migration Plan (Permanent Code Changes)
- **Backend deps + tsconfig (1428)**: Atualizar `backend/package.json` (deps e devDeps) e adicionar `pnpm-lock.yaml`; versionar `tsconfig.json` com as opções emitidas pelo instalador.
- **Imports mime (1429)**: Refatorar fontes para usar `mime` e garantir tipagens; remover dependência implícita de `mime-types`.
- **Fallback mimetype (1430)**: Incorporar fallback diretamente em `SendWhatsAppMediaFlow.ts`.
- **FFmpeg path (1432)**: Criar utilitário que lê `process.env.FFMPEG_PATH` antes de recorrer ao `@ffmpeg-installer/ffmpeg`, removendo edição de `node_modules`.
- **Frontend deps/scripts (1477–1492, 1537, 1595–1598)**: Consolidar dependências em `frontend/package.json` (axios 1.x, clsx, moment-timezone, polyfills, express/dotenv) e remover `react-trello`; gerar `pnpm-lock.yaml`; manter scripts `craco`.
- **craco.config.js (1493–1521)**: Versionar arquivo com fallback completos conforme gerado.
- **server.js (1522–1536)**: Sincronizar a versão Express com `dotenv.config()` e host configurável.
- **Config env modules (1538–1593)**: Versionar `src/config/env.{js,ts}` e `Env.{js,ts}` com exportações identicamente geradas.
- **Kanban placeholders (1600–1688)**: Substituir componentes Kanban/Tags por placeholders estáticos.
- **Service worker unregister (1690–1696)**: Persistir `serviceWorker.unregister()` no(s) entrypoint(s).
- **Installer cleanup**: Após migrar cada item, remover comandos correspondentes do `instalador.sh` mantendo logs/operações legítimas.

Validation per patch incluirá lint/build/backend+frontend e execução idempotente do instalador.
