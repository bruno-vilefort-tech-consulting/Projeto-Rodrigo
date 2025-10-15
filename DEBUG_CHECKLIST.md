# 🔍 Checklist de Debug - Mensagens em Tempo Real

## Passo 1: Verificar Console do Navegador

1. **Abra o navegador** e pressione **F12**
2. **Vá para a aba Console**
3. **Limpe o console** (ícone 🚫 ou Ctrl+L)
4. **Acesse a página**: `http://localhost:3000/tickets/070367e3-c125-4f41-9802-4b01479b1878`
5. **Aguarde 2 segundos**

### ✅ O que DEVE aparecer:

```
🔍 [MessagesList] useEffect disparado - ticketId: 070367e3-c125-4f41-9802-4b01479b1878 pageNumber: 1
📡 [MessagesList] Fazendo requisição para: /messages/070367e3-c125-4f41-9802-4b01479b1878
✅ [MessagesList] Resposta recebida: { messagesCount: X, hasMore: false }
📥 [MessagesList] Despachando LOAD_MESSAGES com X mensagens
🔄 [MessagesList Reducer] Ação recebida: LOAD_MESSAGES
🎨 [MessagesList] renderMessages chamado. messagesList.length: X
```

### ❌ Se NÃO aparecer:
- **Tire um print do console** completo
- **Copie TODOS os logs** e erros
- Envie para análise

---

## Passo 2: Tentar Enviar uma Mensagem

1. **Digite "teste"** no campo de mensagem
2. **Clique em Enviar** ou pressione Enter
3. **Observe o console**

### ✅ O que DEVE aparecer:

**No console do navegador:**
```
📥 [MessagesList] Mensagem recebida via Socket.IO: {
  action: 'create',
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  currentTicketId: '070367e3-c125-4f41-9802-4b01479b1878',
  matchCreate: true
}
✅ [MessagesList] ADD_MESSAGE - Validação passou, adicionando mensagem
🔄 [MessagesList Reducer] Ação recebida: ADD_MESSAGE
```

**No terminal do backend:**
```
🚀 [CreateMessageService] Emitindo evento Socket.IO: {
  ticketId: 6,
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  hasTicket: true,
  companyId: 1
}
```

### ❌ Se aparecer erro ou warning:
- **Copie o log COMPLETO**
- Especialmente se aparecer: `⚠️ [MessagesList] ADD_MESSAGE - Validação falhou`

---

## Passo 3: Verificar Network (Rede)

1. **Abra a aba Network** no DevTools (F12)
2. **Envie uma mensagem "teste"**
3. **Procure pela requisição**: `POST /messages/...`
4. **Clique na requisição**

### ✅ Verificar:
- **Status Code**: Deve ser `200 OK`
- **Request URL**: Deve terminar com o UUID do ticket
- **Response**: Deve conter `{ message: "Mensagem enviada com sucesso" }`

**Tire um print da requisição** se estiver diferente

---

## Passo 4: Verificar Sessão WhatsApp

### Se o erro 428 está aparecendo:

1. **Vá para Conexões** no menu
2. **Verifique o status** da conexão WhatsApp
3. **Se estiver desconectado**:
   - Clique em "Conectar"
   - Escaneie o QR Code
   - Aguarde conectar

⚠️ **IMPORTANTE**: Se a sessão WhatsApp estiver desconectada, as mensagens não serão enviadas pelo WhatsApp, mas ainda devem aparecer no chat interno como mensagens privadas.

---

## Passo 5: Verificar Logs do Backend

No terminal onde o backend está rodando, procure por:

```
🚀 [CreateMessageService] Emitindo evento Socket.IO:
```

### ✅ Se aparecer:
- Copie o log completo
- Verifique se `ticketUuid` tem valor (não é `null` ou `undefined`)

### ❌ Se NÃO aparecer:
- A mensagem não está sendo criada no backend
- Verifique se há erros no terminal
- Copie todos os erros

---

## 📋 Informações para Enviar

Para continuar o debug, preciso que você envie:

### 1. Logs do Console do Navegador
- [ ] Print ou cópia de TODOS os logs após acessar a página
- [ ] Print ou cópia de TODOS os logs após enviar mensagem
- [ ] Incluir warnings (⚠️) e erros (❌)

### 2. Logs do Terminal Backend
- [ ] Logs que aparecem ao enviar a mensagem
- [ ] Se aparecer `🚀 [CreateMessageService]...` copiar completo
- [ ] Todos os erros ou warnings

### 3. Network Tab
- [ ] Print da requisição POST /messages/...
- [ ] Status code
- [ ] Response body

### 4. Informações Adicionais
- [ ] A mensagem aparece no banco de dados? (pode verificar no PostgreSQL)
- [ ] Outros usuários conectados na mesma empresa recebem a mensagem?
- [ ] O erro 428 do WhatsApp aparece sempre ou só às vezes?

---

## 🆘 Atalhos Rápidos

### Limpar tudo e tentar novamente:
```bash
# No terminal do backend
Ctrl+C (parar o servidor)
npm run dev (reiniciar)

# No navegador
F5 (recarregar página)
Ctrl+Shift+Delete (limpar cache)
```

### Verificar se Socket.IO está conectado:
```javascript
// Cole no console do navegador:
console.log("Socket conectado?", window.socket?.connected);
```

### Testar emissão de evento manualmente:
```javascript
// Cole no console do navegador:
window.socket?.emit('test', { message: 'teste manual' });
```
