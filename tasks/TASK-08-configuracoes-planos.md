# TASK-08: Configurações de Planos - Ocultar "Público" e Renomear "Talk.ia"

**Prioridade:** 🟢 Baixa (2)
**Tempo Estimado:** 1h30min
**Categoria:** Frontend
**Status:** [ ] Pendente

---

## 📋 Problema

1. Campo "Público" aparece nas configurações de planos, mas não deve ser visível
2. Texto "Talk.ia" precisa ser renomeado para "Prompts"

---

## ✅ Solução

### Correção 1: Ocultar Campo "Público"

**Arquivo:** `frontend/src/pages/Plans/index.js` ou `frontend/src/components/PlanModal/index.js`

```javascript
// Localizar o campo "Público" e removê-lo ou ocultá-lo
// ANTES:
<TextField
  name="public"
  label="Público"
  type="checkbox"
  // ...
/>

// DEPOIS (remover completamente ou adicionar conditional):
{/* Campo Público removido - não deve ser editável pelo usuário */}

// OU se precisar manter no backend mas ocultar na UI:
<input
  type="hidden"
  name="public"
  value={formik.values.public || false}
/>
```

### Correção 2: Renomear "Talk.ia" para "Prompts"

**Arquivos de Tradução:**

`frontend/src/translate/languages/pt.js`
```javascript
plans: {
  // ...
  talkia: "Prompts",  // Era: "Talk.ia"
  talkiaDescription: "Gerenciar prompts do sistema",
  // OU se a chave for diferente:
  aiFeatures: "Prompts",
  // ...
}
```

**Outros idiomas:**

`en.js`: "Prompts"
`es.js`: "Prompts"
`tr.js`: "Promptlar"
`ar.js`: "المطالبات"

### Verificar Componente de Planos

**Arquivo:** `frontend/src/pages/Plans/index.js`

```javascript
// Localizar referência a "Talk.ia" e garantir que usa tradução
<Typography variant="h6">
  {i18n.t("plans.prompts")} {/* ✅ Usa chave de tradução */}
</Typography>

// OU se estiver hardcoded:
<Typography variant="h6">
  Prompts {/* ✅ Texto direto se não houver tradução */}
</Typography>
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/pages/Plans/index.js` | Ocultar campo "Público" |
| `frontend/src/components/PlanModal/index.js` | Verificar/ocultar campo "Público" |
| `frontend/src/translate/languages/pt.js` | "Talk.ia" → "Prompts" |
| `frontend/src/translate/languages/en.js` | Atualizar tradução |
| `frontend/src/translate/languages/es.js` | Atualizar tradução |
| `frontend/src/translate/languages/tr.js` | Atualizar tradução |
| `frontend/src/translate/languages/ar.js` | Atualizar tradução |

---

## ✓ Critérios de Aceitação

- [ ] Campo "Público" não aparece na UI de planos
- [ ] Texto "Talk.ia" substituído por "Prompts" em português
- [ ] Traduções corretas em todos os 5 idiomas
- [ ] Funcionalidades de planos mantidas (criar, editar, deletar)
- [ ] Sem erros no console

---

## 🧪 Casos de Teste

### Teste 1: Campo "Público" Oculto
```
1. Acessar página de Planos
2. Clicar em "Adicionar Plano"
3. Verificar modal de criação
4. ✅ Campo "Público" não deve aparecer
```

### Teste 2: Renomeação "Talk.ia" → "Prompts"
```
1. Navegar pela interface de Planos
2. Verificar todos os textos e labels
3. ✅ "Prompts" aparece ao invés de "Talk.ia"
4. Alternar idioma para inglês
5. ✅ "Prompts" mantém consistência
```

### Teste 3: Planos Funcionais
```
1. Criar novo plano
2. Editar plano existente
3. Deletar plano
4. ✅ Todas as operações funcionam normalmente
```

---

## 🔍 Localização Provável dos Arquivos

```bash
# Buscar componentes de Planos
find frontend/src -name "*Plan*" -o -name "*plan*"

# Buscar referências a "Público"
grep -r "Público\|public" frontend/src/pages/Plans/
grep -r "Público\|public" frontend/src/components/PlanModal/

# Buscar referências a "Talk.ia"
grep -r "Talk\.ia\|talkia" frontend/src/translate/
grep -r "Talk\.ia\|talkia" frontend/src/pages/Plans/
```

---

## 📝 Observações

- Se o campo "Público" for crítico no backend, manter como `hidden` ao invés de remover completamente
- Garantir que a renomeação não quebra integrações com o sistema de IA/Prompts
- Verificar se há documentação que menciona "Talk.ia" e atualizar também

---

**Tempo:** 1h30min
