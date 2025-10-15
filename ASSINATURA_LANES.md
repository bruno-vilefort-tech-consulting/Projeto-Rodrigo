# ✍️ Assinatura nas Mensagens de Lane - Kanban

## 📋 O que foi implementado

Adicionada funcionalidade para que as **mensagens de saudação das lanes** (greetingMessageLane) sejam enviadas com **assinatura automática** quando a configuração `sendSignMessage` estiver habilitada.

## 🔧 Modificações Aplicadas

### 1. **MoveTicketLaneService.ts**
**Arquivo**: `backend/src/services/TicketServices/MoveTicketLaneService.ts`

**O que mudou**:
- Adicionado import de `CompaniesSettings`
- Antes de enviar a mensagem de saudação, verifica se `sendSignMessage === "enabled"`
- Se estiver habilitada E o ticket tiver usuário atribuído, adiciona assinatura no formato: `*Nome do Usuário:*\n`

**Código adicionado**:
```typescript
// Verificar se assinatura está habilitada nas configurações da empresa
const companySettings = await CompaniesSettings.findOne({
  where: { companyId }
});

let messageBody = toLane.greetingMessageLane;

// Se sendSignMessage está enabled e o ticket tem usuário, adicionar assinatura
if (companySettings?.sendSignMessage === "enabled" && ticket.user?.name) {
  messageBody = `*${ticket.user.name}:*\n${toLane.greetingMessageLane}`;
  console.log(`✍️ [MoveTicketLane] Adicionando assinatura "${ticket.user.name}" à mensagem`);
}

await SendWhatsAppMessage({
  body: messageBody,
  ticket,
  isForwarded: false
});
```

## ⚙️ Como Funciona

### Quando a Assinatura É Adicionada:

1. ✅ **sendSignMessage** está como `"enabled"` nas configurações da empresa
2. ✅ O **ticket tem um usuário atribuído** (ticket.user.name existe)
3. ✅ A lane tem **greetingMessageLane** configurada

### Formato da Mensagem:

**Sem assinatura**:
```
Olá! Como posso ajudá-lo?
```

**Com assinatura**:
```
*Super Admin:*
Olá! Como posso ajudá-lo?
```

O `*texto*` no WhatsApp é renderizado como **negrito**.

## 🧪 Como Testar

### 1. Verificar/Habilitar Assinatura

```sql
-- Verificar configuração atual
SELECT "sendSignMessage" FROM "CompaniesSettings" WHERE "companyId" = 1;

-- Habilitar assinatura (se não estiver)
UPDATE "CompaniesSettings"
SET "sendSignMessage" = 'enabled'
WHERE "companyId" = 1;
```

### 2. Configurar Lane com Mensagem de Saudação

```sql
UPDATE "Tags" SET
  "greetingMessageLane" = 'Olá! Estou aqui para ajudá-lo.',
  "timeLane" = 1,  -- 1 minuto para teste rápido
  "nextLaneId" = 2 -- ID da próxima lane
WHERE id = 1;      -- ID da lane atual
```

### 3. Garantir que Ticket Tem Usuário

```sql
-- Verificar se ticket tem usuário
SELECT id, "userId" FROM "Tickets" WHERE id = <ticket_id>;

-- Se não tiver, atribuir um usuário
UPDATE "Tickets" SET "userId" = 1 WHERE id = <ticket_id>;
```

### 4. Testar

1. Mova o ticket para a lane configurada no kanban
2. Envie uma mensagem como atendente
3. Aguarde 1+ minutos
4. Verifique no backend os logs:
   ```
   ✅ [MoveTicketLane] Ticket X movido para lane "..." (ID: Y)
   ✍️ [MoveTicketLane] Adicionando assinatura "Super Admin" à mensagem
   📨 [MoveTicketLane] Mensagem de saudação enviada para ticket X
   ```

5. Verifique no chat do ticket: A mensagem deve aparecer como:
   ```
   *Super Admin:*
   Olá! Estou aqui para ajudá-lo.
   ```

## 📝 Observações

### ✅ Assinatura é adicionada quando:
- Movimentação automática (timer expirou)
- Movimentação por rollback (cliente respondeu)
- Movimentação manual via API (se `sendGreeting: true`)

### ❌ Assinatura NÃO é adicionada quando:
- `sendSignMessage` está `"disabled"` nas configurações
- Ticket não tem usuário atribuído (`userId` é `null`)
- Lane não tem `greetingMessageLane` configurada
- Parâmetro `sendGreeting` é `false` na chamada do serviço

### 💡 Dica: Testar Diferentes Usuários

Para ver assinaturas diferentes, atribua o ticket a usuários diferentes:

```sql
-- Atribuir ao usuário ID 1 (Super Admin)
UPDATE "Tickets" SET "userId" = 1 WHERE id = <ticket_id>;

-- Atribuir ao usuário ID 2 (Outro Atendente)
UPDATE "Tickets" SET "userId" = 2 WHERE id = <ticket_id>;
```

Cada movimentação usará o nome do usuário atualmente atribuído ao ticket.

## 🎯 Resultado

Agora as mensagens de saudação das lanes seguem o **mesmo padrão** das mensagens manuais enviadas pelos atendentes quando a assinatura está habilitada, proporcionando uma experiência consistente para o cliente.

**Antes**:
```
Super Admin: (mensagem manual do atendente com assinatura)
Teste

Olá! Como posso ajudá-lo? (mensagem automática da lane SEM assinatura)
```

**Depois**:
```
Super Admin: (mensagem manual do atendente)
Teste

Super Admin: (mensagem automática da lane COM assinatura)
Olá! Como posso ajudá-lo?
```

✨ **Experiência consistente e profissional!**
