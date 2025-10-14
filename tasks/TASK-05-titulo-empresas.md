# TASK-05: Alterar Título "Cadastrar Empresa" para "Empresas"

**Prioridade:** 🟢 Baixa (2)
**Tempo Estimado:** 30min
**Categoria:** Frontend
**Status:** [ ] Pendente

---

## 📋 Problema

"Alterar o título de 'Cadastrar empresa' para 'Empresas' que vai funcionar para gerenciar e pesquisar apenas"

Título atual é enganoso (sugere apenas cadastro, mas faz gestão completa).

---

## ✅ Solução

**Arquivo:** `frontend/src/translate/languages/pt.js`

```javascript
companies: {
  title: "Empresas", // Era: "Cadastrar empresa"
  add: "Adicionar Empresa",
  edit: "Editar Empresa",
  delete: "Deletar Empresa",
  // ...
}
```

**Atualizar outros idiomas:**

`en.js`: "Companies"
`es.js`: "Empresas"
`tr.js`: "Şirketler"
`ar.js`: "الشركات"

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/translate/languages/pt.js` | Alterar "Cadastrar empresa" → "Empresas" |
| `frontend/src/translate/languages/en.js` | "Companies" |
| `frontend/src/translate/languages/es.js` | "Empresas" |
| `frontend/src/translate/languages/tr.js` | "Şirketler" |
| `frontend/src/translate/languages/ar.js` | "الشركات" |

---

## ✓ Critérios de Aceitação

- [ ] Título muda para "Empresas" em português
- [ ] Traduções corretas em todos os 5 idiomas
- [ ] Funcionalidades mantidas (cadastrar, editar, pesquisar, deletar)

---

**Tempo:** 30min
