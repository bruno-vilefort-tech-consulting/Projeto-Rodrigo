# 🧪 Teste Rápido de Socket.IO

## Teste Manual no Console do Navegador

Cole este código no console do navegador (F12 → Console):

```javascript
// 1. Verificar se socket existe e está conectado
console.log("=== TESTE SOCKET.IO ===");
console.log("Socket existe?", typeof window.socket !== 'undefined');
console.log("Socket conectado?", window.socket?.connected);
console.log("Socket ID:", window.socket?.id);

// 2. Buscar informações do usuário
const user = JSON.parse(localStorage.getItem('user'));
console.log("User companyId:", user?.companyId);
console.log("User ID:", user?.id);

// 3. Obter ticketId da URL
const ticketId = window.location.pathname.split('/').pop();
console.log("Ticket ID da URL:", ticketId);

// 4. Listar eventos registrados no socket
if (window.socket) {
  console.log("Eventos registrados:", Object.keys(window.socket._callbacks || {}));
}

// 5. Adicionar listener temporário para testar
if (window.socket && user) {
  const testChannel = `company-${user.companyId}-appMessage`;
  console.log("Adicionando listener para:", testChannel);

  window.socket.on(testChannel, (data) => {
    console.log("🎯 EVENTO RECEBIDO:", data);
  });

  console.log("✅ Listener adicionado. Agora envie uma mensagem no chat.");
}
```

## Resultados Esperados

### ✅ Tudo OK:
```
=== TESTE SOCKET.IO ===
Socket existe? true
Socket conectado? true
Socket ID: "abc123..."
User companyId: 1
User ID: 123
Ticket ID da URL: 070367e3-c125-4f41-9802-4b01479b1878
Eventos registrados: ['connect', 'company-1-appMessage', ...]
Adicionando listener para: company-1-appMessage
✅ Listener adicionado. Agora envie uma mensagem no chat.
```

### ❌ Problema: Socket não existe
```
Socket existe? false
```
**Solução**: O contexto do Socket não está sendo importado. Verifique o arquivo `AuthContext.js`

### ❌ Problema: Socket não conectado
```
Socket existe? true
Socket conectado? false
```
**Solução**: O backend pode estar offline ou há problema de CORS

### ❌ Problema: Nenhum evento registrado
```
Eventos registrados: []
```
**Solução**: O useEffect do MessagesList não está sendo executado

---

## Teste no Backend

No terminal do backend, adicione este log temporário no `CreateMessageService`:

```typescript
// No arquivo CreateMessageService.ts, logo antes de emitir eventos
console.log("📤 TESTE DEBUG:", {
  emitindo: true,
  canal: `company-${companyId}-appMessage`,
  ticketUuid: message.ticket?.uuid,
  ticketId: message.ticketId,
  temSocket: !!io,
  conexoesAtivas: io.engine.clientsCount
});
```

### Resultado esperado:
```
📤 TESTE DEBUG: {
  emitindo: true,
  canal: 'company-1-appMessage',
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  ticketId: 6,
  temSocket: true,
  conexoesAtivas: 1
}
```

---

## Teste Completo: Fluxo End-to-End

1. **Cole o script acima** no console do navegador
2. **Envie uma mensagem "teste"** no chat
3. **Observe os logs** que devem aparecer:

### ✅ Sequência correta:

**Console do Navegador:**
```
🎯 EVENTO RECEBIDO: {
  action: 'create',
  message: {...},
  ticket: { uuid: '070367e3-c125-4f41-9802-4b01479b1878', ... },
  contact: {...}
}
📥 [MessagesList] Mensagem recebida via Socket.IO: {...}
✅ [MessagesList] ADD_MESSAGE - Validação passou
```

**Terminal do Backend:**
```
📤 TESTE DEBUG: { ... conexoesAtivas: 1 }
🚀 [CreateMessageService] Emitindo evento Socket.IO: {
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  ...
}
```

### ❌ Se nenhum evento for recebido:

1. **Verifique `conexoesAtivas`** no backend
   - Se for `0`: Nenhum cliente conectado
   - Se for `> 0`: Clientes conectados, mas não recebendo

2. **Verifique o canal** no frontend:
   ```javascript
   // Cole no console:
   const user = JSON.parse(localStorage.getItem('user'));
   console.log("Canal esperado:", `company-${user.companyId}-appMessage`);
   ```

3. **Verifique se o canal corresponde** ao que o backend está emitindo

---

## 🚨 Problemas Comuns

### Problema: "Socket não existe"
**Causa**: AuthContext não está disponível no componente
**Solução**: Verificar se o componente está dentro do `<AuthProvider>`

### Problema: "Socket conectado? false"
**Causa**: Backend offline ou problema de conexão
**Solução**: Verificar se o backend está rodando em `http://localhost:8080`

### Problema: "Eventos recebidos mas validação falha"
**Causa**: UUID no evento não corresponde ao UUID da URL
**Solução**: Verificar se o UUID está sendo carregado no backend

### Problema: "Nenhum evento recebido"
**Causa**: Canal diferente entre frontend e backend
**Solução**: Verificar se `companyId` é o mesmo nos dois lados

---

## 📊 Diagnóstico Rápido

| Sintoma | Causa Provável | Solução |
|---------|---------------|----------|
| Socket não existe | AuthContext não disponível | Verificar providers |
| Socket não conectado | Backend offline | Reiniciar backend |
| Eventos não chegam | Canal errado | Verificar companyId |
| Validação falha | UUID diferente | Verificar logs |
| Nenhum log aparece | Console filtrado | Limpar filtros |

---

**Cole os resultados deste teste no chat para continuar o debug!**
