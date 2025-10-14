# TASK-11: Corrigir Erros na Tela de Contatos

**Prioridade:** 🟠 Alta (4)
**Tempo Estimado:** 4h
**Categoria:** Frontend + Backend
**Status:** [ ] Pendente

---

## 📋 Problemas Identificados

**3 erros distintos:**

1. **Título "Conexão" errado** → Deveria ser "Telefone" ou "WhatsApp"
2. **Erros de tradução** ao importar contatos (português incorreto)
3. **"Internal error"** ao adicionar contato manualmente

---

## ✅ Soluções

### Correção 1: Título do Telefone

**Arquivo:** `frontend/src/pages/Contacts/index.js`

Procurar por:
```javascript
<TableCell>{i18n.t("contacts.table.connection")}</TableCell>
```

Alterar para:
```javascript
<TableCell>{i18n.t("contacts.table.whatsapp")}</TableCell>
```

**Arquivo:** `frontend/src/translate/languages/pt.js`
```javascript
contacts: {
  table: {
    name: "Nome",
    whatsapp: "WhatsApp", // ✅ Adicionar ou corrigir
    email: "Email",
    // ...
  }
}
```

### Correção 2: Erros de Tradução

**Arquivo:** `frontend/src/translate/languages/pt.js`

Verificar seção `contacts.import`:
```javascript
contacts: {
  import: {
    title: "Importar Contatos",
    selectFile: "Selecionar Arquivo",
    uploadButton: "Enviar",
    success: "Contatos importados com sucesso"
  }
}
```

### Correção 3: Internal Error ao Criar Contato

**Investigar backend:**

**Arquivo:** `backend/src/controllers/ContactController.ts`

Verificar método `store`:
```typescript
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, number, email } = req.body;
    const { companyId } = req.user;

    // Validações
    if (!name || !number) {
      throw new AppError("ERR_CONTACT_INVALID_DATA", 400);
    }

    const contact = await CreateContactService({
      name,
      number,
      email,
      companyId
    });

    return res.status(200).json(contact);
  } catch (err) {
    logger.error("Error creating contact:", err);
    throw new AppError("ERR_CREATING_CONTACT", 500);
  }
};
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/pages/Contacts/index.js` | Corrigir título coluna |
| `frontend/src/translate/languages/pt.js` | Corrigir traduções |
| `backend/src/controllers/ContactController.ts` | Adicionar logs + validações |
| `backend/src/services/ContactServices/CreateContactService.ts` | Verificar lógica |

---

## ✓ Critérios de Aceitação

- [ ] Coluna mostra "WhatsApp" em vez de "Conexão"
- [ ] Importar contatos: traduções em português correto
- [ ] Criar contato manualmente: sem "internal error"
- [ ] Logs mostram erro específico quando criar contato falha

---

**Tempo:** 4h (investigação + correções + testes)
