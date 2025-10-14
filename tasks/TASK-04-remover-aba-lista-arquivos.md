# TASK-04: Remover Aba Lateral "Lista de Arquivos"

**Prioridade:** 🟡 Média (3)
**Tempo Estimado:** 45min
**Categoria:** Frontend
**Status:** [ ] Pendente

---

## 📋 Problema

"Retirar aba lateral de 'Lista de arquivos'"

Item obsoleto no menu lateral que não é mais utilizado.

---

## ✅ Solução

### Passo 1: Localizar Item no Menu

**Arquivo:** `frontend/src/layout/MainListItems.js`

Procurar por:
```javascript
<ListItem button onClick={() => navigate('/files')}>
  <ListItemIcon><FolderIcon /></ListItemIcon>
  <ListItemText primary="Lista de arquivos" />
</ListItem>
```

### Passo 2: Remover ou Comentar

```javascript
{/* REMOVIDO: Lista de arquivos não é mais usado
<ListItem button onClick={() => navigate('/files')}>
  <ListItemIcon><FolderIcon /></ListItemIcon>
  <ListItemText primary={i18n.t("menu.files")} />
</ListItem>
*/}
```

### Passo 3: Remover Rota (se existir)

**Arquivo:** `frontend/src/routes/index.js`

```javascript
// REMOVER:
// { path: '/files', element: <FileList /> }
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/layout/MainListItems.js` | Remover ListItem |
| `frontend/src/routes/index.js` | Remover rota (se existir) |

---

## ✓ Critérios de Aceitação

- [ ] Item "Lista de arquivos" não aparece no menu
- [ ] Navegar `/files` retorna 404
- [ ] Sem erros no console

---

**Tempo:** 45min
