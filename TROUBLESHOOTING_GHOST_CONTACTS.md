# 🔍 Troubleshooting - Contatos Fantasmas

## Problema: Contatos fantasmas ainda aparecem após correções

### ✅ Passo 1: Limpar Cache do Navegador

O problema mais comum é **cache do navegador** mantendo o JavaScript antigo.

**Opção A - Hard Refresh (Recomendado):**
1. Com a página `/contacts` aberta
2. Pressione **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac)
3. Isso força o navegador a baixar todos os arquivos novamente

**Opção B - Limpar Cache Manualmente:**
1. Abra DevTools (F12)
2. Clique com botão direito no ícone de reload
3. Selecione "Empty Cache and Hard Reload"

**Opção C - Limpar Cache do Navegador:**
1. Chrome: Settings → Privacy → Clear browsing data → Cached images and files
2. Firefox: Settings → Privacy → Clear Data → Cached Web Content

---

### ✅ Passo 2: Verificar se a Validação V2 está Ativa

1. Acesse: `http://localhost:3000/contacts?debug=contacts`
2. Abra o **Console do navegador** (F12 → Console)
3. Você deve ver logs como:
   ```
   🔍 [VALIDATION V2] Validando contato: {...}
   ❌ [VALIDATION V2] Número muito longo: 18 dígitos
   🚫 Contato inválido filtrado: {...}
   ```

**Se NÃO ver esses logs:**
- A validação antiga ainda está em cache
- Tente os passos do Passo 1 novamente
- Reinicie o servidor frontend: `npm run dev` (na pasta frontend)

**Se ver os logs:**
- ✅ A validação V2 está ativa!
- Os contatos fantasmas devem ser filtrados
- Se ainda aparecem, veja o Passo 3

---

### ✅ Passo 3: Limpar Contatos Fantasmas do Banco de Dados

Se a validação está ativa mas ainda vê contatos fantasmas, eles podem estar em cache do React ou você precisa limpá-los do banco.

**Visualizar contatos fantasmas (sem deletar):**
\`\`\`bash
cd backend
node scripts/clean-ghost-contacts.js --dry-run
\`\`\`

**Limpar contatos fantasmas do banco:**
\`\`\`bash
cd backend
node scripts/clean-ghost-contacts.js --company-id=1
\`\`\`

> ⚠️ **ATENÇÃO:** Isso irá DELETAR os contatos fantasmas do banco de dados permanentemente!
>
> O script tem 5 segundos de delay para você cancelar (Ctrl+C)

---

### ✅ Passo 4: Verificar Logs no Console

Com `?debug=contacts` na URL, você deve ver:

**Contatos VÁLIDOS (não bloqueados):**
```
✅ Contato válido: João Silva (source: manual)
✅ Contato válido: Maria Santos (number: 5511999999999)
```

**Contatos BLOQUEADOS (fantasmas):**
```
🚫 Contato fantasma auto_created filtrado: {...}
   Razão: Criado automaticamente e não está na agenda

🚫 Contato inválido filtrado: {...}
   Razão: Número de telefone com formato inválido

❌ [VALIDATION V2] Número muito longo: 18 dígitos
```

---

### 🔍 Diagnóstico Rápido

| Sintoma | Causa Provável | Solução |
|---------|---------------|---------|
| Não vejo logs `[VALIDATION V2]` | Cache do navegador | Hard Refresh (Ctrl+Shift+R) |
| Vejo logs mas contatos ainda aparecem | Cache do React ou banco | Recarregue a página completamente |
| Contatos reaparecem após reload | Ainda no banco de dados | Execute o script de limpeza |
| Alguns contatos válidos são bloqueados | Validação muito restritiva | Reporte no GitHub com exemplo |

---

### 📊 Padrões Bloqueados

A validação V2 bloqueia números com:

- ❌ Mais de 15 dígitos (E.164 máximo)
- ❌ Menos de 8 dígitos
- ❌ Começa com `555[0-4]` (números de teste)
- ❌ Começa com `120XXX` (padrão suspeito)
- ❌ Sequências: `123456`, `012345`, `987654`
- ❌ 4+ zeros consecutivos: `0000`
- ❌ 70%+ dígitos repetidos: `111111111111`

E contatos com:
- ❌ `source='auto_created'` + `isInAgenda=false`

---

### 🆘 Ainda com Problemas?

Se após seguir TODOS os passos acima os contatos fantasmas ainda aparecem:

1. Anote o **número exato** do contato fantasma
2. Abra o Console (F12) e copie os logs
3. Execute no banco:
   \`\`\`sql
   SELECT id, name, number, source, "isInAgenda"
   FROM "Contacts"
   WHERE number = 'NUMERO_AQUI';
   \`\`\`
4. Reporte com essas informações

---

### ✅ Checklist de Verificação

- [ ] Hard Refresh no navegador (Ctrl+Shift+R)
- [ ] Console mostra logs `[VALIDATION V2]`
- [ ] Recarregou a página completamente
- [ ] Executou script de limpeza (opcional)
- [ ] Verificou logs de bloqueio no console
- [ ] Contatos fantasmas sumiram! 🎉

---

**Última atualização:** 2025-10-14
**Versão da validação:** 2.0.0
