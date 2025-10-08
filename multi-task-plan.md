# Plano Multi-Tarefa: Incorporar Patches do Instalador ao Repositório

## 1. Preparação
- [ ] Mapear a branch base e abrir issue/PR para sincronizar ajustes do instalador.
- [ ] Consolidar `scripts/chatia-install.log` recente comprovando os trechos que ainda executam patches manuais.
- [ ] Levantar versão atual do backend/frontend (commit/tag) para alinhar dependências e artefatos gerados.

## 2. Backend
- [x] Copiar o `tsconfig.json` gerado pelo instalador (`instalador.sh:1428`) para `backend/tsconfig.json`, garantindo que o repositório já contenha as opções esperadas.
- [x] Adicionar em `backend/package.json` e `pnpm-lock.yaml` todas as dependências instaladas pelo script (`puppeteer-core`, `glob`, `jimp`, `mime`, `form-data`, `qs`, `bluebird`, `@types/*` etc.).
- [x] Atualizar imports em todas as referências `mime-types` → `mime` no backend (ação hoje feita via `sed` em `instalador.sh:1429`).
- [x] Aplicar o fallback `mime.lookup(media) || 'application/octet-stream'` diretamente em `src/services/WbotServices/SendWhatsAppMediaFlow.ts`.
- [x] Revisar o wrapper de FFmpeg: expor `FFMPEG_PATH` ou configurar `@ffmpeg-installer/ffmpeg` para usar `/usr/bin/ffmpeg`, evitando a edição de `node_modules` realizada em `instalador.sh:1432`.

## 3. Frontend
- [x] Atualizar `frontend/package.json` para incluir as dependências adicionadas pelo instalador (`axios`, `clsx`, `moment`, polyfills browserify, `express`, `dotenv`, `@craco/craco`, plugins Babel etc.) e garantir consistência no lockfile.
- [x] Versionar `frontend/craco.config.js` com os mesmos ajustes de webpack gerados em `instalador.sh:1493-1521`.
- [x] Adicionar `frontend/server.js` (Express + dotenv) ao repositório e ajustar scripts `start/build/test` para usar `craco`.
- [x] Criar e versionar `frontend/src/config/env.js`, `Env.js`, `env.ts`, `Env.ts` com a lógica de carregamento de variáveis hoje escrita pelo instalador.
- [x] Remover `react-trello` do repositório e substituir pelas páginas placeholder Kanban/Tags conforme conteúdo gerado em `instalador.sh:1595-1688`.
- [x] Ajustar `frontend/src/index.js` e `frontend/src/index.tsx` para chamar `serviceWorker.unregister()` de forma permanente.

## 4. Ajustes no Instalador
- [x] Eliminar blocos de `instalador.sh` que recriam arquivos agora versionados (tsconfig, craco config, envs, server.js, Kanban, service worker).
- [x] Remover comandos `pnpm add` redundantes, mantendo apenas `pnpm install` com locks do repositório.
- [x] Substituir alterações em `node_modules` por configuração via env/variáveis documentadas.
- [ ] Garantir que o instalador continue apenas sincronizando o código (`git clone`/`rsync`) e aplicando variáveis de ambiente (.env backend/frontend).

## 5. Validação e Release
- [ ] Executar `bash -n instalador.sh` e `shellcheck instalador.sh` após a limpeza.
- [ ] Realizar deploy completo em ambiente de teste usando o código atualizado, registrando `scripts/chatia-install.log`.
- [ ] Validar build do backend (`pnpm run build`) e frontend (`pnpm run build`) diretamente do repositório sem patches extras.
- [ ] Atualizar documentação/README descrevendo novas variáveis (`FFMPEG_PATH`) e fluxo simplificado.
- [ ] Criar tag/release e comunicar operadores que o instalador agora assume o código já preparado no GitHub.
