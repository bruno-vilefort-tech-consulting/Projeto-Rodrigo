# 📄 Páginas - ChatIA Flow

Documentação completa de todas as 43 páginas do sistema.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Páginas Públicas](#páginas-públicas)
- [Páginas de Gerência](#páginas-de-gerência)
- [Páginas Principais](#páginas-principais)
- [Páginas de Administração](#páginas-de-administração)
- [Tabela Completa](#tabela-completa-de-páginas)

---

## Visão Geral

O sistema possui **43 páginas** organizadas em 4 categorias principais:

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| 🔓 Públicas | 4 | Login, Signup, Recuperação de senha |
| 📊 Gerência | 3 | Dashboard, Relatórios, Painel real-time |
| 💬 Principais | 10 | Atendimentos, Contatos, Chat interno |
| ⚙️ Administração | 26 | Campanhas, Integrações, Configurações |

---

## Páginas Públicas

### 1. Login (`/login`)

**Localização:** `/src/pages/Login/index.js`

**Descrição:** Página de autenticação do sistema.

**Funcionalidades:**
- ✅ Login com email e senha
- ✅ Validação de formulário
- ✅ Verificação de vencimento da empresa
- ✅ Redirecionamento automático se já autenticado
- ✅ Link para recuperação de senha
- ✅ Link para cadastro (se habilitado)

**Componentes utilizados:**
- `TextField` (Material-UI)
- `Button`
- `Formik` + `Yup` (validação)

**Rotas relacionadas:**
- Sucesso → `/tickets` ou `/financeiro-aberto`
- Esqueceu senha → `/forgot-password`
- Cadastro → `/signup`

**Permissões:** Pública

---

### 2. Signup (`/signup`)

**Localização:** `/src/pages/Signup/index.js`

**Descrição:** Página de registro de nova empresa.

**Funcionalidades:**
- ✅ Cadastro de empresa
- ✅ Primeiro usuário admin
- ✅ Validação de dados
- ✅ Integração com planos

**Campos:**
- Nome da empresa
- Email do admin
- Senha
- Telefone
- Plano selecionado

**Permissões:** Pública (se habilitado)

---

### 3. ForgotPassword (`/forgot-password`)

**Localização:** `/src/pages/ForgetPassWord/index.js`

**Descrição:** Solicitar recuperação de senha.

**Funcionalidades:**
- ✅ Envio de email de recuperação
- ✅ Validação de email
- ✅ Feedback de sucesso/erro

**Fluxo:**
1. Usuário informa email
2. Sistema envia email com link
3. Link redireciona para `/reset-password`

**Permissões:** Pública

---

### 4. ResetPassword (`/reset-password`)

**Localização:** `/src/pages/ResetPassword/index.js`

**Descrição:** Redefinir senha com token.

**Funcionalidades:**
- ✅ Validação de token
- ✅ Nova senha
- ✅ Confirmação de senha
- ✅ Redirecionamento para login

**Permissões:** Pública (com token válido)

---

## Páginas de Gerência

### 5. Dashboard (`/`)

**Localização:** `/src/pages/Dashboard/index.js`

**Descrição:** Painel principal de estatísticas e métricas.

**Funcionalidades:**
- 📊 Contadores de tickets (abertos, pendentes, fechados)
- 📊 Gráficos de atendimento
- 📊 Performance por atendente
- 📊 Novos contatos
- 📊 Tempo médio de atendimento
- 📊 NPS (Net Promoter Score)
- 📊 Filtros por período, usuário, fila

**Componentes:**
- `ChartsDate`
- `ChartsUser`
- `Card` com métricas
- `DatePicker` para filtros

**Widgets:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Em atend.  │  Aguardando │ Finalizados │   Novos     │
│             │             │             │  Contatos   │
└─────────────┴─────────────┴─────────────┴─────────────┘
┌───────────────────────────────────────────────────────┐
│           Gráfico de Atendimentos por Dia            │
└───────────────────────────────────────────────────────┘
┌───────────────────────────────────────────────────────┐
│     Performance por Atendente (Gráfico de Barras)    │
└───────────────────────────────────────────────────────┘
```

**Permissões:** Admin ou usuário com `showDashboard = "enabled"`

**Veja também:** [REPORTS.md](#), [MOMENTS.md](#)

---

### 6. Reports (`/reports`)

**Localização:** `/src/pages/Reports/index.js`

**Descrição:** Relatórios detalhados de atendimento.

**Funcionalidades:**
- 📊 Relatórios por período
- 📊 Exportação para Excel/CSV
- 📊 Filtros avançados
- 📊 Tabelas paginadas
- 📊 Gráficos interativos

**Tipos de relatórios:**
- Atendimentos por usuário
- Atendimentos por fila
- Tempo médio de resposta
- Taxa de resolução
- Tickets por horário

**Exportação:**
```javascript
// Botão de exportação
<Button onClick={handleExport}>
  Exportar para Excel
</Button>
```

**Permissões:** Admin

---

### 7. Moments (`/moments`)

**Localização:** `/src/pages/Moments/index.js`

**Descrição:** Painel em tempo real de todos os atendimentos.

**Funcionalidades:**
- ⚡ Monitoramento em tempo real
- ⚡ Grid de todos os tickets ativos
- ⚡ Status de atendentes
- ⚡ Conexões ativas
- ⚡ Atualização via Socket.IO

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  Status Geral  │  Online: 5  │  Atendendo: 12  │
├─────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ │ Ticket  │ │ Ticket  │ │ Ticket  │ │ Ticket  ││
│ │   #123  │ │   #124  │ │   #125  │ │   #126  ││
│ │         │ │         │ │         │ │         ││
│ │ João    │ │ Maria   │ │ Pedro   │ │ Ana     ││
│ │ 3 msg   │ │ 1 msg   │ │ 5 msg   │ │ 2 msg   ││
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│ ...mais tickets...                              │
└─────────────────────────────────────────────────┘
```

**Permissões:** Admin ou usuário com `allowRealTime = "enabled"`

---

## Páginas Principais

### 8. TicketResponsiveContainer (`/tickets/:ticketId?`)

**Localização:** `/src/pages/TicketResponsiveContainer/index.js`

**Descrição:** Container responsivo para atendimento de tickets.

**Funcionalidades:**
- 📱 Layout responsivo (mobile/desktop)
- 💬 Split view: Lista + Chat
- 💬 Seleção de ticket
- 💬 Sincronização real-time

**Layout Desktop:**
```
┌─────────────────┬───────────────────────────────┐
│                 │                               │
│  Lista Tickets  │      Chat do Ticket          │
│                 │                               │
│  □ Ticket #123  │  ┌─────────────────────────┐ │
│  ■ Ticket #124  │  │  Header: João Silva      │ │
│  □ Ticket #125  │  ├─────────────────────────┤ │
│  □ Ticket #126  │  │                          │ │
│                 │  │  Mensagens               │ │
│                 │  │                          │ │
│                 │  ├─────────────────────────┤ │
│                 │  │  Input de mensagem       │ │
│                 │  └─────────────────────────┘ │
└─────────────────┴───────────────────────────────┘
```

**Layout Mobile:**
- Lista OU Chat (um de cada vez)
- Navegação por botão voltar

**Componentes utilizados:**
- `TicketsList`
- `Ticket`
- `MessagesList`
- `MessageInput`

**Permissões:** Usuário autenticado

---

### 9. Tickets (`/tickets`)

**Localização:** `/src/pages/Tickets/index.js`

**Descrição:** Página legada de tickets (desktop only).

**Funcionalidades:**
- Similar ao TicketResponsiveContainer
- Layout fixo desktop
- Tabs de status

**Permissões:** Usuário autenticado

---

### 10. TicketsAdvanced / TicketsCustom

**Localização:**
- `/src/pages/TicketsAdvanced/index.js`
- `/src/pages/TicketsCustom/index.js`

**Descrição:** Variações customizadas da página de tickets.

**Funcionalidades:**
- Layouts alternativos
- Filtros especiais
- Visualizações customizadas

**Uso:** Dependente de configuração da empresa

---

### 11. Contacts (`/contacts`)

**Localização:** `/src/pages/Contacts/index.js`

**Descrição:** Gerenciamento de contatos.

**Funcionalidades:**
- 👥 Lista paginada de contatos
- 👥 Busca por nome/número
- 👥 Criar/Editar/Deletar contatos
- 👥 Adicionar tags
- 👥 Importar contatos
- 👥 Exportar para Excel
- 👥 Visualizar histórico de atendimentos

**Tabela de contatos:**
| Nome | Número | Email | Tags | Ações |
|------|--------|-------|------|-------|
| João Silva | 5511999999999 | joao@email.com | VIP | ✏️ 🗑️ |
| Maria Santos | 5511888888888 | maria@email.com | Cliente | ✏️ 🗑️ |

**Ações:**
- ➕ Adicionar contato
- 📤 Importar de arquivo
- 📥 Exportar lista

**Componentes:**
- `ContactModal`
- `ContactDrawer`
- `ContactImport`
- `TableRowSkeleton`

**Permissões:** Usuário autenticado

**Veja também:** [COMPONENTS.md#ContactModal](./COMPONENTS.md)

---

### 12. Contacts Import (`/contacts/import`)

**Localização:** `/src/pages/Contacts/import.js`

**Descrição:** Importação em massa de contatos.

**Funcionalidades:**
- 📤 Upload de arquivo CSV/XLSX
- 📤 Mapeamento de colunas
- 📤 Validação de dados
- 📤 Preview antes de importar
- 📤 Progresso de importação

**Formatos suportados:**
- CSV (`,` ou `;`)
- Excel (`.xlsx`, `.xls`)

**Template de exemplo:**
```csv
nome,numero,email,tags
João Silva,5511999999999,joao@email.com,VIP;Cliente
Maria Santos,5511888888888,maria@email.com,Cliente
```

**Permissões:** Admin

---

### 13. QuickMessages (`/quick-messages`)

**Localização:** `/src/pages/QuickMessages/index.js`

**Descrição:** Gerenciamento de respostas rápidas.

**Funcionalidades:**
- ⚡ Criar/Editar/Deletar respostas rápidas
- ⚡ Atalhos personalizados (ex: `/oi`, `/obrigado`)
- ⚡ Suporte a variáveis (`{{nome}}`, `{{protocolo}}`)
- ⚡ Mídia anexada (opcional)
- ⚡ Categorias/Tags

**Exemplo de resposta rápida:**
```
Atalho: /oi
Mensagem:
Olá {{nome}}, tudo bem?
Sou {{usuario}}, como posso ajudar?
Protocolo: {{protocolo}}

Mídia: imagem_saudacao.jpg
```

**Uso no chat:**
- Digite `/` para abrir autocomplete
- Selecione resposta
- Variáveis são substituídas automaticamente

**Componentes:**
- `QuickMessageDialog`
- `QuickMessagesTable`

**Permissões:** Usuário autenticado

---

### 14. Kanban (`/kanban`)

**Localização:** `/src/pages/Kanban/index.js`

**Descrição:** Visualização Kanban de tickets.

**Funcionalidades:**
- 📋 Colunas por status/fila
- 📋 Drag & drop de tickets
- 📋 Filtros por fila, usuário, tags
- 📋 Contadores em tempo real
- 📋 Sincronização Socket.IO

**Layout:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Aguardando│ Em atendim. │  Resolvidos │   Fechados  │
│     (5)     │     (12)    │     (8)     │     (23)    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ □ Ticket 1  │ □ Ticket 5  │ □ Ticket 9  │ □ Ticket 13 │
│ □ Ticket 2  │ □ Ticket 6  │ □ Ticket 10 │ □ Ticket 14 │
│ □ Ticket 3  │ □ Ticket 7  │ □ Ticket 11 │ □ Ticket 15 │
│ □ Ticket 4  │ □ Ticket 8  │ □ Ticket 12 │ □ Ticket 16 │
│             │             │             │             │
│   + Mais    │   + Mais    │   + Mais    │   + Mais    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Permissões:** Plano com `useKanban = true`

**Veja também:** [KANBAN.md](./KANBAN.md)

---

### 15. TagsKanban (`/TagsKanban`)

**Localização:** `/src/pages/TagsKanban/index.js`

**Descrição:** Kanban organizado por tags.

**Funcionalidades:**
- 📋 Colunas por tags
- 📋 Drag & drop entre tags
- 📋 Criação rápida de tags
- 📋 Cores personalizadas

**Uso:** Workflow baseado em etiquetas

**Permissões:** Plano com `useKanban = true`

---

### 16. Schedules (`/schedules`)

**Localização:** `/src/pages/Schedules/index.js`

**Descrição:** Agendamento de mensagens.

**Funcionalidades:**
- 📅 Agendar mensagens futuras
- 📅 Recorrência (diária, semanal, mensal)
- 📅 Escolher contato/grupo
- 📅 Preview da mensagem
- 📅 Histórico de agendamentos
- 📅 Cancelar/Editar agendamentos

**Calendário:**
```
        Março 2025
  D  S  T  Q  Q  S  S
              1  2  3
  4  5  6  7  8  9 10
 11 12 13 14 15 16 17
 18 19(20)21 22 23 24
 25 26 27 28 29 30 31

(20) = Dia com agendamento
```

**Componentes:**
- `ScheduleModal`
- `SchedulesForm`
- `Calendar` (react-big-calendar)

**Permissões:** Plano com `useSchedules = true`

---

### 17. Tags (`/tags`)

**Localização:** `/src/pages/Tags/index.js`

**Descrição:** Gerenciamento de tags/etiquetas.

**Funcionalidades:**
- 🏷️ Criar/Editar/Deletar tags
- 🏷️ Escolher cor
- 🏷️ Definir se aparece no Kanban
- 🏷️ Associar a contatos
- 🏷️ Filtrar por tags

**Exemplo de tag:**
```
Nome: VIP
Cor: #FF5722
Kanban: Sim
```

**Uso:** Organização e segmentação de contatos/tickets

**Componentes:**
- `TagModal`
- `ColorPicker`

**Permissões:** Usuário autenticado

---

### 18. Chat (`/chats/:id?`)

**Localização:** `/src/pages/Chat/index.js`

**Descrição:** Chat interno entre atendentes.

**Funcionalidades:**
- 💬 Conversas privadas entre usuários
- 💬 Criação de grupos
- 💬 Mensagens em tempo real
- 💬 Notificações de não lidas
- 💬 Histórico de mensagens
- 💬 Busca de conversas

**Layout:**
```
┌──────────────┬─────────────────────────────────┐
│              │                                 │
│  João Silva  │  Chat com João Silva           │
│  Maria (3)   │                                 │
│  Pedro       │  Mensagem 1                     │
│  Grupo TI    │  Mensagem 2                     │
│              │  Mensagem 3                     │
│              │                                 │
│              │  [Input de mensagem]            │
└──────────────┴─────────────────────────────────┘
```

**Componentes:**
- `ChatList`
- `ChatMessages`
- `ChatInput`

**Sincronização:** Socket.IO event `company-{id}-chat`

**Permissões:** Plano com `useInternalChat = true`

**Veja também:** [CHAT-INTERNO.md](./CHAT-INTERNO.md)

---

## Páginas de Administração

### 19. Campaigns (`/campaigns`)

**Localização:** `/src/pages/Campaigns/index.js`

**Descrição:** Listagem de campanhas de envio em massa.

**Funcionalidades:**
- 📢 Criar nova campanha
- 📢 Editar campanha
- 📢 Agendar envio
- 📢 Pausar/Continuar/Cancelar
- 📢 Visualizar relatório

**Status de campanha:**
- ⏸️ Rascunho
- ⏳ Agendada
- ▶️ Em andamento
- ✅ Concluída
- ❌ Cancelada

**Tabela:**
| Nome | Status | Enviadas | Entregues | Lidas | Ações |
|------|--------|----------|-----------|-------|-------|
| Promoção Black Friday | ▶️ | 150/500 | 140 | 120 | ⏸️ 📊 |
| Feliz Natal | ✅ | 1000/1000 | 980 | 850 | 📊 |

**Permissões:** Plano com `useCampaigns = true`

**Veja também:** [CAMPAIGNS.md](./CAMPAIGNS.md)

---

### 20. CampaignReport (`/campaign/:campaignId/report`)

**Localização:** `/src/pages/CampaignReport/index.js`

**Descrição:** Relatório detalhado de uma campanha.

**Funcionalidades:**
- 📊 Estatísticas completas
- 📊 Gráficos de envio
- 📊 Lista de destinatários
- 📊 Status individual
- 📊 Exportar para Excel

**Métricas:**
```
Total: 1000
Enviadas: 1000 (100%)
Entregues: 980 (98%)
Lidas: 850 (85%)
Respondidas: 150 (15%)
Erro: 20 (2%)
```

**Permissões:** Admin

---

### 21. ContactLists (`/contact-lists`)

**Localização:** `/src/pages/ContactLists/index.js`

**Descrição:** Gerenciamento de listas de contatos para campanhas.

**Funcionalidades:**
- 📋 Criar/Editar/Deletar listas
- 📋 Importar contatos para lista
- 📋 Exportar lista
- 📋 Visualizar total de contatos

**Exemplo:**
```
Nome: Clientes VIP
Contatos: 250
Criada em: 01/01/2025
Última atualização: 10/03/2025
```

**Permissões:** Admin

---

### 22. ContactListItems (`/contact-lists/:contactListId/contacts`)

**Localização:** `/src/pages/ContactListItems/index.js`

**Descrição:** Contatos de uma lista específica.

**Funcionalidades:**
- 👥 Visualizar contatos da lista
- 👥 Adicionar/Remover contatos
- 👥 Buscar contatos
- 👥 Importar CSV

**Permissões:** Admin

---

### 23. CampaignsConfig (`/campaigns-config`)

**Localização:** `/src/pages/CampaignsConfig/index.js`

**Descrição:** Configurações globais de campanhas.

**Funcionalidades:**
- ⚙️ Intervalo entre envios
- ⚙️ Limite diário
- ⚙️ Horário permitido
- ⚙️ Mensagem padrão
- ⚙️ Configurar variáveis

**Exemplo de configuração:**
```
Intervalo: 5 segundos
Limite diário: 1000 mensagens
Horário: 08:00 - 20:00
Dias: Segunda a Sexta
```

**Permissões:** Admin

---

### 24. CampaignsPhrase (`/phrase-lists`)

**Localização:** `/src/pages/CampaignsPhrase/index.js`

**Descrição:** Listas de frases para campanhas variadas.

**Funcionalidades:**
- 📝 Criar lista de frases
- 📝 Variações de mensagem
- 📝 Randomização no envio
- 📝 Evitar spam

**Uso:**
- Sistema escolhe aleatoriamente uma frase da lista
- Reduz detecção de spam

**Exemplo:**
```
Lista: Saudações
Frases:
- Olá! Como posso ajudar?
- Oi! Tudo bem?
- Olá! Em que posso ser útil?
```

**Permissões:** Admin

---

### 25. FlowBuilder (`/flowbuilders`)

**Localização:** `/src/pages/FlowBuilder/index.js`

**Descrição:** Listagem de fluxos de conversa.

**Funcionalidades:**
- 🔄 Listar todos os flows
- 🔄 Criar novo flow
- 🔄 Editar flow existente
- 🔄 Duplicar flow
- 🔄 Deletar flow
- 🔄 Ativar/Desativar

**Tipos de flow:**
- 💬 Conversacional (chatbot)
- 📢 Campanha

**Tabela:**
| Nome | Tipo | Status | Última edição | Ações |
|------|------|--------|---------------|-------|
| Atendimento inicial | 💬 | Ativo | 10/03/2025 | ✏️ 📋 🗑️ |
| Pesquisa NPS | 📢 | Inativo | 05/03/2025 | ✏️ 📋 🗑️ |

**Permissões:** Admin

**Veja também:** [FLOWBUILDER.md](./FLOWBUILDER.md)

---

### 26. FlowBuilderConfig (`/flowbuilder/:id?`)

**Localização:** `/src/pages/FlowBuilderConfig/index.js`

**Descrição:** Editor visual de fluxos (Flow Builder).

**Funcionalidades:**
- 🎨 Editor de nós drag & drop
- 🎨 Múltiplos tipos de nós:
  - 💬 Texto
  - 🖼️ Imagem
  - 🎥 Vídeo
  - 🔊 Áudio
  - ❓ Pergunta (captura resposta)
  - 🔀 Condicional
  - 🎲 Randomizador
  - 🎫 Criar ticket
  - 🤖 OpenAI
  - 🤖 Typebot
  - ⏱️ Intervalo (delay)
  - 📋 Menu de opções
- 🎨 Conexões entre nós
- 🎨 Validações
- 🎨 Preview do fluxo
- 🎨 Exportar/Importar JSON

**Layout do editor:**
```
┌────────────────────────────────────────────────┐
│  Toolbar: [Salvar] [Testar] [Importar] [...]  │
├──────────┬─────────────────────────────────────┤
│  Palette │                                     │
│          │       Canvas (Nodes)                │
│  □ Texto │                                     │
│  □ Img   │    ┌─────┐                          │
│  □ Áudio │    │Start│                          │
│  □ Quest │    └──┬──┘                          │
│  □ Cond  │       │                             │
│  □ Rand  │       ▼                             │
│  □ OpenAI│    ┌─────────┐                      │
│  ...     │    │ Mensagem│                      │
│          │    └────┬────┘                      │
│          │         │                           │
│          │         ▼                           │
│          │      ┌─────┐                        │
│          │      │ Fim │                        │
│          │      └─────┘                        │
└──────────┴─────────────────────────────────────┘
```

**Bibliotecas:**
- `reactflow` para o canvas
- `zustand` para state management

**Permissões:** Admin

**Veja também:** [FLOWBUILDER.md](./FLOWBUILDER.md)

---

### 27. FlowDefault (`/flowbuilders/default`)

**Localização:** `/src/pages/FlowDefault/index.js`

**Descrição:** Flow padrão do sistema.

**Funcionalidades:**
- 🔄 Configurar flow inicial
- 🔄 Aplicar a todas as conexões

**Permissões:** Super admin

---

### 28. Annoucements (`/announcements`)

**Localização:** `/src/pages/Annoucements/index.js`

**Descrição:** Gerenciamento de informativos para usuários.

**Funcionalidades:**
- 📢 Criar/Editar/Deletar informativos
- 📢 Título, corpo, prioridade
- 📢 Publicar/Despublicar
- 📢 Visualização no popup

**Tipos de prioridade:**
- 🔴 Alta
- 🟡 Média
- 🟢 Baixa

**Uso:** Comunicação com todos os usuários do sistema

**Permissões:** Super admin

---

### 29. MessagesAPI (`/messages-api`)

**Localização:** `/src/pages/MessagesAPI/index.js`

**Descrição:** Documentação e testes da API de mensagens.

**Funcionalidades:**
- 📖 Documentação de endpoints
- 📖 Geração de API token
- 📖 Exemplos de requisições
- 📖 Testar endpoints
- 📖 Webhooks

**Endpoints documentados:**
```
POST /api/messages/send
GET /api/messages/{id}
POST /api/messages/text
POST /api/messages/media
...
```

**Exemplo de curl:**
```bash
curl -X POST https://api.chatia.com/messages/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "number": "5511999999999",
    "body": "Olá!"
  }'
```

**Permissões:** Plano com `useExternalApi = true`

---

### 30. Helps (`/helps`)

**Localização:** `/src/pages/Helps/index.js`

**Descrição:** Central de ajuda/documentação interna.

**Funcionalidades:**
- ❓ Artigos de ajuda
- ❓ Tutoriais
- ❓ FAQs
- ❓ Vídeos
- ❓ Busca de conteúdo

**Categorias:**
- Primeiros passos
- Atendimento
- Campanhas
- Integrações
- Troubleshooting

**Permissões:** Usuário autenticado (se houver conteúdo)

---

### 31. Users (`/users`)

**Localização:** `/src/pages/Users/index.js`

**Descrição:** Gerenciamento de usuários da empresa.

**Funcionalidades:**
- 👤 Criar/Editar/Deletar usuários
- 👤 Definir perfil (admin/user)
- 👤 Associar filas
- 👤 Associar conexões (WhatsApps)
- 👤 Permissões especiais
- 👤 Definir senha
- 👤 Ativar/Desativar

**Tabela:**
| Nome | Email | Perfil | Status | Filas | Ações |
|------|-------|--------|--------|-------|-------|
| João Admin | joao@empresa.com | Admin | Ativo | Todas | ✏️ 🗑️ |
| Maria User | maria@empresa.com | User | Ativo | Suporte | ✏️ 🗑️ |

**Perfis:**
- 👑 **Admin**: Acesso total
- 👤 **User**: Acesso limitado

**Permissões especiais (para User):**
- `showDashboard`: Ver dashboard
- `allowRealTime`: Ver painel real-time
- `allowConnections`: Gerenciar conexões

**Componentes:**
- `UserModal`
- `QueueSelect`

**Permissões:** Admin

---

### 32. Queues (`/queues`)

**Localização:** `/src/pages/Queues/index.js`

**Descrição:** Gerenciamento de filas de atendimento.

**Funcionalidades:**
- 🔀 Criar/Editar/Deletar filas
- 🔀 Definir nome e cor
- 🔀 Saudação inicial
- 🔀 Mensagem fora de horário
- 🔀 Horários de funcionamento
- 🔀 Chatbot (opções de menu)
- 🔀 Ordenação

**Exemplo de fila:**
```
Nome: Suporte Técnico
Cor: #2196F3
Saudação: Olá! Seja bem-vindo ao suporte técnico.
Fora de horário: Estamos fechados. Horário: 8h-18h.

Horários:
Segunda a Sexta: 08:00 - 18:00
Sábado: 09:00 - 13:00
Domingo: Fechado

Opções de Chatbot:
1 - Problema com internet
2 - Problema com TV
3 - Falar com atendente
```

**Componentes:**
- `QueueModal`
- `ColorPicker`
- `SchedulesForm`
- `ChatBots`

**Permissões:** Admin

---

### 33. Prompts (`/prompts`)

**Localização:** `/src/pages/Prompts/index.js`

**Descrição:** Gerenciamento de prompts para OpenAI.

**Funcionalidades:**
- 🤖 Criar/Editar/Deletar prompts
- 🤖 Definir prompt system
- 🤖 Definir temperatura
- 🤖 Definir max tokens
- 🤖 Associar a filas
- 🤖 Testar prompt

**Exemplo:**
```
Nome: Atendente Educado
Fila: Suporte

Prompt System:
Você é um atendente educado e prestativo.
Sempre inicie com saudação e seja cordial.
Responda de forma clara e objetiva.

Temperatura: 0.7
Max Tokens: 150
```

**Permissões:** Plano com `useOpenAi = true`

---

### 34. QueueIntegration (`/queue-integration`)

**Localização:** `/src/pages/QueueIntegration/index.js`

**Descrição:** Integrações de filas com serviços externos.

**Funcionalidades:**
- 🔌 Integrar fila com:
  - Dialogflow
  - OpenAI
  - N8N (webhook)
  - Typebot
- 🔌 Configurar credenciais
- 🔌 Testar conexão
- 🔌 Logs de integração

**Tipos de integração:**

**1. Dialogflow:**
```
Project ID: my-project-123
JSON Key: {arquivo JSON}
Language: pt-BR
```

**2. OpenAI:**
```
API Key: sk-...
Prompt ID: #5
Max tokens: 150
```

**3. N8N:**
```
Webhook URL: https://n8n.empresa.com/webhook/...
Headers: (opcional)
```

**4. Typebot:**
```
Typebot URL: https://typebot.io/...
Typebot ID: abc123
```

**Componentes:**
- `QueueIntegrationModal`
- `DialogflowConfig`
- `OpenAIConfig`
- `N8NConfig`
- `TypebotConfig`

**Permissões:** Plano com `useIntegrations = true`

**Veja também:** [INTEGRATIONS.md](./INTEGRATIONS.md)

---

### 35. Connections (`/connections`)

**Localização:** `/src/pages/Connections/index.js`

**Descrição:** Gerenciamento de conexões WhatsApp da empresa.

**Funcionalidades:**
- 📱 Adicionar nova conexão
- 📱 Escanear QR Code
- 📱 Status da conexão
- 📱 Desconectar/Reconectar
- 📱 Deletar conexão
- 📱 Definir como padrão
- 📱 Associar a filas

**Status possíveis:**
- 🟢 **CONNECTED**: Conectado
- 🟡 **qrcode**: Aguardando QR Code
- 🟡 **PAIRING**: Pareando
- 🔴 **DISCONNECTED**: Desconectado
- 🔴 **TIMEOUT**: Timeout
- 🟠 **OPENING**: Abrindo conexão

**Card de conexão:**
```
┌────────────────────────────┐
│ 🟢 Atendimento Principal   │
│                            │
│ WhatsApp: +55 11 99999-9999│
│ Status: Conectado          │
│ Fila: Suporte              │
│                            │
│ [QR Code] [Desconectar] [⚙️]│
└────────────────────────────┘
```

**Componentes:**
- `WhatsAppModal`
- `QrcodeModal`
- `ConnectionIcon`

**Permissões:** Admin ou User com `allowConnections = "enabled"`

---

### 36. AllConnections (`/allConnections`)

**Localização:** `/src/pages/AllConnections/index.js`

**Descrição:** Visualização de todas as conexões do sistema (todas as empresas).

**Funcionalidades:**
- 📱 Listar todas as conexões
- 📱 Filtrar por empresa
- 📱 Gerenciar remotamente
- 📱 Estatísticas globais

**Uso:** Monitoramento por super admin

**Permissões:** Super admin

---

### 37. Files (`/files`)

**Localização:** `/src/pages/Files/index.js`

**Descrição:** Gerenciamento de arquivos enviados/recebidos.

**Funcionalidades:**
- 📁 Listar todos os arquivos
- 📁 Filtrar por tipo (imagem, vídeo, documento, áudio)
- 📁 Buscar por nome
- 📁 Download
- 📁 Deletar arquivos antigos
- 📁 Estatísticas de uso

**Filtros:**
- 🖼️ Imagens
- 🎥 Vídeos
- 📄 Documentos
- 🔊 Áudios

**Tabela:**
| Thumbnail | Nome | Tipo | Tamanho | Data | Ações |
|-----------|------|------|---------|------|-------|
| 🖼️ | foto.jpg | Imagem | 1.2 MB | 10/03 | 📥 🗑️ |
| 📄 | contrato.pdf | Doc | 500 KB | 09/03 | 📥 🗑️ |

**Permissões:** Admin

---

### 38. ToDoList (`/todolist`)

**Localização:** `/src/pages/ToDoList/index.js`

**Descrição:** Lista de tarefas pessoal do atendente.

**Funcionalidades:**
- ✅ Criar tarefas
- ✅ Marcar como concluída
- ✅ Editar/Deletar
- ✅ Prioridade
- ✅ Data de vencimento
- ✅ Filtros

**Status:**
- ⏳ Pendente
- ✅ Concluída
- ⏰ Atrasada

**Layout:**
```
┌──────────────────────────────────────┐
│ ✅ Minhas Tarefas                    │
├──────────────────────────────────────┤
│ [ ] Ligar para cliente João (Alta)  │
│ [✓] Enviar proposta Maria            │
│ [ ] Revisar contrato - ATRASADA ⏰   │
│                                      │
│ [+ Adicionar nova tarefa]            │
└──────────────────────────────────────┘
```

**Permissões:** Usuário autenticado

---

### 39. Financeiro (`/financeiro`)

**Localização:** `/src/pages/Financeiro/index.js`

**Descrição:** Gestão financeira e assinaturas.

**Funcionalidades:**
- 💰 Visualizar plano atual
- 💰 Histórico de faturas
- 💰 Métodos de pagamento
- 💰 Upgrade/Downgrade de plano
- 💰 Dados de cobrança

**Informações exibidas:**
```
Plano Atual: Premium
Valor: R$ 297,00/mês
Vencimento: 15/04/2025
Status: Ativo ✅

Próxima cobrança: R$ 297,00 em 15/04/2025
```

**Faturas:**
| Período | Valor | Status | Ações |
|---------|-------|--------|-------|
| 03/2025 | R$ 297 | Pago ✅ | 📥 PDF |
| 02/2025 | R$ 297 | Pago ✅ | 📥 PDF |
| 01/2025 | R$ 297 | Pago ✅ | 📥 PDF |

**Componentes:**
- `SubscriptionModal`
- `CheckoutPage`
- `PlansManager`

**Permissões:** Admin

**Veja também:** [FINANCEIRO.md](./FINANCEIRO.md)

---

### 40. Subscription (`/subscription`)

**Localização:** `/src/pages/Subscription/index.js`

**Descrição:** Página de contratação/upgrade de plano.

**Funcionalidades:**
- 💳 Escolher plano
- 💳 Inserir dados de pagamento
- 💳 Finalizar assinatura
- 💳 Cupom de desconto

**Planos disponíveis:**
```
┌─────────────┬─────────────┬─────────────┐
│   Básico    │   Premium   │  Enterprise │
│             │             │             │
│  R$ 97/mês  │ R$ 297/mês  │ R$ 997/mês  │
│             │             │             │
│ • 2 users   │ • 10 users  │ • Ilimitado │
│ • 1 conexão │ • 5 conexões│ • Ilimitado │
│ • Suporte   │ • Campanhas │ • Tudo      │
│             │ • Integração│ • Suporte   │
│             │             │   Premium   │
│             │             │             │
│ [Assinar]   │ [Assinar]   │ [Assinar]   │
└─────────────┴─────────────┴─────────────┘
```

**Componentes:**
- `CheckoutPage`
- Integração com gateway de pagamento

**Permissões:** Admin

---

### 41. Companies (`/companies`)

**Localização:** `/src/pages/Companies/index.js`

**Descrição:** Gerenciamento de empresas (super admin).

**Funcionalidades:**
- 🏢 Listar todas as empresas
- 🏢 Criar nova empresa
- 🏢 Editar empresa
- 🏢 Desativar empresa
- 🏢 Definir plano
- 🏢 Definir data de vencimento
- 🏢 Visualizar uso

**Tabela:**
| Empresa | Plano | Vencimento | Status | Ações |
|---------|-------|------------|--------|-------|
| Empresa A | Premium | 15/04/25 | Ativo ✅ | ✏️ 🗑️ |
| Empresa B | Básico | 20/03/25 | Vencido ❌ | ✏️ 🗑️ |

**Componentes:**
- `CompaniesModal`
- `CompaniesManager`

**Permissões:** Super admin

---

### 42. SettingsCustom (`/settings`)

**Localização:** `/src/pages/SettingsCustom/index.js`

**Descrição:** Configurações gerais do sistema.

**Funcionalidades:**
- ⚙️ Configurações da empresa
- ⚙️ Whitelabel (cores, logos)
- ⚙️ Timezone
- ⚙️ Horários
- ⚙️ Notificações
- ⚙️ Integrações gerais
- ⚙️ API externa

**Abas:**
1. **Geral**
   - Nome da empresa
   - Timezone
   - Idioma padrão

2. **Whitelabel**
   - Logo (claro/escuro)
   - Cores primárias
   - Favicon
   - Nome do sistema

3. **Notificações**
   - Som de notificação
   - Volume
   - Notificações push

4. **Integrações**
   - Facebook App ID
   - Asaas token
   - Bling token
   - Outros tokens

5. **Avançado**
   - API token
   - Webhooks
   - SMTP

**Componentes:**
- `Settings/Options`
- `Settings/Whitelabel`
- `Settings/TimezoneTab`
- `ColorPicker`
- `AvatarUpload`

**Permissões:** Admin

**Veja também:** [WHITELABEL.md](./WHITELABEL.md)

---

### 43. Settings (Legado) (`/settings-old`)

**Localização:** `/src/pages/Settings/index.js`

**Descrição:** Página de configurações legada (não mais utilizada).

**Status:** Deprecated

---

## Tabela Completa de Páginas

| # | Página | Rota | Permissão | Categoria |
|---|--------|------|-----------|-----------|
| 1 | Login | `/login` | Pública | 🔓 Pública |
| 2 | Signup | `/signup` | Pública | 🔓 Pública |
| 3 | ForgotPassword | `/forgot-password` | Pública | 🔓 Pública |
| 4 | ResetPassword | `/reset-password` | Pública | 🔓 Pública |
| 5 | Dashboard | `/` | Admin/User* | 📊 Gerência |
| 6 | Reports | `/reports` | Admin | 📊 Gerência |
| 7 | Moments | `/moments` | Admin/User* | 📊 Gerência |
| 8 | TicketResponsiveContainer | `/tickets/:id?` | Autenticado | 💬 Principal |
| 9 | Tickets | `/tickets` | Autenticado | 💬 Principal |
| 10 | TicketsAdvanced | `/tickets-advanced` | Autenticado | 💬 Principal |
| 11 | TicketsCustom | `/tickets-custom` | Autenticado | 💬 Principal |
| 12 | Contacts | `/contacts` | Autenticado | 💬 Principal |
| 13 | Contacts Import | `/contacts/import` | Admin | 💬 Principal |
| 14 | QuickMessages | `/quick-messages` | Autenticado | 💬 Principal |
| 15 | Kanban | `/kanban` | Plano* | 💬 Principal |
| 16 | TagsKanban | `/TagsKanban` | Plano* | 💬 Principal |
| 17 | Schedules | `/schedules` | Plano* | 💬 Principal |
| 18 | Tags | `/tags` | Autenticado | 💬 Principal |
| 19 | Chat | `/chats/:id?` | Plano* | 💬 Principal |
| 20 | ToDoList | `/todolist` | Autenticado | 💬 Principal |
| 21 | Campaigns | `/campaigns` | Plano* | ⚙️ Admin |
| 22 | CampaignReport | `/campaign/:id/report` | Admin | ⚙️ Admin |
| 23 | ContactLists | `/contact-lists` | Admin | ⚙️ Admin |
| 24 | ContactListItems | `/contact-lists/:id/contacts` | Admin | ⚙️ Admin |
| 25 | CampaignsConfig | `/campaigns-config` | Admin | ⚙️ Admin |
| 26 | CampaignsPhrase | `/phrase-lists` | Admin | ⚙️ Admin |
| 27 | FlowBuilder | `/flowbuilders` | Admin | ⚙️ Admin |
| 28 | FlowBuilderConfig | `/flowbuilder/:id?` | Admin | ⚙️ Admin |
| 29 | FlowDefault | `/flowbuilders/default` | Super | ⚙️ Admin |
| 30 | Annoucements | `/announcements` | Super | ⚙️ Admin |
| 31 | MessagesAPI | `/messages-api` | Plano* | ⚙️ Admin |
| 32 | Helps | `/helps` | Autenticado | ⚙️ Admin |
| 33 | Users | `/users` | Admin | ⚙️ Admin |
| 34 | Queues | `/queues` | Admin | ⚙️ Admin |
| 35 | Prompts | `/prompts` | Plano* | ⚙️ Admin |
| 36 | QueueIntegration | `/queue-integration` | Plano* | ⚙️ Admin |
| 37 | Connections | `/connections` | Admin/User* | ⚙️ Admin |
| 38 | AllConnections | `/allConnections` | Super | ⚙️ Admin |
| 39 | Files | `/files` | Admin | ⚙️ Admin |
| 40 | Financeiro | `/financeiro` | Admin | ⚙️ Admin |
| 41 | Subscription | `/subscription` | Admin | ⚙️ Admin |
| 42 | Companies | `/companies` | Super | ⚙️ Admin |
| 43 | SettingsCustom | `/settings` | Admin | ⚙️ Admin |

**Legenda:**
- `*` = Permissão condicional (ver detalhes na página)
- `Plano*` = Depende do plano contratado
- `User*` = User com permissão especial

---

## Fluxo de Navegação

### Menu Hierárquico

```
📊 Gerência
├── Dashboard
├── Relatórios
└── Painel em Tempo Real

💬 Principais
├── Atendimentos
├── Respostas Rápidas
├── Kanban
├── Contatos
├── Agendamentos
├── Tags
├── Chat Interno
├── Tarefas
└── Ajuda

⚙️ Administração
├── 📢 Campanhas
│   ├── Listagem
│   ├── Listas de Contatos
│   └── Configurações
├── 🔄 Flowbuilder
│   ├── Fluxos de Campanha
│   └── Fluxos Conversacionais
├── Informativos
├── API
├── Usuários
├── Filas & Chatbot
├── Prompts (OpenAI)
├── Integrações
├── Conexões
├── Gerenciar Conexões
├── Arquivos
├── Financeiro
├── Configurações
└── Empresas (Super Admin)
```

---

## Diagrama de Permissões

```
┌────────────────────────────────────────────────┐
│               Super Admin                      │
│  (Acesso total + gerenciar todas empresas)    │
└───────────────┬────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────┐
│                Admin                           │
│     (Acesso total dentro da empresa)          │
└───────────────┬────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────┐
│               User                             │
│  (Acesso limitado + permissões especiais)     │
│                                                │
│  Permissões especiais:                         │
│  - showDashboard: Ver dashboard               │
│  - allowRealTime: Ver painel real-time        │
│  - allowConnections: Gerenciar conexões       │
└────────────────────────────────────────────────┘
```

---

## Boas Práticas

### 1. Criar Nova Página

```jsx
// /src/pages/MinhaPagina/index.js
import React, { useState, useEffect } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";

const MinhaPagina = () => {
  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("minhaPagina.title")}</Title>
      </MainHeader>

      {/* Conteúdo */}
    </MainContainer>
  );
};

export default MinhaPagina;
```

### 2. Adicionar Rota

```javascript
// /src/routes/index.js
import MinhaPagina from "../pages/MinhaPagina";

// Dentro do Switch:
<Route exact path="/minha-pagina" component={MinhaPagina} isPrivate />
```

### 3. Adicionar no Menu

```javascript
// /src/layout/MainListItems.js
<ListItemLink
  to="/minha-pagina"
  primary={i18n.t("mainDrawer.listItems.minhaPagina")}
  icon={<MyIcon />}
  iconKey="minhaPagina"
  collapsed={collapsed}
/>
```

### 4. Adicionar Tradução

```javascript
// /src/translate/languages/pt.js
minhaPagina: {
  title: "Minha Página",
  // ...
}
```

---

## Veja Também

- [COMPONENTS.md](./COMPONENTS.md) - Componentes reutilizáveis
- [ROUTING.md](./ROUTING.md) - Sistema de rotas
- [PERMISSIONS.md](./PERMISSIONS.md) - Sistema RBAC
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento

---

**Total de Páginas:** 43
**Última Atualização:** 2025-10-12
**Versão do Documento:** 1.0.0
