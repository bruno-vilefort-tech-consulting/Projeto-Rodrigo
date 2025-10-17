# DEBUG SESSION - FlowBuilder Multiple Questions

## Status Atual
**Data:** 2025-10-17 11:27
**Problema:** Sistema envia primeira pergunta 2x ao inves de segunda pergunta
**Causa:** Resposta "Teste 2" e tratada como palavra-chave de nova campanha

---

## Analise dos Logs

### Fluxo Atual (INCORRETO)

1. OK - Usuario envia "Teste"
2. OK - Sistema identifica como palavra-chave
3. OK - Campanha disparada, primeira pergunta enviada: "Teste"
4. ERRO - Usuario responde "Teste 2"
5. ERRO - Sistema identifica "Teste 2" como palavra-chave
6. ERRO - Nova campanha disparada (ao inves de processar resposta)
7. ERRO - Primeira pergunta "Teste" enviada novamente

### Logs Criticos

```
[FLOW] Mensagem "Teste 2" e palavra-chave de campanha, pulando processamento de pergunta
[FLOW CAMPAIGN] Nova campanha disparada por frase "Teste 2"
```

---

## Causa Raiz

O problema esta na ordem de verificacao dentro do bloco `isQuestion`:

**Codigo Atual (linha 4727-4748):**
```typescript
if (!isNil(flow) && isQuestion && !msg.key.fromMe) {
  const body = getBodyMessage(msg);

  // Busca campanhas
  const listPhraseForCheck = await FlowCampaignModel.findAll({...});

  // Verifica se e palavra-chave
  const isCampaignKeyword = listPhraseForCheck.filter(...).length > 0;

  if (isCampaignKeyword) {
    console.log(`Mensagem e palavra-chave de campanha, pulando`);
    // NAO processar como resposta <-- AQUI ESTA O ERRO
  }
}
```

**Problema:**
- Sistema verifica se mensagem e palavra-chave DENTRO do bloco isQuestion
- Se for palavra-chave, pula processamento
- Depois cai no bloco de Campaign (linha 3780) e dispara NOVA campanha
- Resultado: Resposta a pergunta e tratada como novo disparo

---

## Solucao

### Opcao 1: Priorizar Contexto de Pergunta
Se ticket esta em contexto de pergunta (`isQuestion = true`), **SEMPRE** processar como resposta, **NUNCA** como palavra-chave.

**Logica correta:**
- Se `isQuestion = true` E `lastFlowId != null` → SEMPRE e resposta, mesmo que seja palavra-chave
- Palavra-chave so deve disparar quando NAO esta em contexto de pergunta

### Opcao 2: Remover Verificacao de Palavra-Chave do Bloco isQuestion
Simplesmente processar como resposta quando esta em isQuestion, sem verificar palavra-chave.

---

## Correcao a Aplicar

**Remover verificacao de palavra-chave do bloco isQuestion:**

```typescript
if (!isNil(flow) && isQuestion && !msg.key.fromMe) {
  const body = getBodyMessage(msg);

  // NAO verificar palavra-chave aqui!
  // Se esta em isQuestion, SEMPRE e resposta

  console.log("|============= QUESTION =============|", JSON.stringify(flow, null, 4));

  if (body) {
    // Processar resposta normalmente...
  }
}
```

---

## Plano de Acao

- [x] Remover verificacao de palavra-chave do bloco isQuestion (linha 4736-4745) ✅
- [x] Simplificar: Se isQuestion = true, sempre processar como resposta ✅
- [ ] Testar: "Teste" -> responder "Teste 2" -> deve avancar para segunda pergunta
- [ ] Validar que palavra-chave so dispara quando NAO esta em pergunta

---

## Correcao Aplicada

**Arquivo:** wbotMessageListener.ts linha 4727-4739

**Mudanca:**
- Removido bloco de verificacao de palavra-chave (linhas 4730-4757)
- Simplificada logica: Se isQuestion = true, SEMPRE processar como resposta
- Nunca verificar se resposta e palavra-chave quando em contexto de pergunta

**Codigo Novo:**
```typescript
if (!isNil(flow) && isQuestion && !msg.key.fromMe) {
  const body = getBodyMessage(msg);

  // SEMPRE processar como resposta quando em contexto de pergunta
  console.log("|============= QUESTION =============|", JSON.stringify(flow, null, 4));

  if (body) {
    // Processar resposta normalmente...
  }
}
```

---

## Proximos Passos

1. ✅ Editar wbotMessageListener.ts linha 4727
2. ✅ Remover bloco de verificacao isCampaignKeyword
3. ✅ Processar SEMPRE como resposta quando isQuestion = true
4. ✅ Corrigir ReferenceError: isCampaignKeyword linha 4833
5. ✅ Corrigir TypeError: Cannot read properties of null - ticket nao carregado
6. ⏳ Reiniciar backend e testar fluxo completo

---

## Erros Corrigidos

### Erro 1: ReferenceError: isCampaignKeyword is not defined
**Arquivo:** wbotMessageListener.ts linha 4833
**Problema:** Referencia restante a variavel removida
**Solucao:** Removido if (!isCampaignKeyword) e substituido por return direto

### Erro 2: TypeError: Cannot read properties of null (reading 'id')
**Arquivo:** ActionsWebhookService.ts linha 342
**Problema:** Variavel ticket inicializada como null e nunca carregada quando idTicket fornecido
**Solucao:** Adicionado carregamento de ticket no inicio do loop:
```typescript
// Linha 200-205
if (idTicket && !ticket) {
  ticket = await Ticket.findOne({
    where: { id: idTicket, whatsappId, companyId }
  });
}
```
