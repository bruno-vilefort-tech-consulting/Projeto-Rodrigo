# 🧹 Script de Limpeza de Contatos Fantasmas

## 📋 Descrição

Este script SQL remove contatos "fantasmas" que aparecem na página `/contacts` mas não estão na agenda do telefone. Esses contatos são criados automaticamente quando mensagens são recebidas de números desconhecidos.

## 🚨 IMPORTANTE: Backup Antes de Executar!

**SEMPRE faça backup do banco de dados antes de executar scripts de limpeza!**

```bash
# Fazer backup do banco PostgreSQL
pg_dump -U chatia -d chatia > backup_chatia_$(date +%Y%m%d_%H%M%S).sql

# Ou usando Docker (se aplicável)
docker exec chatia-postgres pg_dump -U chatia chatia > backup_chatia_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📊 Análise Prévia

Antes de limpar, execute a seção de análise para ver quantos contatos serão afetados:

```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend

# Conectar ao PostgreSQL
psql -U chatia -d chatia

# Ou usando Docker
docker exec -it chatia-postgres psql -U chatia -d chatia
```

Então execute **APENAS** as queries da seção 1 (linhas 14-46):

```sql
-- Ver quantos contatos serão afetados
SELECT COUNT(*) FROM "Contacts"
WHERE source = 'whatsapp_message'
  AND "isInAgenda" = false;
```

---

## 🔧 Execução do Script

### Método 1: Via psql (Recomendado)

```bash
# Executar script completo
psql -U chatia -d chatia -f scripts/cleanup-ghost-contacts.sql

# Ou linha por linha (mais seguro)
psql -U chatia -d chatia

\i scripts/cleanup-ghost-contacts.sql
```

### Método 2: Via Docker

```bash
# Copiar script para container
docker cp scripts/cleanup-ghost-contacts.sql chatia-postgres:/tmp/

# Executar dentro do container
docker exec -it chatia-postgres psql -U chatia -d chatia -f /tmp/cleanup-ghost-contacts.sql
```

### Método 3: Via GUI (DBeaver, pgAdmin, etc.)

1. Abrir conexão com banco `chatia`
2. Criar nova query
3. Copiar conteúdo de `cleanup-ghost-contacts.sql`
4. Executar seção por seção (recomendado)

---

## 📝 Seções do Script

### 1️⃣ Análise Prévia (Linhas 14-46)
- Ver quantos contatos serão deletados
- **SEMPRE executar antes da limpeza**

### 2️⃣ Backup (Linhas 51-65)
- Cria tabela `Contacts_Backup_20251014`
- Salva contatos que serão deletados
- **Executar antes da limpeza**

### 3️⃣ Limpeza Conservadora (Linhas 70-105)
- Remove apenas contatos claramente "fantasmas"
- Não remove contatos com tickets associados
- **Modo seguro (recomendado)**

### 4️⃣ Limpeza Agressiva (Linhas 110-145) - OPCIONAL
- Remove mais contatos
- **CUIDADO:** Comentado por padrão
- Apenas descomentar se realmente necessário

### 5️⃣ Verificação (Linhas 150-175)
- Mostra estatísticas pós-limpeza
- **Sempre executar após limpeza**

### 6️⃣ Otimização (Linhas 180-190)
- Reindexar e vacuumar tabelas
- Recupera espaço em disco

### 7️⃣ Monitoramento (Linhas 195-210)
- Cria view `vw_contacts_health`
- Acompanhamento contínuo

### 8️⃣ Rollback (Linhas 215-230) - SE NECESSÁRIO
- Restaura contatos do backup
- **Apenas usar se algo der errado**

---

## ⚠️ Avisos Importantes

### ❌ NÃO execute se:
- Não fez backup do banco
- Não executou a análise prévia
- Está em horário de pico de uso
- Não tem certeza do impacto

### ✅ Pode executar se:
- Fez backup do banco
- Executou análise prévia
- Está fora do horário comercial
- Revisou os contatos que serão deletados

---

## 🧪 Testes

Após executar o script:

1. **Verificar contatos restantes:**
```sql
SELECT COUNT(*) FROM "Contacts";
SELECT COUNT(*) FROM "Contacts" WHERE source = 'whatsapp_message';
```

2. **Verificar página /contacts no frontend:**
- Acessar `http://localhost:3000/contacts`
- Verificar se contatos "fantasmas" sumiram
- Verificar se contatos legítimos permanecem

3. **Verificar tickets:**
```sql
-- Garantir que nenhum ticket ficou sem contato
SELECT COUNT(*) FROM "Tickets" t
WHERE NOT EXISTS (
  SELECT 1 FROM "Contacts" c
  WHERE c.id = t."contactId"
);
```

---

## 🔄 Rollback

Se algo der errado, restaurar do backup:

### Método 1: Restaurar do backup SQL
```bash
psql -U chatia -d chatia < backup_chatia_YYYYMMDD_HHMMSS.sql
```

### Método 2: Restaurar da tabela de backup do script
```sql
BEGIN;

INSERT INTO "Contacts"
SELECT * FROM "Contacts_Backup_20251014"
ON CONFLICT (id) DO NOTHING;

COMMIT;
```

---

## 📊 Monitoramento Contínuo

Após a limpeza, monitorar com a view criada:

```sql
-- Ver saúde dos contatos em tempo real
SELECT * FROM vw_contacts_health;

-- Contatos criados na última semana
SELECT * FROM vw_contacts_health
WHERE criados_ultima_semana > 0;
```

---

## 🔁 Execução Periódica

Recomenda-se executar este script:
- **Mensalmente:** Para limpeza regular
- **Semanalmente:** Se houver muito tráfego de mensagens
- **Após atualizações:** Do backend que afetam contatos

Agendar via cron:
```bash
# Executar todo domingo às 3h da manhã
0 3 * * 0 psql -U chatia -d chatia -f /path/to/cleanup-ghost-contacts.sql
```

---

## 📈 Resultados Esperados

Após execução bem-sucedida:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Contatos totais | 5000 | 3500 |
| Contatos "fantasmas" | 1500 | 0 |
| Contatos legítimos | 3500 | 3500 |
| Espaço em disco | 100MB | 70MB |

---

## 🆘 Troubleshooting

### Erro: "permission denied"
```bash
# Garantir permissões corretas
sudo chown chatia:chatia scripts/cleanup-ghost-contacts.sql
```

### Erro: "table already exists"
```sql
-- Remover tabela de backup antiga
DROP TABLE IF EXISTS "Contacts_Backup_20251014";
```

### Script muito lento
```sql
-- Executar em horário de baixo tráfego
-- Ou executar seção por seção com intervalos
```

---

## ✅ Checklist de Execução

- [ ] Backup do banco de dados feito
- [ ] Análise prévia executada e revisada
- [ ] Horário adequado (fora de pico)
- [ ] Script revisado e compreendido
- [ ] Backup automático do script criado (seção 2)
- [ ] Limpeza conservadora executada (seção 3)
- [ ] Verificação pós-limpeza realizada (seção 5)
- [ ] Frontend testado (página /contacts)
- [ ] Tickets verificados (nenhum órfão)
- [ ] Monitoramento configurado (view criada)

---

**Data:** 2025-10-14
**Autor:** Claude Code Agent
**Versão:** 1.0
**Prioridade:** P1 (ALTA)
