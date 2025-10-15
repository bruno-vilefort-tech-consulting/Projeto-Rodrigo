# 🛠️ Correções Backend: Contatos Fantasmas

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`

## 📋 Modificações Necessárias

### 1. Modificar a função `verifyContact()` (Linhas 870-907)

**Localização:** `backend/src/services/WbotServices/wbotMessageListener.ts:870`

#### Código ANTES:
```typescript
const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string = "";

  const { lid, jid } = parseLidJid(msgContact?.id);

  const contactData = {
    name: msgContact.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    remoteJid: msgContact.id,
    whatsappId: wbot.id,
    wbot,
    lid,
    jid
  };

  if (contactData.isGroup) {
    contactData.number = msgContact.id.replace("@g.us", "");
  }

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};
```

#### Código DEPOIS:
```typescript
const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number,
  options?: {
    source?: string;
    isInAgenda?: boolean;
  }
): Promise<Contact> => {
  let profilePicUrl: string = "";

  const { lid, jid } = parseLidJid(msgContact?.id);

  // 🛡️ CORREÇÃO: Adicionar source e isInAgenda para rastreamento de origem do contato
  // Isso permite identificar e filtrar contatos criados automaticamente vs. agenda
  const contactData = {
    name: msgContact.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    remoteJid: msgContact.id,
    whatsappId: wbot.id,
    wbot,
    lid,
    jid,
    // ✅ NOVOS CAMPOS para rastreamento
    source: options?.source || "whatsapp_message", // Origem: mensagem do WhatsApp
    isInAgenda: options?.isInAgenda !== undefined ? options.isInAgenda : false // Não está na agenda por padrão
  };

  if (contactData.isGroup) {
    contactData.number = msgContact.id.replace("@g.us", "");
  }

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};
```

**Mudanças:**
1. ✅ Adicionar parâmetro opcional `options` com `source` e `isInAgenda`
2. ✅ Adicionar campos `source` e `isInAgenda` ao `contactData`
3. ✅ Valores padrão: `source: "whatsapp_message"`, `isInAgenda: false`

---

### 2. Modificar Evento `contacts.update` do Baileys

**Localização:** Procure por `sock.ev.on("contacts.update"` no arquivo

#### Código ANTES:
```typescript
sock.ev.on("contacts.update", async (contacts) => {
  for (const contact of contacts) {
    // Cria ou atualiza contato automaticamente
    await CreateOrUpdateContactService({
      number: contact.id.split("@")[0],
      name: contact.name || contact.id.split("@")[0],
      // ...
    });
  }
});
```

#### Código DEPOIS:
```typescript
sock.ev.on("contacts.update", async (contacts) => {
  for (const contact of contacts) {
    // 🛡️ CORREÇÃO: Apenas ATUALIZAR contatos existentes, NÃO criar novos
    const existingContact = await Contact.findOne({
      where: {
        number: contact.id.split("@")[0],
        companyId: companyId
      }
    });

    if (!existingContact) {
      console.log("⚠️ Baileys contacts.update: Ignorando contato novo (não está na agenda)", {
        contactId: contact.id,
        contactName: contact.name
      });
      continue; // ✅ Pular se não existir
    }

    // Apenas atualizar se já existe
    await existingContact.update({
      name: contact.name || existingContact.name,
      // ... outros campos
    });

    console.log("✅ Baileys contacts.update: Contato atualizado", {
      contactId: existingContact.id,
      contactName: existingContact.name
    });
  }
});
```

**Mudanças:**
1. ✅ Verificar se contato JÁ EXISTE antes de criar/atualizar
2. ✅ Se NÃO existir, **ignorar** (não criar)
3. ✅ Se existir, apenas **atualizar** informações
4. ✅ Adicionar logs para debug

---

### 3. Modificar Evento `groups.update` do Baileys

**Localização:** Procure por `sock.ev.on("groups.update"` no arquivo

#### Código ANTES:
```typescript
sock.ev.on("groups.update", async (groups) => {
  for (const group of groups) {
    // Cria grupo como contato automaticamente
    await CreateOrUpdateContactService({
      number: group.id.replace("@g.us", ""),
      name: group.subject,
      isGroup: true,
      // ...
    });
  }
});
```

#### Código DEPOIS:
```typescript
sock.ev.on("groups.update", async (groups) => {
  for (const group of groups) {
    // 🛡️ CORREÇÃO: Apenas ATUALIZAR grupos existentes, NÃO criar novos
    const existingGroup = await Contact.findOne({
      where: {
        number: group.id.replace("@g.us", ""),
        isGroup: true,
        companyId: companyId
      }
    });

    if (!existingGroup) {
      console.log("⚠️ Baileys groups.update: Ignorando grupo novo", {
        groupId: group.id,
        groupSubject: group.subject
      });
      continue; // ✅ Pular se não existir
    }

    // Apenas atualizar se já existe
    await existingGroup.update({
      name: group.subject || existingGroup.name,
      // ... outros campos
    });

    console.log("✅ Baileys groups.update: Grupo atualizado", {
      groupId: existingGroup.id,
      groupName: existingGroup.name
    });
  }
});
```

**Mudanças:**
1. ✅ Verificar se grupo JÁ EXISTE antes de criar/atualizar
2. ✅ Se NÃO existir, **ignorar** (não criar)
3. ✅ Se existir, apenas **atualizar** informações
4. ✅ Adicionar logs para debug

---

## 📁 Instruções de Aplicação

### Método 1: Edição Manual
1. Abrir `backend/src/services/WbotServices/wbotMessageListener.ts`
2. Localizar a função `verifyContact` (linha ~870)
3. Aplicar as modificações conforme código acima
4. Localizar os eventos Baileys (`contacts.update` e `groups.update`)
5. Aplicar as modificações conforme código acima
6. Salvar o arquivo
7. Reiniciar o backend: `cd backend && npm run dev`

### Método 2: Via Script (Recomendado)
```bash
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend

# Fazer backup
cp src/services/WbotServices/wbotMessageListener.ts src/services/WbotServices/wbotMessageListener.ts.backup

# Aplicar modificações manualmente usando editor de código
# (VSCode, Sublime, etc.)

# Testar
npm run dev
```

---

## 🧪 Testes

Após aplicar as modificações, testar:

1. **Receber mensagem de número NÃO na agenda:**
   - ✅ Contato deve ser criado com `source: "whatsapp_message"` e `isInAgenda: false`
   - ✅ Frontend deve filtrar corretamente

2. **Atualização de contato existente:**
   - ✅ Contato deve ser atualizado, não duplicado
   - ✅ Logs devem aparecer no console

3. **Grupo atualizado:**
   - ✅ Se grupo não existe, deve ser ignorado
   - ✅ Se grupo existe, deve ser atualizado

---

## 📊 Verificação de Logs

Após aplicar, verificar logs do backend:

```bash
cd backend
npm run dev

# Deve aparecer:
# ✅ Socket.IO: Contato adicionado/atualizado
# ⚠️ Baileys contacts.update: Ignorando contato novo (não está na agenda)
# ✅ Baileys groups.update: Grupo atualizado
```

---

## 🔄 Rollback

Se algo der errado:
```bash
cd backend
cp src/services/WbotServices/wbotMessageListener.ts.backup src/services/WbotServices/wbotMessageListener.ts
npm run dev
```

---

## ✅ Checklist de Implementação

- [ ] Backup do arquivo original feito
- [ ] Função `verifyContact()` modificada (linhas 870-907)
- [ ] Evento `contacts.update` modificado
- [ ] Evento `groups.update` modificado
- [ ] Backend reiniciado
- [ ] Testes realizados
- [ ] Logs verificados

---

**Data:** 2025-10-14
**Autor:** Claude Code Agent
**Prioridade:** P0 (CRÍTICO)
