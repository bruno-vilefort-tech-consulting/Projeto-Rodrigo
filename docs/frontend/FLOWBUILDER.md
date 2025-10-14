# 🔀 Sistema Flow Builder - ChatIA Flow

> Construtor visual de fluxos conversacionais para automação de atendimento

**Localização:** `/frontend/src/pages/FlowBuilder*`
**Versão do Sistema:** 2.2.2v-26

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tipos de Nodes](#tipos-de-nodes)
4. [Interface do Editor](#interface-do-editor)
5. [Componentes](#componentes)
6. [Fluxo de Dados](#fluxo-de-dados)
7. [Integra

ções](#integrações)
8. [Exemplos Práticos](#exemplos-práticos)
9. [API](#api)

---

## 🎯 Visão Geral

### O que é o Flow Builder?

O **Flow Builder** é um **construtor visual drag-and-drop** de fluxos conversacionais que permite criar automações complexas para atendimento via WhatsApp **sem programação**.

### Características Principais

✅ **Interface Visual** - Editor drag-and-drop baseado em React Flow
✅ **13 tipos de Nodes** - Mensagens, menus, condições, integrações
✅ **Conexões Interativas** - Linhas animadas com botão de exclusão
✅ **Export/Import** - Salvar e compartilhar flows em JSON
✅ **Real-time** - Salvamento automático no backend
✅ **Integrações** - Typebot, OpenAI, N8N, Dialogflow
✅ **Variáveis Dinâmicas** - Captura e uso de respostas do usuário
✅ **Randomização** - Distribuição percentual de fluxos
✅ **Intervalos** - Delays entre mensagens
✅ **Criação de Tickets** - Transferir para atendente humano

### Casos de Uso

- 🤖 **Chatbots de Atendimento** - Responder FAQs automaticamente
- 📋 **Qualificação de Leads** - Coletar informações antes do atendimento
- 🎯 **Menus Interativos** - Direcionar para filas específicas
- 🔄 **Integração com IA** - OpenAI, Typebot, Dialogflow
- ⏰ **Mensagens Agendadas** - Respostas fora do horário
- 📊 **Pesquisas de Satisfação** - NPS, feedback automático

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **react-flow-renderer** | 10.3.17 | Editor visual de nodes/edges |
| **reactflow** | 11.7.4 | Versão atualizada do React Flow |
| **Zustand** | 4.4.1 | State management (node storage) |
| **Material-UI** | v5 | UI Components |
| **Axios** | 1.6.8 | HTTP requests |

### Estrutura de Arquivos

```
frontend/src/
├── pages/
│   ├── FlowBuilder/
│   │   └── index.js                    # Lista de flows
│   └── FlowBuilderConfig/
│       ├── index.js                    # Editor visual
│       ├── flowbuilder.css             # Estilos customizados
│       └── nodes/                      # 13 tipos de nodes
│           ├── startNode.js            # Node inicial
│           ├── messageNode.js          # Mensagem de texto
│           ├── menuNode.js             # Menu de opções
│           ├── intervalNode.js         # Delay/intervalo
│           ├── imgNode.js              # Imagem
│           ├── audioNode.js            # Áudio
│           ├── videoNode.js            # Vídeo
│           ├── questionNode.js         # Pergunta (captura)
│           ├── ticketNode.js           # Criar ticket
│           ├── typebotNode.js          # Integração Typebot
│           ├── openaiNode.js           # Integração OpenAI
│           ├── randomizerNode.js       # Randomizador
│           ├── singleBlockNode.js      # Bloco único
│           ├── conditionNode.js        # Condicional
│           └── removeEdge.js           # Edge com delete
│
├── components/
│   ├── FlowBuilderModal/              # Modal criar flow
│   ├── FlowBuilderAddTextModal/       # Modal mensagem texto
│   ├── FlowBuilderIntervalModal/      # Modal intervalo
│   ├── FlowBuilderMenuModal/          # Modal menu
│   ├── FlowBuilderConditionModal/     # Modal condição
│   ├── FlowBuilderAddImgModal/        # Modal imagem
│   ├── FlowBuilderAddAudioModal/      # Modal áudio
│   ├── FlowBuilderAddVideoModal/      # Modal vídeo
│   ├── FlowBuilderAddQuestionModal/   # Modal pergunta
│   ├── FlowBuilderAddTicketModal/     # Modal ticket
│   ├── FlowBuilderTypebotModal/       # Modal Typebot
│   ├── FlowBuilderOpenAIModal/        # Modal OpenAI
│   ├── FlowBuilderRandomizerModal/    # Modal randomizer
│   ├── FlowBuilderSingleBlockModal/   # Modal bloco único
│   └── FlowImportModal/               # Modal importar
│
├── stores/
│   └── useNodeStorage.js              # Zustand store
│
└── services/
    └── flowBuilder.js                 # Utils export/import
```

### Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/flowbuilders` | `FlowBuilder` | Lista de flows criados |
| `/flowbuilder/:id?` | `FlowBuilderConfig` | Editor visual do flow |

---

## 🧩 Tipos de Nodes

### 1. Start Node 🚀

**Descrição:** Ponto de início do fluxo

**Características:**
- Sempre primeiro node
- Não pode ser deletado
- Único por flow
- Cor: Verde (#3ABA38)

**Código:**
```javascript
{
  id: "1",
  type: "start",
  position: { x: 250, y: 100 },
  data: { label: "Início do Fluxo" }
}
```

**Visual:**
```
┌──────────────┐
│   🚀 INÍCIO  │
│   Do Fluxo   │
└──────┬───────┘
       │
       ▼
```

---

### 2. Message Node 💬

**Descrição:** Envia mensagem de texto

**Características:**
- Suporta markdown
- Variáveis dinâmicas: `{nome}`, `{telefone}`, `{email}`
- Emojis suportados
- Cor: Vermelho (#EC5858)

**Dados:**
```javascript
{
  type: "message",
  data: {
    label: "Olá {nome}! Como posso ajudar?"
  }
}
```

**Variáveis Disponíveis:**
- `{nome}` - Nome do contato
- `{telefone}` - Telefone do contato
- `{email}` - Email do contato
- `{protocolo}` - Número do ticket
- `{atendente}` - Nome do atendente
- `{fila}` - Nome da fila

---

### 3. Menu Node 📋

**Descrição:** Menu interativo com opções numeradas

**Características:**
- Múltiplas opções (1-9)
- Cada opção conecta a um node diferente
- Validação de resposta
- Cor: Roxo (#683AC8)

**Dados:**
```javascript
{
  type: "menu",
  data: {
    message: "Escolha uma opção:",
    arrayOption: [
      { option: "1", name: "Vendas" },
      { option: "2", name: "Suporte" },
      { option: "3", name: "Financeiro" }
    ]
  }
}
```

**Visual:**
```
Escolha uma opção:
1️⃣ Vendas
2️⃣ Suporte
3️⃣ Financeiro

└─ [1] ──→ Node Vendas
└─ [2] ──→ Node Suporte
└─ [3] ──→ Node Financeiro
```

**Comportamento:**
- Usuário envia "1" → Vai para Node Vendas
- Resposta inválida → Repete o menu
- Timeout configurável

---

### 4. Interval Node ⏰

**Descrição:** Delay entre mensagens

**Características:**
- Intervalo em segundos (1-60s)
- Simula digitação humana
- Cor: Laranja (#F7953B)

**Dados:**
```javascript
{
  type: "interval",
  data: {
    label: "Aguardar 3 segundos",
    sec: 3
  }
}
```

**Uso:**
```
Mensagem 1: "Olá!"
   ↓
[⏰ 2 segundos]
   ↓
Mensagem 2: "Como posso ajudar?"
```

---

### 5. Image Node 🖼️

**Descrição:** Envia imagem

**Características:**
- URL da imagem
- Suporta: JPG, PNG, GIF, WEBP
- Preview no editor
- Cor: Azul (#1FBADC)

**Dados:**
```javascript
{
  type: "img",
  data: {
    url: "https://exemplo.com/imagem.jpg"
  }
}
```

---

### 6. Audio Node 🎵

**Descrição:** Envia áudio ou nota de voz

**Características:**
- URL do áudio ou gravação
- Formatos: MP3, OGG, M4A
- `record: true` = PTT (Push To Talk)
- Cor: Verde (#3ABA38)

**Dados:**
```javascript
{
  type: "audio",
  data: {
    url: "https://exemplo.com/audio.mp3",
    record: false // false = áudio, true = nota de voz
  }
}
```

---

### 7. Video Node 🎥

**Descrição:** Envia vídeo

**Características:**
- URL do vídeo
- Formatos: MP4, AVI, MOV
- Thumbnail automático
- Cor: Vermelho (#EC5858)

**Dados:**
```javascript
{
  type: "video",
  data: {
    url: "https://exemplo.com/video.mp4"
  }
}
```

---

### 8. Question Node ❓

**Descrição:** Captura resposta do usuário como variável

**Características:**
- Armazena resposta em variável
- Validação de tipo (texto, número, email)
- Timeout configurável
- Reutilizável em outros nodes

**Dados:**
```javascript
{
  type: "question",
  data: {
    typebotIntegration: {
      answerKey: "nome_cliente", // Nome da variável
      question: "Qual seu nome completo?"
    }
  }
}
```

**Uso:**
```
Flow:
1. Question Node: "Qual seu nome?" → Salva em {nome_cliente}
2. Message Node: "Prazer {nome_cliente}!"

Conversa:
Bot: "Qual seu nome?"
User: "João Silva"
Bot: "Prazer João Silva!"
```

**Variáveis Salvas:**
```javascript
localStorage.setItem('variables', JSON.stringify([
  'nome_cliente',
  'telefone_cliente',
  'email_cliente'
]))
```

---

### 9. Ticket Node 🎫

**Descrição:** Cria ticket e transfere para atendente humano

**Características:**
- Seleciona fila de destino
- Seleciona usuário específico (opcional)
- Finaliza o bot
- Cor: Laranja (#F7953B)

**Dados:**
```javascript
{
  type: "ticket",
  data: {
    queueId: 5,           // ID da fila
    userId: null,         // ID do usuário (opcional)
    message: "Cliente solicitou atendimento humano"
  }
}
```

**Fluxo:**
```
Menu: "Falar com atendente?"
  ↓
Ticket Node (Fila: Vendas)
  ↓
✅ Ticket criado
✅ Bot finalizado
✅ Atendente humano assume
```

---

### 10. Typebot Node 🤖

**Descrição:** Integração com Typebot (construtor de chatbots)

**Características:**
- URL do Typebot
- Typebot Key
- Passa variáveis do flow
- Recebe variáveis do Typebot

**Dados:**
```javascript
{
  type: "typebot",
  data: {
    typebotUrl: "https://typebot.io/my-flow-abc123",
    typebotKey: "sk_abc123456789",
    typebotName: "Qualificação de Leads"
  }
}
```

**Exemplo:**
```
Flow ChatIA → Typebot → Volta para Flow ChatIA
             (form complexo)
```

---

### 11. OpenAI Node 🧠

**Descrição:** Integração com OpenAI (ChatGPT)

**Características:**
- Prompt customizado
- Modelo configurável (GPT-3.5, GPT-4)
- Temperatura configurável
- Contexto de variáveis

**Dados:**
```javascript
{
  type: "openai",
  data: {
    prompt: "Você é um assistente de vendas. Responda: {ultima_mensagem}",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 150
  }
}
```

**Fluxo com IA:**
```
User: "Qual o preço do produto X?"
  ↓
OpenAI Node: Analisa pergunta e responde
  ↓
Bot: "O produto X custa R$ 99,90 e está em promoção..."
```

---

### 12. Randomizer Node 🎲

**Descrição:** Distribuição percentual de fluxos (A/B testing)

**Características:**
- Múltiplas saídas com percentuais
- A/B testing
- Balanceamento de carga
- Cor: Ciano (#1FBADC)

**Dados:**
```javascript
{
  type: "randomizer",
  data: {
    percent: [
      { value: 50, connection: "node_a" }, // 50% vai para Node A
      { value: 30, connection: "node_b" }, // 30% vai para Node B
      { value: 20, connection: "node_c" }  // 20% vai para Node C
    ]
  }
}
```

**Uso:**
```
Randomizer (100 usuários):
├─ 50% (50 users) → Atendente João
├─ 30% (30 users) → Atendente Maria
└─ 20% (20 users) → Atendente Pedro
```

---

### 13. Single Block Node 📦

**Descrição:** Bloco único que agrupa múltiplos conteúdos

**Características:**
- Texto + Imagem + Áudio + Vídeo
- Botões interativos
- Lista de produtos
- Simplifica fluxos complexos

**Dados:**
```javascript
{
  type: "singleBlock",
  data: {
    text: "Confira nossos produtos!",
    imageUrl: "https://exemplo.com/catalogo.jpg",
    buttons: [
      { id: 1, text: "Ver mais" },
      { id: 2, text: "Comprar" }
    ]
  }
}
```

---

## 🎨 Interface do Editor

### Layout Completo

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ < Voltar │ Editor de Flow: "Atendimento Vendas"     │  │
│  │ [Import] [Export] [Salvar]                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Canvas Principal                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SpeedDial                                             │ │
│  │  ┌───┐                                                 │ │
│  │  │ + │ ◄─ Botão adicionar nodes                      │ │
│  │  └─┬─┘                                                 │ │
│  │    ├─ 🚀 Início                                       │ │
│  │    ├─ 💬 Mensagem                                     │ │
│  │    ├─ 📋 Menu                                         │ │
│  │    ├─ ⏰ Intervalo                                    │ │
│  │    ├─ 🎫 Ticket                                       │ │
│  │    ├─ 🤖 Typebot                                      │ │
│  │    ├─ 🧠 OpenAI                                       │ │
│  │    ├─ ❓ Pergunta                                     │ │
│  │    └─ 🎲 Randomizer                                   │ │
│  │                                                         │ │
│  │  ┌──────────┐          ┌──────────┐                  │ │
│  │  │  START   │────────→ │ Mensagem │                  │ │
│  │  │   🚀     │          │  "Olá!"  │                  │ │
│  │  └──────────┘          └────┬─────┘                  │ │
│  │                              │                         │ │
│  │                              ▼                         │ │
│  │                         ┌─────────┐                   │ │
│  │                         │  Menu   │                   │ │
│  │                         │ 1,2,3   │                   │ │
│  │                         └──┬─┬─┬──┘                   │ │
│  │                            │ │ │                      │ │
│  │  ┌─────────────────────────┘ │ └───────────────┐    │ │
│  │  ▼                            ▼                  ▼    │ │
│  │ Vendas                     Suporte           Financeiro│ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────┬─┘ │
│                                                          │   │
│  MiniMap (canto inferior direito)                       │   │
│  ┌────────┐ Controls                                    │   │
│  │ [+][-] │ (zoom, fit, lock)                          │   │
│  └────────┘                                             │   │
└─────────────────────────────────────────────────────────────┘

Lembrete: "Lembre-se de salvar o fluxo!"
```

### SpeedDial - Adicionar Nodes

**Localização:** Canto superior esquerdo

**Ações:**
```javascript
const actions = [
  { icon: "🚀", name: "Início", type: "start", color: "#3ABA38" },
  { icon: "📚", name: "Conteúdo", type: "content", color: "#EC5858" },
  { icon: "📋", name: "Menu", type: "menu", color: "#683AC8" },
  { icon: "🎲", name: "Randomizador", type: "random", color: "#1FBADC" },
  { icon: "⏰", name: "Intervalo", type: "interval", color: "#F7953B" },
  { icon: "🎫", name: "Ticket", type: "ticket", color: "#F7953B" },
  { icon: "🤖", name: "Typebot", type: "typebot", color: "#3aba38" },
  { icon: "🧠", name: "OpenAI", type: "openai", color: "#F7953B" },
  { icon: "❓", name: "Pergunta", type: "question", color: "#F7953B" }
];
```

### Controls (Zoom e Navegação)

- **[+]** - Zoom in
- **[-]** - Zoom out
- **[⊡]** - Fit view (ajustar canvas)
- **[🔒]** - Lock/unlock interação

### MiniMap

**Posição:** Canto inferior direito

Mostra visão geral do flow completo, útil para flows grandes.

### Background

Grid de pontos para facilitar alinhamento dos nodes.

---

## 🔧 Componentes

### 1. FlowBuilder (Lista)

**Arquivo:** `/pages/FlowBuilder/index.js`

**Responsabilidade:** Listar todos os flows criados

**Funcionalidades:**
- ✅ Criar novo flow
- ✅ Editar nome do flow
- ✅ Editar flow (ir para editor)
- ✅ Duplicar flow
- ✅ Deletar flow
- ✅ Ativar/desativar flow
- ✅ Buscar flows

**UI:**
```
┌──────────────────────────────────────────────────────────┐
│ Flows de Automação              [🔍 Buscar] [+ Novo]    │
├──────────────────────────────────────────────────────────┤
│ Nome              │ Status          │ Ações              │
├──────────────────────────────────────────────────────────┤
│ Atendimento Sales │ ✅ Ativo        │ [⋮]                │
│ Suporte FAQ       │ ❌ Inativo      │ [⋮]                │
│ Qualificação Lead │ ✅ Ativo        │ [⋮]                │
└──────────────────────────────────────────────────────────┘

Menu [⋮]:
- Editar Nome
- Editar Flow
- Duplicar
- Deletar
```

**Código:**
```javascript
const FlowBuilder = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await api.get("/flowbuilder");
      setWebhooks(data.flows);
    };
    fetchFlows();
  }, []);

  return (
    <MainContainer>
      <MainHeader>
        <Title>Flows de Automação</Title>
        <Button onClick={handleOpenModal}>+ Novo Flow</Button>
      </MainHeader>

      {webhooks.map(flow => (
        <FlowItem
          key={flow.id}
          flow={flow}
          onEdit={() => history.push(`/flowbuilder/${flow.id}`)}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      ))}
    </MainContainer>
  );
};
```

---

### 2. FlowBuilderConfig (Editor)

**Arquivo:** `/pages/FlowBuilderConfig/index.js`

**Responsabilidade:** Editor visual drag-and-drop

**State Management:**
```javascript
// React Flow
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// Modals
const [modalAddText, setModalAddText] = useState(null);
const [modalAddMenu, setModalAddMenu] = useState(null);
const [modalAddInterval, setModalAddInterval] = useState(null);
// ... (14 modais total)

// Data
const [loading, setLoading] = useState(false);
const [dataNode, setDataNode] = useState(null);
```

**Carregar Flow:**
```javascript
useEffect(() => {
  const fetchFlow = async () => {
    const { data } = await api.get(`/flowbuilder/flow/${id}`);
    if (data.flow.flow !== null) {
      setNodes(data.flow.flow.nodes);
      setEdges(data.flow.flow.connections);

      // Extrair variáveis
      const variables = data.flow.flow.nodes
        .filter(nd => nd.type === "question")
        .map(v => v.data.typebotIntegration.answerKey);

      localStorage.setItem('variables', JSON.stringify(variables));
    }
  };
  fetchFlow();
}, [id]);
```

**Salvar Flow:**
```javascript
const saveFlow = async () => {
  await api.post("/flowbuilder/flow", {
    idFlow: id,
    nodes: nodes,
    connections: edges
  });
  toast.success("Flow salvo com sucesso!");
};
```

**Adicionar Node:**
```javascript
const addNode = (type, data) => {
  const posY = nodes[nodes.length - 1].position.y;
  const posX = nodes[nodes.length - 1].position.x + 240;

  if (type === "text") {
    setNodes(old => [
      ...old,
      {
        id: geraStringAleatoria(30),
        position: { x: posX, y: posY },
        data: { label: data.text },
        type: "message"
      }
    ]);
  }
};
```

**Editar Node (Double Click):**
```javascript
const doubleClick = (event, node) => {
  setDataNode(node);

  if (node.type === "message") setModalAddText("edit");
  if (node.type === "menu") setModalAddMenu("edit");
  if (node.type === "interval") setModalAddInterval("edit");
  // ...
};
```

**Conectar Nodes:**
```javascript
const onConnect = useCallback(
  (params) =>
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "buttonedge", // Edge com botão delete
          animated: true,
          data: {
            onDelete: (idToDelete) => {
              setEdges((prev) => prev.filter((ed) => ed.id !== idToDelete));
            }
          }
        },
        eds
      )
    ),
  [setEdges]
);
```

---

### 3. Zustand Store (useNodeStorage)

**Arquivo:** `/stores/useNodeStorage.js`

**Responsabilidade:** State global para ações de nodes

**State:**
```javascript
{
  node: "",           // ID do node selecionado
  connect: "",        // Conexões
  action: "idle"      // idle | delete | duplicate
}
```

**Actions:**
```javascript
setNodesStorage(node)        // Selecionar node
setConnectsStorage(connects) // Atualizar conexões
setAct(act)                  // Definir ação (delete, duplicate)
```

**Uso:**
```javascript
const storageItems = useNodeStorage();

// Deletar node
storageItems.setNodesStorage(nodeId);
storageItems.setAct("delete");

// Duplicar node
storageItems.setNodesStorage(nodeId);
storageItems.setAct("duplicate");
```

**Effect Listener:**
```javascript
useEffect(() => {
  if (storageItems.action === "delete") {
    setNodes(old => old.filter(item => item.id !== storageItems.node));
    setEdges(old => old.filter(item =>
      item.source !== storageItems.node &&
      item.target !== storageItems.node
    ));
    storageItems.setAct("idle");
  }

  if (storageItems.action === "duplicate") {
    const nodeToDuplicate = nodes.find(n => n.id === storageItems.node);
    const newNode = {
      ...nodeToDuplicate,
      id: geraStringAleatoria(30),
      position: { x: posX + 240, y: posY }
    };
    setNodes(old => [...old, newNode]);
    storageItems.setAct("idle");
  }
}, [storageItems.action]);
```

---

## 🔄 Fluxo de Dados

### 1. Criar Flow

```
User: Clicar "+ Novo Flow"
  ↓
FlowBuilderModal abre
  ↓
User: Digita nome "Atendimento Vendas"
  ↓
POST /flowbuilder { name: "Atendimento Vendas" }
  ↓
Backend: Cria flow vazio
  ↓
Retorna { id: 123, name: "Atendimento Vendas" }
  ↓
Redirect para /flowbuilder/123 (Editor)
```

### 2. Editar Flow

```
User: Abre editor /flowbuilder/123
  ↓
GET /flowbuilder/flow/123
  ↓
Backend: Retorna { nodes: [...], connections: [...] }
  ↓
setNodes(data.flow.flow.nodes)
setEdges(data.flow.flow.connections)
  ↓
React Flow renderiza canvas
```

### 3. Adicionar Node

```
User: Clica SpeedDial → "Menu"
  ↓
setModalAddMenu("create")
  ↓
FlowBuilderMenuModal abre
  ↓
User: Preenche:
  - Mensagem: "Escolha uma opção:"
  - Opções: ["1-Vendas", "2-Suporte"]
  ↓
Clica "Salvar"
  ↓
menuAdd(data)
  ↓
addNode("menu", data)
  ↓
setNodes(old => [...old, newMenuNode])
  ↓
Node aparece no canvas
```

### 4. Conectar Nodes

```
User: Arrasta de Node A → Node B
  ↓
onConnect({ source: "nodeA", target: "nodeB" })
  ↓
setEdges(eds => addEdge({ ...params, type: "buttonedge" }, eds))
  ↓
Linha animada conecta os nodes
```

### 5. Salvar Flow

```
User: Clica "Salvar"
  ↓
saveFlow()
  ↓
POST /flowbuilder/flow {
  idFlow: 123,
  nodes: [...],
  connections: [...]
}
  ↓
Backend: Salva no banco PostgreSQL
  ↓
toast.success("Flow salvo!")
```

### 6. Export Flow

```
User: Clica "Export"
  ↓
exportFlow(id)
  ↓
GET /flowbuilder/export/123
  ↓
Backend: Retorna JSON do flow
  ↓
Download: flow_atendimento_vendas.json
```

### 7. Import Flow

```
User: Clica "Import"
  ↓
FlowImportModal abre
  ↓
User: Seleciona flow_vendas.json
  ↓
POST /flowbuilder/import { file: JSON }
  ↓
Backend: Cria novo flow com dados importados
  ↓
Redirect para editor do novo flow
```

---

## 🔗 Integrações

### 1. Typebot Integration

**O que é Typebot?**

Plataforma de criação de chatbots com interface visual similar ao Flow Builder.

**Como integrar:**

1. Criar flow no Typebot (https://typebot.io)
2. Obter URL e API Key
3. Adicionar "Typebot Node" no Flow Builder
4. Configurar:
   - URL do Typebot
   - API Key
   - Variáveis de entrada/saída

**Fluxo:**
```
ChatIA Flow
  ↓
User: "Quero fazer um pedido"
  ↓
Typebot Node (form de pedido complexo)
  ↓
Typebot coleta: nome, endereço, produto, quantidade
  ↓
Volta para ChatIA Flow com variáveis preenchidas
  ↓
Cria ticket com dados do pedido
```

**Código:**
```javascript
{
  type: "typebot",
  data: {
    typebotUrl: "https://typebot.io/my-order-form",
    typebotKey: "sk_abc123",
    variables: {
      nome_cliente: "{nome}",
      telefone_cliente: "{telefone}"
    }
  }
}
```

---

### 2. OpenAI Integration

**O que é?**

Integração com ChatGPT (GPT-3.5, GPT-4) para respostas inteligentes.

**Como integrar:**

1. Obter API Key da OpenAI
2. Configurar no backend (variável de ambiente)
3. Adicionar "OpenAI Node" no flow
4. Configurar prompt

**Exemplo - Assistente de Vendas:**
```javascript
{
  type: "openai",
  data: {
    prompt: `Você é um assistente de vendas da empresa XYZ.
    Responda a pergunta do cliente de forma amigável e objetiva:

    Pergunta: {ultima_mensagem}

    Informações disponíveis:
    - Produto A: R$ 99,90
    - Produto B: R$ 149,90
    - Frete grátis acima de R$ 200`,

    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 150
  }
}
```

**Fluxo com IA:**
```
User: "Quanto custa o Produto A e como funciona a entrega?"
  ↓
OpenAI Node:
  - Envia pergunta para GPT
  - GPT analisa e responde
  ↓
Bot: "O Produto A custa R$ 99,90. Nossa entrega é realizada em
todo o Brasil, com prazo de 5-7 dias úteis. Frete grátis para
compras acima de R$ 200!"
```

---

### 3. N8N Integration

**O que é N8N?**

Plataforma de automação de workflows (similar ao Zapier).

**Como integrar:**

Via Webhook Node no N8N:

1. Criar workflow no N8N
2. Adicionar "Webhook" node
3. Copiar URL do webhook
4. No Flow Builder, fazer HTTP request para o webhook

**Exemplo - Salvar lead no CRM:**
```
Flow Builder
  ↓
Question Node: Captura nome, email, telefone
  ↓
HTTP Request para N8N Webhook
  ↓
N8N recebe dados
  ↓
N8N salva no Google Sheets / HubSpot / Salesforce
  ↓
N8N retorna "Lead salvo com sucesso!"
  ↓
Flow Builder mostra mensagem de confirmação
```

---

### 4. Dialogflow Integration

**O que é Dialogflow?**

Plataforma de NLP (Natural Language Processing) do Google.

**Como integrar:**

1. Criar agente no Dialogflow
2. Treinar intents
3. Obter credentials JSON
4. Configurar no backend
5. Flow Builder envia mensagem → Dialogflow analisa → Retorna intent

**Exemplo:**
```
User: "Quero cancelar meu pedido"
  ↓
Dialogflow detecta intent: "cancel_order"
  ↓
Flow direciona para fluxo de cancelamento
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Atendimento Simples

**Flow:**
```
START
  ↓
Mensagem: "Olá! Bem-vindo ao suporte."
  ↓
Menu:
  1. Vendas
  2. Suporte
  3. Financeiro
  ↓
[1] → Ticket (Fila: Vendas)
[2] → Ticket (Fila: Suporte)
[3] → Ticket (Fila: Financeiro)
```

**Código JSON:**
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "start",
      "position": { "x": 100, "y": 100 },
      "data": { "label": "Início" }
    },
    {
      "id": "2",
      "type": "message",
      "position": { "x": 300, "y": 100 },
      "data": { "label": "Olá! Bem-vindo ao suporte." }
    },
    {
      "id": "3",
      "type": "menu",
      "position": { "x": 500, "y": 100 },
      "data": {
        "message": "Escolha uma opção:",
        "arrayOption": [
          { "option": "1", "name": "Vendas" },
          { "option": "2", "name": "Suporte" },
          { "option": "3", "name": "Financeiro" }
        ]
      }
    },
    {
      "id": "4",
      "type": "ticket",
      "position": { "x": 700, "y": 50 },
      "data": { "queueId": 1 }
    },
    {
      "id": "5",
      "type": "ticket",
      "position": { "x": 700, "y": 150 },
      "data": { "queueId": 2 }
    },
    {
      "id": "6",
      "type": "ticket",
      "position": { "x": 700, "y": 250 },
      "data": { "queueId": 3 }
    }
  ],
  "connections": [
    { "source": "1", "target": "2" },
    { "source": "2", "target": "3" },
    { "source": "3", "target": "4", "sourceHandle": "option_1" },
    { "source": "3", "target": "5", "sourceHandle": "option_2" },
    { "source": "3", "target": "6", "sourceHandle": "option_3" }
  ]
}
```

---

### Exemplo 2: Qualificação de Lead

**Flow:**
```
START
  ↓
Mensagem: "Olá! Vamos qualificar seu interesse."
  ↓
Question: "Qual seu nome?" → {nome}
  ↓
Question: "Qual seu email?" → {email}
  ↓
Question: "Qual seu telefone?" → {telefone}
  ↓
Question: "Que produto te interessa?" → {produto}
  ↓
Mensagem: "Obrigado {nome}! Em breve entraremos em contato."
  ↓
Ticket (Fila: Vendas, dados: {nome}, {email}, {telefone}, {produto})
```

**Variáveis capturadas:**
```javascript
{
  nome: "João Silva",
  email: "joao@email.com",
  telefone: "(11) 99999-9999",
  produto: "Plano Premium"
}
```

---

### Exemplo 3: Pesquisa de Satisfação (NPS)

**Flow:**
```
START
  ↓
Mensagem: "Obrigado por usar nosso serviço!"
  ↓
Question: "De 0 a 10, qual a chance de nos recomendar?" → {nps_score}
  ↓
Condição: {nps_score} >= 9
  ├─ TRUE → Mensagem: "Que ótimo! Obrigado pelo feedback!"
  └─ FALSE → Question: "O que podemos melhorar?" → {feedback}
          ↓
          Mensagem: "Obrigado! Vamos trabalhar nisso."
```

---

## 📡 API Endpoints

### GET /flowbuilder

**Descrição:** Listar todos os flows

**Response:**
```json
{
  "flows": [
    {
      "id": 1,
      "name": "Atendimento Vendas",
      "active": true,
      "userId": 5,
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-15T14:30:00Z"
    }
  ],
  "hasMore": false
}
```

---

### GET /flowbuilder/flow/:id

**Descrição:** Obter flow específico com nodes e connections

**Response:**
```json
{
  "flow": {
    "id": 1,
    "name": "Atendimento Vendas",
    "flow": {
      "nodes": [...],
      "connections": [...]
    }
  }
}
```

---

### POST /flowbuilder

**Descrição:** Criar novo flow

**Request:**
```json
{
  "name": "Novo Flow"
}
```

**Response:**
```json
{
  "id": 10,
  "name": "Novo Flow",
  "active": false
}
```

---

### POST /flowbuilder/flow

**Descrição:** Salvar nodes e connections do flow

**Request:**
```json
{
  "idFlow": 1,
  "nodes": [...],
  "connections": [...]
}
```

---

### POST /flowbuilder/duplicate

**Descrição:** Duplicar flow existente

**Request:**
```json
{
  "flowId": 5
}
```

**Response:**
```json
{
  "id": 11,
  "name": "Atendimento Vendas (Cópia)"
}
```

---

### DELETE /flowbuilder/:id

**Descrição:** Deletar flow

**Response:**
```json
{
  "message": "Flow deletado com sucesso"
}
```

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [PAGES.md](./PAGES.md) - Página FlowBuilder e FlowBuilderConfig
- [COMPONENTS.md](./COMPONENTS.md) - Todos os 14 modais
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Detalhes das integrações
- [API.md](./API.md) - Endpoints completos

### Links Externos

- [React Flow Documentation](https://reactflow.dev/)
- [Typebot](https://typebot.io/)
- [OpenAI API](https://platform.openai.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
