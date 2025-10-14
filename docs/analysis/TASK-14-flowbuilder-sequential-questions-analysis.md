# Frontend Analysis: TASK-14 - FlowBuilder Sequential Questions Bug

## Executive Summary

**Problema:** Dois blocos Question sequenciais no FlowBuilder não funcionam corretamente. A primeira pergunta é enviada e a resposta é capturada, mas a segunda pergunta não é enviada ou a execução do flow para após a primeira resposta.

**Causa Raiz Identificada:** Bug crítico na lógica de salvamento de variáveis no backend (`wbotMessageListener.ts:4670-4677`). O código **SOBRESCREVE completamente** o objeto `dataWebhook.variables` a cada nova pergunta, perdendo as respostas anteriores. Além disso, há um bug de lógica que tenta avançar para o próximo node baseado no índice do array (linha 4669), mas deveria usar a estrutura de conexões (edges) do flow.

**Severidade:** ALTA - Impacto direto em qualificação de leads, pesquisas NPS, formulários multi-etapa.

**Complexidade:** MÉDIA - Requer modificação backend (TypeScript) + validação frontend (localStorage sync).

---

## 1. Arquitetura do FlowBuilder

### 1.1 Estrutura de Arquivos Frontend

```
frontend/src/
├── pages/
│   ├── FlowBuilder/
│   │   └── index.js                         # Lista de flows (GET /flowbuilder)
│   └── FlowBuilderConfig/
│       ├── index.js                         # Editor visual (React Flow)
│       ├── flowbuilder.css                  # Estilos customizados
│       └── nodes/                           # 13 tipos de nodes
│           ├── startNode.js                 # Node inicial (verde)
│           ├── messageNode.js               # Mensagem texto (vermelho)
│           ├── menuNode.js                  # Menu interativo (roxo)
│           ├── intervalNode.js              # Delay (laranja)
│           ├── imgNode.js                   # Imagem (azul)
│           ├── audioNode.js                 # Áudio/PTT (verde)
│           ├── videoNode.js                 # Vídeo (vermelho)
│           ├── questionNode.js              # ❌ PERGUNTA (vermelho) - AFETADO
│           ├── ticketNode.js                # Criar ticket (laranja)
│           ├── typebotNode.js               # Integração Typebot
│           ├── openaiNode.js                # Integração OpenAI
│           ├── randomizerNode.js            # Randomizador A/B (ciano)
│           ├── singleBlockNode.js           # Bloco único
│           ├── conditionNode.js             # Condicional
│           └── removeEdge.js                # Edge com botão delete
│
├── components/
│   ├── FlowBuilderModal/                    # Modal criar flow
│   ├── FlowBuilderAddTextModal/             # Modal mensagem
│   ├── FlowBuilderMenuModal/                # Modal menu
│   ├── FlowBuilderIntervalModal/            # Modal intervalo
│   ├── FlowBuilderAddImgModal/              # Modal imagem
│   ├── FlowBuilderAddAudioModal/            # Modal áudio
│   ├── FlowBuilderAddVideoModal/            # Modal vídeo
│   ├── FlowBuilderAddQuestionModal/         # ❌ Modal pergunta - AFETADO
│   │   └── index.js                         # Lines 1-226
│   ├── FlowBuilderAddTicketModal/           # Modal ticket
│   ├── FlowBuilderAddTypebotModal/          # Modal Typebot
│   ├── FlowBuilderAddOpenAIModal/           # Modal OpenAI
│   ├── FlowBuilderRandomizerModal/          # Modal randomizer
│   └── FlowBuilderSingleBlockModal/         # Modal bloco único
│
├── stores/
│   └── useNodeStorage.js                    # Zustand store (lines 1-12)
│       ├── node: string                     # ID do node selecionado
│       ├── connect: string                  # Conexões
│       └── action: "idle"|"delete"|"duplicate"
│
└── services/
    └── flowBuilder.js                       # Utils export/import
```

### 1.2 Estrutura Backend (Execução de Flow)

```
backend/src/services/
├── WebhookService/
│   └── ActionsWebhookService.ts             # ❌ EXECUÇÃO DO FLOW - Lines 340-363
│       ├── Line 340: if (nodeSelected.type === "question")
│       ├── Line 341: Extrai message e answerKey
│       ├── Line 343: Busca ticket
│       ├── Line 346: Envia mensagem da pergunta
│       ├── Line 352: Atualiza ticket com lastFlowId = nodeSelected.id
│       └── Line 362: **BREAK** - Para execução e aguarda resposta
│
└── WbotServices/
    └── wbotMessageListener.ts               # ❌ LISTENER DE MENSAGENS - Lines 4650-4704
        ├── Line 4628: Busca flow pelo ticket.flowStopped
        ├── Line 4645: Verifica isQuestion = true
        ├── Line 4650: Se isQuestion && resposta do usuário
        ├── Line 4664: Extrai answerKey do node
        ├── Line 4669: ❌ **BUG 1** - nodeIndex + 1 (lógica incorreta)
        ├── Line 4672: ❌ **BUG 2** - SOBRESCREVE dataWebhook.variables
        ├── Line 4674: Salva APENAS a resposta atual
        └── Line 4687: Chama ActionsWebhookService para continuar
```

---

## 2. Tipos de Nodes do FlowBuilder

### Lista Completa (13 tipos)

| # | Type | Color | Handles | Descrição |
|---|------|-------|---------|-----------|
| 1 | `start` | Verde (#3ABA38) | Source | Início do fluxo |
| 2 | `message` | Vermelho (#EC5858) | Target + Source | Mensagem texto |
| 3 | `menu` | Roxo (#683AC8) | Target + Multi-Source | Menu opções 1-9 |
| 4 | `interval` | Laranja (#F7953B) | Target + Source | Delay (1-60s) |
| 5 | `img` | Azul (#1FBADC) | Target + Source | Imagem (JPG/PNG/GIF) |
| 6 | `audio` | Verde (#3ABA38) | Target + Source | Áudio ou PTT |
| 7 | `video` | Vermelho (#EC5858) | Target + Source | Vídeo (MP4/AVI) |
| 8 | **`question`** | Vermelho (#EC5858) | Target + Source | **Pergunta com variável** |
| 9 | `ticket` | Laranja (#F7953B) | Target | Criar ticket + transferir |
| 10 | `typebot` | Verde (#3aba38) | Target + Source | Integração Typebot |
| 11 | `openai` | Laranja (#F7953B) | Target + Source | Integração ChatGPT |
| 12 | `randomizer` | Ciano (#1FBADC) | Target + 2 Sources (A/B) | A/B testing |
| 13 | `singleBlock` | - | Target + Source | Bloco único multi-mídia |

### Estrutura do Question Node

**Frontend (questionNode.js:1-156)**

```javascript
// Node visual com ícone BallotIcon
{
  id: "random_id_30_chars",
  type: "question",
  position: { x: 500, y: 100 },
  data: {
    typebotIntegration: {
      message: "Qual seu nome completo?",  // Pergunta enviada ao usuário
      answerKey: "nome_cliente"            // Chave da variável para salvar
    }
  }
}
```

**Backend (ActionsWebhookService.ts:340-363)**

```typescript
if (nodeSelected.type === "question") {
  const { message } = nodeSelected.data.typebotIntegration;
  const ticketDetails = await ShowTicketService(ticket.id, companyId);
  const bodyFila = formatBody(`${message}`, ticket.contact);

  await delay(3000);
  await typeSimulation(ticket, "composing");

  // Envia a pergunta para o WhatsApp
  await SendWhatsAppMessage({
    body: bodyFila,
    ticket: ticketDetails,
    quotedMsg: null
  });

  SetTicketMessagesAsRead(ticketDetails);
  await ticketDetails.update({ lastMessage: bodyFila });

  // Atualiza ticket para aguardar resposta
  await ticket.update({
    userId: null,
    companyId: companyId,
    lastFlowId: nodeSelected.id,      // ID do node Question atual
    hashFlowId: hashWebhookId,
    flowStopped: idFlowDb.toString()
  });

  break; // ❌ Para execução aqui (aguarda resposta do usuário)
}
```

---

## 3. Fluxo de Dados: Como o Flow Executa

### 3.1 Criação do Flow (Frontend)

```
1. User: Clica "+ Novo Flow" (/flowbuilders)
   ↓
2. POST /flowbuilder { name: "Qualificação Lead" }
   ↓
3. Backend: Cria FlowBuilder no PostgreSQL
   ↓
4. Retorna { id: 123, name: "Qualificação Lead" }
   ↓
5. Redirect para /flowbuilder/123 (Editor)
   ↓
6. User: Arrasta nodes e conecta
   - Start → Question 1 ("Nome?") → Question 2 ("Email?") → Message ("Obrigado!")
   ↓
7. User: Clica "Salvar"
   ↓
8. POST /flowbuilder/flow {
     idFlow: 123,
     nodes: [
       { id: "1", type: "start", ... },
       { id: "abc123", type: "question", data: { typebotIntegration: { message: "Nome?", answerKey: "nome" }}},
       { id: "def456", type: "question", data: { typebotIntegration: { message: "Email?", answerKey: "email" }}},
       { id: "ghi789", type: "message", data: { label: "Obrigado {nome}! Email: {email}" }}
     ],
     connections: [
       { source: "1", target: "abc123" },
       { source: "abc123", target: "def456" },
       { source: "def456", target: "ghi789" }
     ]
   }
   ↓
9. Backend: Salva JSON no campo `flow` do FlowBuilder
   ↓
10. Toast: "Flow salvo com sucesso!"
```

### 3.2 Execução do Flow (Backend - Caso de Uso com 2 Questions)

**Cenário Esperado:**

```
START
  ↓
Question 1: "Qual seu nome?"
  ↓ User responde: "João"
  ↓ Salva: { nome: "João" }
  ↓
Question 2: "Qual seu email?"
  ↓ User responde: "joao@email.com"
  ↓ Salva: { nome: "João", email: "joao@email.com" }
  ↓
Message: "Obrigado João! Enviaremos para joao@email.com"
```

**Fluxo Real (COM BUG):**

#### Etapa 1: Flow começa (ActionsWebhookService.ts)

```typescript
// Loop pelos nodes (line 196)
for (var i = 0; i < lengthLoop; i++) {
  nodeSelected = nodes.filter(node => node.id === next)[0];

  // Node START → passa direto
  // Node QUESTION 1 → entra aqui (line 340)
  if (nodeSelected.type === "question") {
    const { message } = nodeSelected.data.typebotIntegration; // "Qual seu nome?"

    // Envia pergunta para WhatsApp
    await SendWhatsAppMessage({ body: "Qual seu nome?", ... });

    // Atualiza ticket para aguardar resposta
    await ticket.update({
      lastFlowId: "abc123",    // ID do Question 1
      flowStopped: "123"       // ID do FlowBuilder
    });

    break; // ❌ Para AQUI e aguarda resposta
  }
}
```

**Estado do Ticket após Question 1:**

```json
{
  "id": 5678,
  "lastFlowId": "abc123",
  "flowStopped": "123",
  "dataWebhook": null,
  "status": "pending"
}
```

#### Etapa 2: Usuário responde "João" (wbotMessageListener.ts:4650-4704)

```typescript
// Line 4628: Busca o flow pelo ticket.flowStopped
const flow = await FlowBuilderModel.findOne({
  where: { id: ticket.flowStopped } // "123"
});

const nodes: INodes[] = flow.flow["nodes"];

// Line 4645: Verifica se é Question
isQuestion = flow.flow["nodes"]
  .find((node: any) => node.id === ticket.lastFlowId) // "abc123"
  ?.type === "question"; // TRUE

// Line 4650: Se isQuestion && resposta do usuário
if (!isNil(flow) && isQuestion && !msg.key.fromMe) {
  const body = getBodyMessage(msg); // "João"

  // Line 4658: Busca o node Question 1
  const nodeSelected = flow.flow["nodes"].find(
    (node: any) => node.id === ticket.lastFlowId // "abc123"
  );

  // Line 4664: Extrai answerKey
  const { message, answerKey } = nodeSelected.data.typebotIntegration;
  // answerKey = "nome"

  // Line 4667: ❌ BUG 1 - Tenta encontrar próximo node por índice
  const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
  // nodeIndex = 1 (Question 1 é o segundo node no array)

  const lastFlowId = nodes[nodeIndex + 1].id;
  // lastFlowId = nodes[2].id = "def456" (Question 2)

  // Line 4670: ❌ BUG 2 - SOBRESCREVE dataWebhook.variables
  await ticket.update({
    lastFlowId: lastFlowId,     // "def456" (Question 2)
    dataWebhook: {
      variables: {
        [answerKey]: body       // { nome: "João" }
      }
    }
  });
  // ❌ PERDEU todas as variáveis anteriores!

  // Line 4687: Chama ActionsWebhookService para continuar
  await ActionsWebhookService(
    whatsapp.id,
    parseInt(ticket.flowStopped), // 123
    ticket.companyId,
    nodes,
    connections,
    lastFlowId,  // "def456" (Question 2)
    null,
    "",
    "",
    "",
    ticket.id,
    mountDataContact,
    msg
  );
}
```

**Estado do Ticket após resposta "João":**

```json
{
  "id": 5678,
  "lastFlowId": "def456",
  "flowStopped": "123",
  "dataWebhook": {
    "variables": {
      "nome": "João"
    }
  }
}
```

#### Etapa 3: Flow retoma com Question 2 (ActionsWebhookService.ts)

```typescript
// Loop retoma do Question 2 (nodeSelected.id = "def456")
for (var i = 0; i < lengthLoop; i++) {
  nodeSelected = nodes.filter(node => node.id === next)[0]; // "def456"

  if (nodeSelected.type === "question") {
    const { message } = nodeSelected.data.typebotIntegration; // "Qual seu email?"

    // Envia pergunta para WhatsApp
    await SendWhatsAppMessage({ body: "Qual seu email?", ... });

    // Atualiza ticket
    await ticket.update({
      lastFlowId: "def456",    // ID do Question 2
      flowStopped: "123"
    });

    break; // Para e aguarda resposta
  }
}
```

#### Etapa 4: Usuário responde "joao@email.com" (wbotMessageListener.ts)

```typescript
// Mesma lógica de antes
isQuestion = true; // Question 2

const body = "joao@email.com";
const { answerKey } = nodeSelected.data.typebotIntegration; // "email"

// ❌ BUG 2 - SOBRESCREVE NOVAMENTE
await ticket.update({
  lastFlowId: nodes[nodeIndex + 1].id, // "ghi789" (Message)
  dataWebhook: {
    variables: {
      [answerKey]: body       // { email: "joao@email.com" }
    }
  }
});
// ❌ PERDEU { nome: "João" }!

await ActionsWebhookService(..., lastFlowId: "ghi789", ...);
```

**Estado do Ticket após resposta "joao@email.com":**

```json
{
  "id": 5678,
  "lastFlowId": "ghi789",
  "flowStopped": "123",
  "dataWebhook": {
    "variables": {
      "email": "joao@email.com"
    }
  }
}
```

#### Etapa 5: Flow envia Message final (ActionsWebhookService.ts:233-255)

```typescript
if (nodeSelected.type === "message") {
  let msg;
  const webhook = ticket?.dataWebhook;

  if (webhook && webhook.hasOwnProperty("variables")) {
    // Substitui variáveis {nome} e {email}
    msg = {
      body: replaceMessages(webhook, nodeSelected.data.label)
      // Template: "Obrigado {nome}! Enviaremos para {email}"
    };
  }

  await SendMessage(whatsapp, {
    number: numberClient,
    body: msg.body
  });
}
```

**Resultado enviado ao usuário:**

```
"Obrigado ! Enviaremos para joao@email.com"
```

❌ **FALTA o nome!** Porque `{ nome: "João" }` foi sobrescrito.

---

## 4. Causa Raiz do Bug (Root Cause Analysis)

### Bug 1: Lógica incorreta de navegação (Line 4669)

**Código Problemático:**

```typescript
const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
const lastFlowId = nodes[nodeIndex + 1].id;
```

**Problema:**

- Assume que nodes estão em ordem sequencial no array
- Ignora completamente as `connections` (edges) do flow
- Falha se:
  - Nodes foram reordenados no array
  - Flow tem branches (Menu, Randomizer, Condição)
  - Flow tem loops

**Solução:**

Usar a estrutura de `connections` para encontrar o próximo node:

```typescript
const nextConnection = connections.find(conn => conn.source === nodeSelected.id);
const lastFlowId = nextConnection?.target || null;

if (!lastFlowId) {
  // Não há próximo node, finalizar flow
  await ticket.update({ flowStopped: null, hashFlowId: null });
  return;
}
```

### Bug 2: Sobrescrita de variáveis (Lines 4672-4676)

**Código Problemático:**

```typescript
await ticket.update({
  lastFlowId: lastFlowId,
  dataWebhook: {
    variables: {
      [answerKey]: body
    }
  }
});
```

**Problema:**

- Cria um **NOVO OBJETO** `{ variables: { [answerKey]: body } }`
- Sobrescreve `ticket.dataWebhook.variables` completamente
- Perde todas as respostas anteriores

**Exemplo:**

```javascript
// Estado ANTES (tinha nome)
ticket.dataWebhook = {
  variables: {
    nome: "João"
  }
};

// Código executa
ticket.dataWebhook = {
  variables: {
    email: "joao@email.com" // ❌ PERDEU "nome"
  }
};

// Estado DEPOIS (perdeu nome)
ticket.dataWebhook = {
  variables: {
    email: "joao@email.com"
  }
};
```

**Solução:**

Fazer **merge** (spread operator) das variáveis existentes:

```typescript
const oldDataWebhook = ticket.dataWebhook || {};
const oldVariables = oldDataWebhook.variables || {};

await ticket.update({
  lastFlowId: lastFlowId,
  dataWebhook: {
    ...oldDataWebhook,
    variables: {
      ...oldVariables,      // ✅ Mantém variáveis anteriores
      [answerKey]: body     // ✅ Adiciona nova variável
    }
  }
});
```

**Resultado esperado:**

```javascript
// Após Question 1
ticket.dataWebhook = {
  variables: {
    nome: "João"
  }
};

// Após Question 2 (COM MERGE)
ticket.dataWebhook = {
  variables: {
    nome: "João",              // ✅ Mantido!
    email: "joao@email.com"    // ✅ Adicionado!
  }
};
```

---

## 5. Análise de Impacto

### 5.1 Arquivos Backend Afetados

| Arquivo | Linha | Tipo | Descrição |
|---------|-------|------|-----------|
| `backend/src/services/WbotServices/wbotMessageListener.ts` | 4669 | ❌ BUG | Navegação por índice |
| `backend/src/services/WbotServices/wbotMessageListener.ts` | 4672-4676 | ❌ BUG | Sobrescrita de variáveis |
| `backend/src/services/WebhookService/ActionsWebhookService.ts` | 340-363 | ✅ OK | Execução Question (correto) |
| `backend/src/services/WebhookService/ActionsWebhookService.ts` | 233-255 | ✅ OK | Substituição variáveis (correto) |
| `backend/src/models/Ticket.ts` | 61 | ✅ OK | Campo `dataWebhook: {} | null` |

### 5.2 Arquivos Frontend Afetados

| Arquivo | Linha | Tipo | Descrição |
|---------|-------|------|-----------|
| `frontend/src/pages/FlowBuilderConfig/index.js` | 447-449 | ⚠️ RISCO | Extrai variáveis para localStorage |
| `frontend/src/pages/FlowBuilderConfig/nodes/questionNode.js` | 124 | ✅ OK | Renderiza message |
| `frontend/src/components/FlowBuilderAddQuestionModal/index.js` | 107-144 | ⚠️ RISCO | Gerencia localStorage de variáveis |

**Risco Frontend:**

```javascript
// Line 447: Extrai APENAS do nodes atuais
const filterVariables = flowNodes.filter(nd => nd.type === "question");
const variables = filterVariables.map(variable =>
  variable.data.typebotIntegration.answerKey
);
localStorage.setItem('variables', JSON.stringify(variables));
```

**Problema:**

- Frontend mantém lista de variáveis disponíveis no localStorage
- Backend NÃO usa essa lista (deveria?)
- Inconsistência entre frontend (lista completa) e backend (variável única)

---

## 6. Casos de Uso Impactados

### 6.1 Qualificação de Leads (CRÍTICO)

**Flow Típico:**

```
START
  ↓
Message: "Olá! Vamos qualificar seu interesse."
  ↓
Question: "Qual seu nome?" → {nome}
  ↓
Question: "Qual seu email?" → {email}
  ↓
Question: "Qual seu telefone?" → {telefone}
  ↓
Question: "Que produto te interessa?" → {produto}
  ↓
Message: "Obrigado {nome}! Em breve entraremos em contato no {telefone}."
  ↓
Ticket: Fila Vendas (dados: nome, email, telefone, produto)
```

**Impacto:** ❌ Apenas `{produto}` será salvo, perdendo nome, email e telefone.

### 6.2 Pesquisa NPS (ALTO)

**Flow Típico:**

```
START
  ↓
Message: "Obrigado por usar nosso serviço!"
  ↓
Question: "De 0 a 10, qual a chance de nos recomendar?" → {nps_score}
  ↓
Question: "O que podemos melhorar?" → {feedback}
  ↓
Message: "Obrigado! Recebemos sua nota {nps_score} e feedback: {feedback}"
```

**Impacto:** ❌ Apenas `{feedback}` será salvo, perdendo `{nps_score}`.

### 6.3 Formulário de Cadastro (ALTO)

**Flow Típico:**

```
START
  ↓
Question: "CPF?" → {cpf}
  ↓
Question: "Data de nascimento?" → {data_nasc}
  ↓
Question: "CEP?" → {cep}
  ↓
Question: "Número?" → {numero}
  ↓
Message: "Cadastro completo! CPF: {cpf}, Data: {data_nasc}, Endereço: CEP {cep}, nº {numero}"
```

**Impacto:** ❌ Apenas `{numero}` será salvo, perdendo todo o resto.

### 6.4 Coleta de Feedback Multi-Etapa (MÉDIO)

**Flow Típico:**

```
Question: "Como foi o atendimento?" → {atendimento}
  ↓
Question: "Tempo de resposta?" → {tempo}
  ↓
Question: "Produto atendeu expectativas?" → {produto}
```

**Impacto:** ❌ Apenas última resposta salva.

---

## 7. Solução Proposta (Backend)

### 7.1 Correção do Bug 1 (Navegação)

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`

**Linha:** 4667-4669

**Código Atual:**

```typescript
const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
const lastFlowId = nodes[nodeIndex + 1].id;
```

**Código Corrigido:**

```typescript
// Busca próximo node usando connections (edges)
const nextConnection = connections.find(conn => conn.source === nodeSelected.id);

if (!nextConnection) {
  // Não há próximo node, finalizar flow
  logger.info(`No next node found for question ${nodeSelected.id}, ending flow`);
  await ticket.update({
    lastFlowId: null,
    flowStopped: null,
    hashFlowId: null,
    flowWebhook: false
  });
  return;
}

const lastFlowId = nextConnection.target;
```

### 7.2 Correção do Bug 2 (Merge de Variáveis)

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`

**Linha:** 4664-4677

**Código Atual:**

```typescript
const { message, answerKey } = nodeSelected.data.typebotIntegration;
const oldDataWebhook = ticket.dataWebhook; // ❌ Não usa!

const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
const lastFlowId = nodes[nodeIndex + 1].id;

await ticket.update({
  lastFlowId: lastFlowId,
  dataWebhook: {
    variables: {
      [answerKey]: body
    }
  }
});
```

**Código Corrigido:**

```typescript
const { message, answerKey } = nodeSelected.data.typebotIntegration;

// Busca próximo node usando connections
const nextConnection = connections.find(conn => conn.source === nodeSelected.id);

if (!nextConnection) {
  // Sem próximo node, finalizar flow
  logger.info(`No next node after question ${nodeSelected.id}, ending flow`);
  await ticket.update({
    lastFlowId: null,
    flowStopped: null,
    hashFlowId: null,
    flowWebhook: false,
    dataWebhook: {
      ...(ticket.dataWebhook || {}),
      variables: {
        ...((ticket.dataWebhook?.variables) || {}),
        [answerKey]: body
      }
    }
  });
  return;
}

const lastFlowId = nextConnection.target;

// ✅ Merge correto de variáveis
const oldDataWebhook = ticket.dataWebhook || {};
const oldVariables = oldDataWebhook.variables || {};

await ticket.update({
  lastFlowId: lastFlowId,
  dataWebhook: {
    ...oldDataWebhook,
    variables: {
      ...oldVariables,      // ✅ Mantém variáveis anteriores
      [answerKey]: body     // ✅ Adiciona nova variável
    }
  }
});

await ticket.save();

logger.info(
  `Question answered: ${answerKey} = ${body}, continuing to node ${lastFlowId}`
);
```

### 7.3 Logging para Debug

**Adicionar logs para rastrear o fluxo:**

```typescript
// Após salvar variável
logger.info(`[FlowBuilder] Question answered`, {
  ticketId: ticket.id,
  flowId: ticket.flowStopped,
  questionNodeId: nodeSelected.id,
  answerKey: answerKey,
  answerValue: body,
  nextNodeId: lastFlowId,
  allVariables: ticket.dataWebhook.variables
});
```

---

## 8. Validação Frontend (Opcional)

### 8.1 Sync com Backend (localStorage)

**Problema Atual:**

- Frontend mantém lista de variáveis no localStorage
- Backend salva variáveis em `ticket.dataWebhook.variables`
- Sem sincronização entre eles

**Possível Melhoria:**

Adicionar indicador visual no editor quando há Questions no flow:

**Arquivo:** `frontend/src/pages/FlowBuilderConfig/index.js`

**Após linha 450:**

```javascript
// Extrai variáveis
const filterVariables = flowNodes.filter(nd => nd.type === "question");
const variables = filterVariables.map(variable =>
  variable.data.typebotIntegration.answerKey
);
localStorage.setItem('variables', JSON.stringify(variables));

// ✅ ADICIONAR: Validar duplicatas
const uniqueVariables = [...new Set(variables)];
if (uniqueVariables.length !== variables.length) {
  toast.warning(
    "Atenção: Existem variáveis duplicadas no flow. " +
    "Certifique-se de usar nomes únicos (answerKey) para cada Question."
  );
}

// ✅ ADICIONAR: Validar Questions sequenciais
const questionNodes = flowNodes.filter(nd => nd.type === "question");
if (questionNodes.length > 1) {
  console.log(`Flow has ${questionNodes.length} question nodes:`, uniqueVariables);
}
```

### 8.2 UI/UX: Indicador de Variáveis

**No questionNode.js:**

Mostrar `answerKey` no node visual para facilitar identificação:

**Arquivo:** `frontend/src/pages/FlowBuilderConfig/nodes/questionNode.js`

**Linha 103-126 (atualizar):**

```javascript
<div style={{ color: "#232323", fontSize: "12px", width: 180 }}>
  <div style={{ gap: "5px", padding: "6px" }}>
    <div style={{
      display: "flex",
      position: "relative",
      flexDirection: "row",
      justifyContent: "center"
    }}>
      <BallotIcon sx={{ color: "#EC5858" }} />
    </div>
    <Typography
      textAlign={"center"}
      sx={{
        textOverflow: "ellipsis",
        fontSize: "10px",
        whiteSpace: "nowrap",
        overflow: "hidden"
      }}
    >
      {data?.typebotIntegration?.message}
    </Typography>
    {/* ✅ ADICIONAR: Mostrar answerKey */}
    <Typography
      textAlign={"center"}
      sx={{
        fontSize: "8px",
        color: "#666",
        marginTop: "4px",
        fontFamily: "monospace"
      }}
    >
      {data?.typebotIntegration?.answerKey}
    </Typography>
  </div>
</div>
```

---

## 9. Testes de Validação

### 9.1 Teste Manual (Backend)

**Cenário 1: Duas perguntas sequenciais**

```
Flow:
START → Question 1 ("Nome?", answerKey: "nome") →
        Question 2 ("Email?", answerKey: "email") →
        Message ("Olá {nome}, seu email é {email}")

Passos:
1. User inicia conversa
2. Bot envia: "Nome?"
3. User responde: "João"
4. Bot envia: "Email?"
5. User responde: "joao@email.com"
6. Bot envia: "Olá João, seu email é joao@email.com" ✅

Validação:
- Verificar ticket.dataWebhook.variables após cada resposta
- Esperado após Q1: { nome: "João" }
- Esperado após Q2: { nome: "João", email: "joao@email.com" }
```

**Cenário 2: Três perguntas sequenciais**

```
Flow:
START → Q1 ("Nome?", "nome") →
        Q2 ("Email?", "email") →
        Q3 ("Telefone?", "telefone") →
        Message ("{nome} - {email} - {telefone}")

Validação:
- Após Q1: { nome: "João" }
- Após Q2: { nome: "João", email: "joao@email.com" }
- Após Q3: { nome: "João", email: "joao@email.com", telefone: "11999999999" }
```

**Cenário 3: Question + Menu + Question**

```
Flow:
START → Q1 ("Nome?", "nome") →
        Menu ("1-Vendas 2-Suporte") →
          [1] → Q2 ("Produto interesse?", "produto") → Message
          [2] → Q3 ("Descreva problema?", "problema") → Message

Validação:
- User escolhe 1 (Vendas)
- Após Q1: { nome: "João" }
- Após Q2: { nome: "João", produto: "Plano Premium" }
- Message: "Olá João, você se interessou por Plano Premium"
```

### 9.2 Teste Automatizado (Sugestão)

**Arquivo:** `backend/tests/integration/flowbuilder-sequential-questions.test.ts`

```typescript
import { ActionsWebhookService } from "../../services/WebhookService/ActionsWebhookService";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import Ticket from "../../models/Ticket";

describe("FlowBuilder - Sequential Questions", () => {
  it("should preserve variables across multiple question nodes", async () => {
    // Cria flow com 3 questions
    const flow = await FlowBuilderModel.create({
      name: "Test Flow",
      companyId: 1,
      flow: {
        nodes: [
          { id: "1", type: "start", ... },
          { id: "q1", type: "question", data: { typebotIntegration: { message: "Nome?", answerKey: "nome" }}},
          { id: "q2", type: "question", data: { typebotIntegration: { message: "Email?", answerKey: "email" }}},
          { id: "q3", type: "question", data: { typebotIntegration: { message: "Telefone?", answerKey: "telefone" }}}
        ],
        connections: [
          { source: "1", target: "q1" },
          { source: "q1", target: "q2" },
          { source: "q2", target: "q3" }
        ]
      }
    });

    const ticket = await Ticket.create({
      flowStopped: flow.id,
      lastFlowId: "q1",
      dataWebhook: null,
      companyId: 1
    });

    // Simula resposta Q1
    await simulateUserReply(ticket, "João");
    await ticket.reload();
    expect(ticket.dataWebhook.variables).toEqual({ nome: "João" });

    // Simula resposta Q2
    await simulateUserReply(ticket, "joao@email.com");
    await ticket.reload();
    expect(ticket.dataWebhook.variables).toEqual({
      nome: "João",
      email: "joao@email.com"
    });

    // Simula resposta Q3
    await simulateUserReply(ticket, "11999999999");
    await ticket.reload();
    expect(ticket.dataWebhook.variables).toEqual({
      nome: "João",
      email: "joao@email.com",
      telefone: "11999999999"
    });
  });
});
```

---

## 10. Documentação a Atualizar

### 10.1 Arquivos Frontend

| Arquivo | Linha | Atualização |
|---------|-------|-------------|
| `docs/frontend/FLOWBUILDER.md` | 333-377 | Adicionar nota sobre múltiplas Questions sequenciais |
| `docs/frontend/FLOWBUILDER.md` | 1241-1271 | Atualizar exemplo "Qualificação de Lead" |
| `docs/frontend/COMPONENTS.md` | - | Documentar FlowBuilderAddQuestionModal |

**Adição sugerida em FLOWBUILDER.md:333-377:**

```markdown
### 8. Question Node ❓

**Descrição:** Captura resposta do usuário como variável

**Características:**
- Armazena resposta em variável
- Validação de tipo (texto, número, email)
- Timeout configurável
- Reutilizável em outros nodes
- ✅ **Suporta múltiplas Questions sequenciais** (correção TASK-14)

**Dados:**
```javascript
{
  type: "question",
  data: {
    typebotIntegration: {
      answerKey: "nome_cliente", // Nome da variável (DEVE SER ÚNICO!)
      question: "Qual seu nome completo?"
    }
  }
}
```

**⚠️ Importante:**
- Cada Question DEVE ter um `answerKey` único
- Variáveis são salvas em `ticket.dataWebhook.variables`
- Todas as respostas são preservadas (merge automático)
- Exemplo: Question 1 (answerKey: "nome") + Question 2 (answerKey: "email")
  → Resultado: `{ nome: "João", email: "joao@email.com" }`
```

### 10.2 Arquivos Backend

**Criar:** `docs/backend/FLOWBUILDER-EXECUTION.md`

```markdown
# FlowBuilder Execution Engine

## Question Node Processing

### Flow Execution
1. `ActionsWebhookService.ts:340-363` - Envia pergunta, salva `lastFlowId`, aguarda resposta
2. `wbotMessageListener.ts:4650-4704` - Captura resposta, faz merge de variáveis, retoma flow

### Variable Management
- Variáveis são salvas em `ticket.dataWebhook.variables`
- Cada resposta faz **merge** com variáveis existentes
- Exemplo:
  ```typescript
  // Após Question 1
  { nome: "João" }

  // Após Question 2 (merge)
  { nome: "João", email: "joao@email.com" }

  // Após Question 3 (merge)
  { nome: "João", email: "joao@email.com", telefone: "11999999999" }
  ```

### Navigation Between Nodes
- Usa `connections` array (edges) para navegar
- Encontra próximo node: `connections.find(c => c.source === currentNodeId)`
- Se não encontrar próximo node, finaliza flow
```

---

## 11. Checklist de Implementação

### Backend (Prioridade ALTA)

- [ ] **Fix 1:** Atualizar `wbotMessageListener.ts:4667-4669` para usar connections em vez de índice
- [ ] **Fix 2:** Atualizar `wbotMessageListener.ts:4672-4676` para fazer merge de variáveis
- [ ] **Logging:** Adicionar logs de debug em `wbotMessageListener.ts:4704` após merge
- [ ] **Logging:** Adicionar logs em `ActionsWebhookService.ts:362` após break do Question
- [ ] **Test:** Criar teste automatizado para 2+ Questions sequenciais
- [ ] **Test:** Teste manual com flow real (3 Questions + Message)
- [ ] **Validation:** Verificar edge case: Question sem próximo node
- [ ] **Validation:** Verificar edge case: Question com connection inválida

### Frontend (Prioridade MÉDIA)

- [ ] **Validation:** Adicionar alerta para `answerKey` duplicado em `FlowBuilderConfig/index.js:450`
- [ ] **UI:** Mostrar `answerKey` no visual do questionNode.js:126
- [ ] **Test:** Criar flow com 3 Questions e validar no frontend
- [ ] **UX:** Tooltip explicando `answerKey` no FlowBuilderAddQuestionModal

### Documentação (Prioridade BAIXA)

- [ ] **Update:** `docs/frontend/FLOWBUILDER.md:333-377` (adicionar nota sobre múltiplas Questions)
- [ ] **Update:** `docs/frontend/FLOWBUILDER.md:1241-1271` (exemplo Qualificação Lead)
- [ ] **Create:** `docs/backend/FLOWBUILDER-EXECUTION.md` (documentar engine de execução)
- [ ] **Create:** `docs/analysis/TASK-14-solution-validation.md` (documentar testes)

---

## 12. Risk Assessment

### Alto Risco

- ❌ **Regressão:** Se merge estiver incorreto, pode criar variáveis com nomes errados
- ❌ **Performance:** Merge com muitas variáveis (100+) pode ser lento
- ❌ **Segurança:** Variáveis não validadas podem conter dados sensíveis

**Mitigação:**

- Adicionar validação de `answerKey` (max 50 chars, alfanumérico + underscore)
- Limitar número de variáveis por ticket (max 50)
- Adicionar logs de auditoria para rastrear mudanças em `dataWebhook`

### Médio Risco

- ⚠️ **Compatibilidade:** Flows antigos criados antes do fix podem ter comportamento diferente
- ⚠️ **UI Confusion:** Usuários podem criar `answerKey` duplicado sem perceber

**Mitigação:**

- Adicionar validação frontend para `answerKey` duplicado
- Criar script de migração para flows antigos (se necessário)

### Baixo Risco

- ✅ **Impacto Frontend:** Mudanças são apenas backend
- ✅ **Rollback:** Fácil reverter mudanças em caso de problema

---

## 13. Referências

### Arquivos Analisados

**Frontend:**
- `/frontend/src/pages/FlowBuilderConfig/index.js` (1007 lines)
- `/frontend/src/pages/FlowBuilderConfig/nodes/questionNode.js` (156 lines)
- `/frontend/src/components/FlowBuilderAddQuestionModal/index.js` (226 lines)
- `/frontend/src/stores/useNodeStorage.js` (12 lines)

**Backend:**
- `/backend/src/services/WebhookService/ActionsWebhookService.ts` (869 lines)
- `/backend/src/services/WbotServices/wbotMessageListener.ts` (lines 4620-4770)
- `/backend/src/models/Ticket.ts` (campo `dataWebhook`)

**Documentação:**
- `/docs/frontend/FLOWBUILDER.md` (1431 lines)

### Linha do Tempo de Descoberta

1. ✅ Mapeou estrutura do FlowBuilder (13 node types)
2. ✅ Identificou Question node (`questionNode.js`, `FlowBuilderAddQuestionModal`)
3. ✅ Rastreou execução backend (`ActionsWebhookService.ts:340-363`)
4. ✅ Encontrou bug no listener (`wbotMessageListener.ts:4669` e `4672-4676`)
5. ✅ Validou impacto em casos de uso (qualificação leads, NPS, formulários)
6. ✅ Propôs solução com merge de variáveis

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Analista:** Claude (Frontend Architecture Analyst)
**Status:** ✅ Análise Completa - Aguardando Implementação
