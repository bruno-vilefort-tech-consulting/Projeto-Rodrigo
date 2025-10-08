# Plano Multi-Tarefa: Otimizações nas Etapas 15-22 do `instalador.sh`

## 0. Preparação e Baseline
- [ ] Registrar hash/versão atual de `instalador.sh` e extrair trecho das Etapas 15-22 como referência (`sed -n '920,1050p'`).
- [ ] Anexar ou revisar `scripts/chatia-install.log` mais recente para entender mensagens existentes nas etapas alvo.
- [ ] Levantar diretórios/artefatos consumidos nas etapas (ex.: `/home/deploy/${empresa}/backend/dist`, `/mnt/pnpm-cache`, arquivos `.env`) e confirmar permissões vigentes.

## 1. Etapa 15 – Backend deps/build
- [ ] Implementar verificação de integridade (`pnpm store path`, `node_modules/.modules.yaml`) antes de reinstalar; aplicar `pnpm install --frozen-lockfile --prefer-offline` com fallback para limpeza total quando necessário.
- [ ] Registrar em log (`log_info`) quando o cache for reutilizado versus quando a reinstalação completa ocorrer.
- [ ] Introduzir sentinela (hash de `src`, `pnpm-lock.yaml`, `tsconfig.json`) para decidir se a build `pnpm run build` precisa ser executada; salvar resultado em arquivo (ex.: `.chatia_backend_build.fingerprint`) acessível na Etapa 19.
- [ ] Garantir que `dist` exista antes da Etapa 16; documentar fluxo de invalidação da sentinela.

## 2. Etapa 16 – Migrações e Seeds
- [ ] Adicionar consulta prévia a `SequelizeMeta` para detectar pendências (via `psql` ou `npx sequelize-cli db:migrate:status`); abortar cedo com log quando nada estiver pendente.
- [ ] Criar controle de versão para seeds (ex.: tabela `SeedHistory` ou arquivo `.chatia_seed` em `$HOME`) e executar `db:seed:all` apenas quando identificadas seeds novas; logar decisão.
- [ ] Antes do `UPDATE Companies`, ler valor atual e só executar quando divergente; emitir log indicando manutenção ou atualização.
- [ ] Validar que todas as consultas usem variáveis seguras (quoting) e que falhas propaguem erros adequados ao fluxo principal.

## 3. Etapa 17 – Frontend `.env`
- [ ] Gerar arquivos temporários com `mktemp`, aplicar `umask 077`, e comparar via `cmp`; apenas substituir `.env` / `.env.production` quando houver alteração.
- [ ] Utilizar `install -m 0640 -o deploy -g deploy` para combinar escrita e permissões; garantir remoção de temporários após uso.
- [ ] Adicionar logs claros para os caminhos “sem alterações” e “arquivo atualizado”.

## 4. Etapa 18 – Frontend dependências
- [ ] Replicar lógica de verificação da Etapa 15 (`.modules.yaml`, `pnpm install --prefer-offline`), evitando `rm -rf node_modules` por padrão.
- [ ] Configurar `PNPM_STORE_DIR` antes das checagens e registrar no log o caminho efetivo do cache.
- [ ] Implementar fallback seguro para reinstalação limpa (incluindo limpeza de `node_modules`, `pnpm store prune`) apenas quando a verificação falhar; logar o motivo.

## 5. Etapa 19 – Builds
- [ ] Reutilizar sentinela da Etapa 15 para pular recompilação backend quando `dist` estiver atualizado; ao rodar build, habilitar `tsc --incremental` e preservar `tsconfig.tsbuildinfo`.
- [ ] Introduzir verificação de mudanças no frontend (`src`, `.env*`, `pnpm-lock.yaml`) para decidir quando executar `pnpm run build`; logar cada decisão.
- [ ] Revisar o tratamento do cache pnpm: montar tmpfs real (`mount -t tmpfs`) ou remover o bloco de `umount`; documentar escolha e impactos.
- [ ] Consolidar logs de sucesso/falha, garantindo alinhamento com `save_checkpoint "ETAPA_19_BUILD_COMPLETO"`.

## 6. Etapa 20 – PM2
- [ ] Criar (ou reaproveitar) `ecosystem.config.js` para backend/frontend e substituir `pm2 delete/start` por `pm2 startOrReload`.
- [ ] Condicionar o uso de `lsof/kill` a casos onde `pm2 reload` falhar ou portas estejam ocupadas por processos não-PM2; registrar em log o motivo de cada intervenção.
- [ ] Executar `pm2 save` apenas quando o dump mudar (comparar `~/.pm2/dump.pm2` com cópia anterior); logar decisão.
- [ ] Validar que variáveis de ambiente (`PNPM_HOME`, `PATH`) fiquem persistidas no eco-system ou `pm2` environment para reinícios futuros.

## 7. Etapa 21 – Nginx/SSL
- [ ] Gerar configs backend/frontend em temporários, comparar com versões atuais e aplicar apenas quando houver diff; usar `install`/`mv` atômico para substituir.
- [ ] Trocar `systemctl restart nginx` por `nginx -s reload`, mantendo `restart` como fallback logado se reload falhar.
- [ ] Inserir verificação de validade do certificado (`openssl x509 -checkend <window>`) e executar `certbot renew --nginx` somente quando necessário; logar quando pular renovação.
- [ ] Garantir que novos symlinks são criados apenas quando ainda não existirem ou quando arquivos mudarem; registrar resultados.

## 8. Etapa 22 – Crons
- [ ] Gerar `reinicia_instancia.sh` via temp + `cmp` e substituir somente quando houver alterações; usar `install -m 0755`.
- [ ] Consolidar leitura/escrita do crontab em pipeline único (`(crontab -l | grep ... ) || (crontab -l; echo ...)` sem duplicidades) e logar se o job já estava presente.
- [ ] Validar permissões finais do script e presença do cron após execução (`crontab -l | grep`), registrando no log.

## 9. Observações Transversais e Validação Final
- [ ] Revisar todas as novas decisões condicionais para garantir mensagens coerentes no `LOG_FILE` (informando quando etapas foram puladas/reaproveitadas).
- [ ] Atualizar documentação inline (comentários) explicando os novos guardas/caches onde necessário.
- [ ] Rodar `bash -n instalador.sh` e `shellcheck instalador.sh` (quando disponível) após implementações.
- [ ] Executar o instalador em ambiente limpo e em ambiente já configurado para validar os novos fluxos de reaproveitamento; anexar trechos relevantes do log às notas de teste.
