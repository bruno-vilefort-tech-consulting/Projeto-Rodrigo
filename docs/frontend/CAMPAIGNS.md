# 📢 Sistema de Campanhas - ChatIA Flow

> Envio em massa de mensagens via WhatsApp com agendamento e métricas

**Localização:** `/frontend/src/pages/Campaigns*`
**Versão do Sistema:** 2.2.2v-26

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Funcionalidades](#funcionalidades)
4. [Interface](#interface)
5. [Fluxo de Campanha](#fluxo-de-campanha)
6. [Status de Campanhas](#status-de-campanhas)
7. [Relatórios](#relatórios)
8. [Exemplos Práticos](#exemplos-práticos)
9. [API](#api)

---

## 🎯 Visão Geral

### O que são Campanhas?

**Campanhas** são envios em massa de mensagens via WhatsApp para listas de contatos, com agendamento, rotação de mensagens e acompanhamento de métricas em tempo real.

### Características Principais

✅ **Envio em Massa** - Milhares de mensagens automaticamente
✅ **Agendamento** - Programe data/hora do envio
✅ **Listas de Contatos** - Organize destinatários em listas
✅ **Tags** - Envie para contatos com tags específicas
✅ **5 Mensagens Rotativas** - Evita bloqueio do WhatsApp
✅ **Anexo de Mídia** - Imagens, vídeos, documentos
✅ **Confirmação de Leitura** - Solicite resposta dos destinatários
✅ **Pausar/Retomar** - Controle total da campanha
✅ **Relatório em Tempo Real** - Acompanhe entregas
✅ **Criar Tickets** - Abra atendimento após envio
✅ **Multi-WhatsApp** - Selecione conexão específica

### Casos de Uso

- 📣 **Comunicados** - Avisos importantes para todos clientes
- 🎉 **Promoções** - Ofertas e descontos em datas especiais
- 📊 **Pesquisas de Satisfação** - NPS e feedback
- 🔔 **Lembretes** - Pagamentos, agendamentos, renovações
- 🎯 **Marketing** - Divulgação de produtos/serviços
- 📅 **Eventos** - Convites e confirmações de presença

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 17.0.2 | Framework UI |
| **Material-UI** | v4 | Componentes UI |
| **Formik** | 2.2.0 | Gerenciamento de formulários |
| **Yup** | 0.32.8 | Validação |
| **Moment.js** | 2.29.4 | Manipulação de datas |
| **Socket.IO** | 4.7.4 | Atualizações em tempo real |
| **Axios** | 1.6.8 | Requisições HTTP |

### Estrutura de Arquivos

```
frontend/src/
├── pages/
│   ├── Campaigns/
│   │   └── index.js                 # Lista de campanhas
│   ├── CampaignReport/
│   │   └── index.js                 # Relatório detalhado
│   └── CampaignsConfig/
│       └── index.js                  # Configurações globais
│
├── components/
│   ├── CampaignModal/
│   │   └── index.js                 # Modal criar/editar campanha
│   └── CampaignModalPhrase/
│       └── index.js                  # Modal de frases (deprecated)
│
└── hooks/
    └── usePlans/
        └── index.js                  # Verificar permissão de plano
```

### Rotas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/campaigns` | `Campaigns` | Lista de campanhas |
| `/campaign/:campaignId/report` | `CampaignReport` | Relatório da campanha |
| `/campaigns-config` | `CampaignsConfig` | Configurações globais |

**Acesso Condicional:**

Campanhas só aparecem no menu se:
```javascript
localStorage.setItem("cshow", "true");
```

E se o plano da empresa permitir:
```javascript
const planConfigs = await getPlanCompany(companyId);
if (!planConfigs.plan.useCampaigns) {
  toast.error("Seu plano não inclui campanhas");
  history.push("/");
}
```

---

## ⚙️ Funcionalidades

### 1. Criar Campanha

**Modal:** `CampaignModal`

**Campos Obrigatórios:**
- ✅ Nome da campanha
- ✅ Conexão WhatsApp
- ✅ Lista de contatos OU Tag
- ✅ Pelo menos 1 mensagem

**Campos Opcionais:**
- Data/hora de agendamento
- Confirmação de leitura
- Mídia (imagem, vídeo, documento)
- Usuário e Fila (criar tickets)
- Status do ticket (aberto, pendente, fechado)

**Código:**
```javascript
const initialState = {
  name: "",
  message1: "",
  message2: "",
  message3: "",
  message4: "",
  message5: "",
  confirmationMessage1: "",
  confirmationMessage2: "",
  confirmationMessage3: "",
  confirmationMessage4: "",
  confirmationMessage5: "",
  status: "INATIVA",
  confirmation: false,
  scheduledAt: "",
  whatsappId: "",
  contactListId: "",
  tagListId: null,
  statusTicket: "closed",
  openTicket: "disabled",
  userId: null,
  queueId: null
};
```

---

### 2. Mensagens Rotativas (1-5)

**Por que rotacionar mensagens?**

O WhatsApp detecta envios em massa idênticos e pode **bloquear a conta**. Para evitar:

- Configure até **5 mensagens diferentes**
- Sistema **rotaciona aleatoriamente** entre elas
- Cada contato recebe uma mensagem diferente
- Aparenta ser envio manual

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ Mensagens da Campanha                                   │
├─────────────────────────────────────────────────────────┤
│ [Msg 1] [Msg 2] [Msg 3] [Msg 4] [Msg 5] ← Tabs         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Olá {nome}!                                        │ │
│  │                                                    │ │
│  │ Temos uma promoção especial para você! 🎉         │ │
│  │                                                    │ │
│  │ Acesse: www.exemplo.com/promo                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Variáveis disponíveis: {nome}, {telefone}, {email}    │
└─────────────────────────────────────────────────────────┘
```

**Código:**
```javascript
<Tabs
  value={messageTab}
  onChange={(e, v) => setMessageTab(v)}
>
  <Tab label="Mensagem 1" />
  <Tab label="Mensagem 2" />
  <Tab label="Mensagem 3" />
  <Tab label="Mensagem 4" />
  <Tab label="Mensagem 5" />
</Tabs>

{messageTab === 0 && renderMessageField("message1")}
{messageTab === 1 && renderMessageField("message2")}
// ...
```

**Variáveis Dinâmicas:**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{nome}` | Nome do contato | João Silva |
| `{telefone}` | Telefone | (11) 99999-9999 |
| `{email}` | Email | joao@email.com |
| `{protocolo}` | Número do ticket | #001234 |

---

### 3. Confirmação de Leitura

**O que é?**

Solicita que o destinatário **confirme** o recebimento da mensagem respondendo.

**Como funciona:**

1. Envia mensagem principal
2. Aguarda resposta do contato
3. Se responder: Envia mensagem de confirmação
4. Métricas registram quem confirmou

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ Confirmação: [X] Ativada                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────┬────────────────────────────────┐│
│ │ Mensagem Principal  │ Mensagem de Confirmação       ││
│ ├─────────────────────┼────────────────────────────────┤│
│ │ Olá {nome}!         │ Obrigado por confirmar!       ││
│ │                     │                                ││
│ │ Recebeu este aviso? │ Seu registro foi atualizado.  ││
│ │                     │                                ││
│ │ Responda SIM para   │ Até breve!                    ││
│ │ confirmar.          │                                ││
│ └─────────────────────┴────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Fluxo:**
```
Bot: "Recebeu este aviso? Responda SIM para confirmar."
  ↓
User: "SIM"
  ↓
Bot: "Obrigado por confirmar! Seu registro foi atualizado."
  ↓
✅ Métricas: +1 confirmação
```

**Código:**
```javascript
<FormControl>
  <InputLabel>Confirmação</InputLabel>
  <Select name="confirmation">
    <MenuItem value={false}>Desativada</MenuItem>
    <MenuItem value={true}>Ativada</MenuItem>
  </Select>
</FormControl>

{values.confirmation && (
  <Grid container spacing={2}>
    <Grid item xs={8}>
      {renderMessageField("message1")}
    </Grid>
    <Grid item xs={4}>
      {renderConfirmationMessageField("confirmationMessage1")}
    </Grid>
  </Grid>
)}
```

---

### 4. Anexar Mídia

**Tipos suportados:**
- 📷 Imagens: JPG, PNG, GIF, WEBP
- 🎥 Vídeos: MP4, AVI, MOV
- 📄 Documentos: PDF, DOCX, XLSX
- 🎵 Áudios: MP3, OGG, M4A

**Limites:**
- Imagem: até 5 MB
- Vídeo: até 16 MB
- Documento: até 100 MB
- Áudio: até 16 MB

**Upload:**
```javascript
const handleAttachmentFile = (e) => {
  const file = e.target.files[0];
  if (file) {
    setAttachment(file);
  }
};

const handleSaveCampaign = async (values) => {
  // Salvar campanha
  const { data } = await api.post("/campaigns", values);

  // Upload de mídia
  if (attachment) {
    const formData = new FormData();
    formData.append("file", attachment);
    await api.post(`/campaigns/${data.id}/media-upload`, formData);
  }
};
```

**Preview:**
```
┌──────────────────────────────────────┐
│ [📎] promocao.jpg (2.5 MB)  [🗑️]    │
└──────────────────────────────────────┘
```

---

### 5. Agendar Envio

**Tipos de Envio:**

| Tipo | scheduledAt | Comportamento |
|------|-------------|---------------|
| **Imediato** | `null` | Envia ao salvar |
| **Agendado** | Data/hora futura | Envia no horário definido |

**Interface:**
```
┌──────────────────────────────────────┐
│ Agendar para:                        │
│ [____2025-10-15____] [__14:30__]    │
└──────────────────────────────────────┘
```

**Validação:**
```javascript
useEffect(() => {
  const now = moment();
  const scheduledAt = moment(campaign.scheduledAt);
  const moreThanAnHour = scheduledAt.diff(now, "hour") > 1;

  const isEditable =
    campaign.status === "INATIVA" ||
    (campaign.status === "PROGRAMADA" && moreThanAnHour);

  setCampaignEditable(isEditable);
}, [campaign]);
```

**Regra:** Só pode editar se:
- Status = INATIVA, OU
- Status = PROGRAMADA **E** faltam mais de 1 hora

---

### 6. Criar Tickets Automaticamente

**Funcionalidade:** Após enviar mensagem, cria ticket automaticamente.

**Configurações:**
```javascript
{
  openTicket: "enabled",      // "enabled" | "disabled"
  userId: 5,                  // ID do usuário (opcional)
  queueId: 2,                 // ID da fila (obrigatório se userId)
  statusTicket: "pending"     // "open" | "pending" | "closed"
}
```

**Fluxo:**
```
Campanha envia mensagem
  ↓
Backend cria ticket automaticamente
  - Contato: destinatário
  - Fila: queueId
  - Usuário: userId (se definido)
  - Status: statusTicket
  ↓
Atendente recebe notificação
  ↓
Pode responder normalmente
```

**Interface:**
```
┌──────────────────────────────────────────────────────┐
│ Abrir Ticket: [X] Ativado                           │
├──────────────────────────────────────────────────────┤
│ Atendente: [_________________]  (Autocomplete)      │
│                                                      │
│ Fila: [Vendas ▼]                                    │
│                                                      │
│ Status: [● Pendente ▼]                              │
│         [ ] Aberto                                   │
│         [ ] Fechado                                  │
└──────────────────────────────────────────────────────┘
```

**Código:**
```javascript
<FormControl>
  <InputLabel>Abrir Ticket</InputLabel>
  <Select name="openTicket">
    <MenuItem value="enabled">Ativado</MenuItem>
    <MenuItem value="disabled">Desativado</MenuItem>
  </Select>
</FormControl>

{values.openTicket === "enabled" && (
  <>
    <Autocomplete
      options={users}
      value={selectedUser}
      onChange={(e, newValue) => {
        setSelectedUser(newValue);
        if (newValue?.queues?.length === 1) {
          setSelectedQueue(newValue.queues[0].id);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label="Atendente" />
      )}
    />

    <Select value={selectedQueue} label="Fila">
      {queues.map(queue => (
        <MenuItem value={queue.id}>{queue.name}</MenuItem>
      ))}
    </Select>

    <Select name="statusTicket" label="Status">
      <MenuItem value="closed">Fechado</MenuItem>
      <MenuItem value="pending">Pendente</MenuItem>
      <MenuItem value="open">Aberto</MenuItem>
    </Select>
  </>
)}
```

---

### 7. Pausar/Retomar Campanha

**Estados:**

| Botão | Status Atual | Ação | Novo Status |
|-------|-------------|------|-------------|
| ⏸️ Pausar | `EM_ANDAMENTO` | POST `/campaigns/:id/cancel` | `CANCELADA` |
| ▶️ Retomar | `CANCELADA` | POST `/campaigns/:id/restart` | `EM_ANDAMENTO` |

**Código:**
```javascript
const cancelCampaign = async (campaign) => {
  await api.post(`/campaigns/${campaign.id}/cancel`);
  toast.success("Campanha pausada!");
  fetchCampaigns();
};

const restartCampaign = async (campaign) => {
  await api.post(`/campaigns/${campaign.id}/restart`);
  toast.success("Campanha retomada!");
  fetchCampaigns();
};

// Na lista
{campaign.status === "EM_ANDAMENTO" && (
  <IconButton onClick={() => cancelCampaign(campaign)}>
    <PauseCircleOutlineIcon />
  </IconButton>
)}

{campaign.status === "CANCELADA" && (
  <IconButton onClick={() => restartCampaign(campaign)}>
    <PlayCircleOutlineIcon />
  </IconButton>
)}
```

**Importante:**
- Ao pausar, envios param imediatamente
- Ao retomar, continua de onde parou (não reenvia)

---

## 🎨 Interface

### Lista de Campanhas

**Página:** `/campaigns`

```
┌────────────────────────────────────────────────────────────────────┐
│ Campanhas                           [🔍 Buscar] [+ Nova Campanha] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Nome         Status      Lista      WhatsApp  Agendada  Completa  │
├─────────────────────────────────────────────────────────────────────┤
│ Promo Black  EM_ANDAMENTO Clientes  Conexão1  15/10 14h  -        │
│              ████████░░░░ 73%                   [⏸️][📊][✏️][🗑️] │
│                                                                     │
│ NPS 2025     FINALIZADA   Todos     Conexão2  10/10 10h  10/10 18h│
│              ████████████ 100%                  [📊][✏️][🗑️]      │
│                                                                     │
│ Aviso        PROGRAMADA   VIP       Conexão1  20/10 09h  -        │
│              ░░░░░░░░░░░░ 0%                    [✏️][🗑️]          │
└─────────────────────────────────────────────────────────────────────┘
```

**Colunas:**
1. **Nome** - Nome da campanha
2. **Status** - INATIVA, PROGRAMADA, EM_ANDAMENTO, CANCELADA, FINALIZADA
3. **Lista** - Lista de contatos ou Tag
4. **WhatsApp** - Conexão utilizada
5. **Agendada** - Data/hora do envio
6. **Completa** - Data/hora de conclusão
7. **Confirmação** - Ativada/Desativada
8. **Ações** - Pausar, Relatório, Editar, Deletar

**Código:**
```javascript
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Nome</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Lista de Contatos</TableCell>
      <TableCell>WhatsApp</TableCell>
      <TableCell>Agendada</TableCell>
      <TableCell>Completa</TableCell>
      <TableCell>Confirmação</TableCell>
      <TableCell>Ações</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {campaigns.map(campaign => (
      <TableRow key={campaign.id}>
        <TableCell>{campaign.name}</TableCell>
        <TableCell>{formatStatus(campaign.status)}</TableCell>
        <TableCell>
          {campaign.contactListId
            ? campaign.contactList.name
            : i18n.t("campaigns.common.notDefined")}
        </TableCell>
        <TableCell>
          {campaign.whatsappId
            ? campaign.whatsapp.name
            : i18n.t("campaigns.common.notDefined")}
        </TableCell>
        <TableCell>
          {campaign.scheduledAt
            ? datetimeToClient(campaign.scheduledAt)
            : i18n.t("campaigns.common.noSchedule")}
        </TableCell>
        <TableCell>
          {campaign.completedAt
            ? datetimeToClient(campaign.completedAt)
            : i18n.t("campaigns.common.notCompleted")}
        </TableCell>
        <TableCell>
          {campaign.confirmation ? "Ativada" : "Desativada"}
        </TableCell>
        <TableCell>
          {/* Ações */}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 📊 Status de Campanhas

### Ciclo de Vida

```
INATIVA
  ↓ (Salvar com scheduledAt)
PROGRAMADA
  ↓ (scheduledAt alcançado)
EM_ANDAMENTO
  ├─ (Pausar) → CANCELADA → (Retomar) → EM_ANDAMENTO
  └─ (Todos enviados) → FINALIZADA
```

### Estados

| Status | Descrição | Ações Disponíveis |
|--------|-----------|-------------------|
| **INATIVA** | Recém-criada, não agendada | Editar, Deletar, Agendar |
| **PROGRAMADA** | Agendada, aguardando horário | Editar (se >1h), Deletar |
| **EM_ANDAMENTO** | Enviando mensagens | Pausar, Relatório |
| **CANCELADA** | Pausada manualmente | Retomar, Editar, Deletar |
| **FINALIZADA** | Todas mensagens enviadas | Relatório |

### Código

```javascript
const formatStatus = (val) => {
  switch (val) {
    case "INATIVA":
      return "Inativa";
    case "PROGRAMADA":
      return "Programada";
    case "EM_ANDAMENTO":
      return "Em Andamento";
    case "CANCELADA":
      return "Cancelada";
    case "FINALIZADA":
      return "Finalizada";
    default:
      return val;
  }
};
```

---

## 📈 Relatórios

### Página de Relatório

**Rota:** `/campaign/:campaignId/report`

```
┌────────────────────────────────────────────────────────┐
│ Relatório: Promo Black Friday                         │
│ Status: Em Andamento - 1.247 de 2.500                 │
│ ████████████░░░░░░░░ 49.8%                            │
├────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐│
│ │ 👥 Contatos  │ │ ✅ Entregues │ │ ✓✓ Confirmados │││
│ │   2.500      │ │   1.247      │ │    892         │││
│ └──────────────┘ └──────────────┘ └─────────────────┘││
│                                                         │
│ ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐││
│ │ 📱 WhatsApp  │ │ 📋 Lista     │ │ 📅 Agendada    │││
│ │  Conexão 1   │ │  Clientes    │ │ 15/10 14:00    │││
│ └──────────────┘ └──────────────┘ └─────────────────┘││
│                                                         │
│ ┌──────────────┐                                       ││
│ │ ✓ Conclusão  │                                       ││
│ │ 15/10 18:47  │                                       ││
│ └──────────────┘                                       ││
└────────────────────────────────────────────────────────┘
```

### Métricas

| Métrica | Descrição | Cálculo |
|---------|-----------|---------|
| **Contatos Válidos** | Contatos com WhatsApp válido | contactList.contacts.filter(c => c.isWhatsappValid) |
| **Entregues** | Mensagens entregues | shipping.filter(c => c.deliveredAt !== null) |
| **Confirmações Solicitadas** | Mensagens com pedido de confirmação | shipping.filter(c => c.confirmationRequestedAt !== null) |
| **Confirmações Recebidas** | Contatos que responderam | shipping.filter(c => c.deliveredAt && c.confirmationRequestedAt) |
| **Progresso** | Porcentagem entregue | (delivered / validContacts) * 100 |

### Atualizações em Tempo Real

**Socket.IO:**
```javascript
useEffect(() => {
  const companyId = user.companyId;

  const onCampaignEvent = (data) => {
    if (data.record.id === +campaignId) {
      setCampaign(data.record);

      // Se finalizou, recarregar métricas finais
      if (data.record.status === "FINALIZADA") {
        setTimeout(() => {
          findCampaign();
        }, 5000);
      }
    }
  };

  socket.on(`company-${companyId}-campaign`, onCampaignEvent);

  return () => {
    socket.off(`company-${companyId}-campaign`, onCampaignEvent);
  };
}, [campaignId]);
```

**Código dos Cards:**
```javascript
<Grid container spacing={2}>
  <Grid item xs={12} md={4}>
    <CardCounter
      icon={<GroupIcon />}
      title="Contatos Válidos"
      value={validContacts}
      loading={loading}
    />
  </Grid>

  <Grid item xs={12} md={4}>
    <CardCounter
      icon={<CheckCircleIcon />}
      title="Entregues"
      value={delivered}
      loading={loading}
    />
  </Grid>

  {campaign.confirmation && (
    <>
      <Grid item xs={12} md={4}>
        <CardCounter
          icon={<DoneIcon />}
          title="Confirmações Solicitadas"
          value={confirmationRequested}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CardCounter
          icon={<DoneAllIcon />}
          title="Confirmações Recebidas"
          value={confirmed}
          loading={loading}
        />
      </Grid>
    </>
  )}
</Grid>
```

---

## 🔄 Fluxo de Campanha

### 1. Criar Campanha

```
User: Clica "+ Nova Campanha"
  ↓
CampaignModal abre
  ↓
User: Preenche formulário
  - Nome: "Promo Black Friday"
  - WhatsApp: Conexão 1
  - Lista: Clientes (2.500 contatos)
  - Mensagem 1: "Olá {nome}! Black Friday com 50% OFF!"
  - Mensagem 2: "Ei {nome}, aproveite nossa Black Friday!"
  - Agendada: 15/10/2025 14:00
  ↓
Clica "Salvar"
  ↓
POST /campaigns {
  name: "Promo Black Friday",
  whatsappId: 1,
  contactListId: 5,
  message1: "Olá {nome}!...",
  message2: "Ei {nome}...",
  scheduledAt: "2025-10-15 14:00:00",
  status: "PROGRAMADA"
}
  ↓
Backend:
  - Salva campanha
  - Cria job agendado
  ↓
Response: { id: 10, status: "PROGRAMADA" }
  ↓
Lista atualiza
```

---

### 2. Execução da Campanha

```
Horário agendado alcançado (15/10 14:00)
  ↓
Backend:
  - Atualiza status: EM_ANDAMENTO
  - Busca lista de contatos (2.500)
  - Filtra apenas WhatsApp válidos (2.400)
  ↓
Para cada contato:
  1. Seleciona mensagem aleatória (1-5)
  2. Substitui variáveis: {nome}, {telefone}
  3. Envia via WhatsApp API
  4. Aguarda 2-5 segundos (evitar bloqueio)
  5. Registra envio em shipping table
  6. Emite evento Socket.IO
  ↓
Frontend:
  - Socket recebe evento
  - Atualiza contador de entregues
  - Atualiza barra de progresso
  ↓
Todos contatos processados
  ↓
Backend:
  - Atualiza status: FINALIZADA
  - Registra completedAt
  ↓
Frontend:
  - Mostra 100% concluído
  - Habilita apenas visualização
```

---

### 3. Confirmação de Leitura

```
Campanha com confirmation: true
  ↓
Envia mensagem principal
  "Recebeu este aviso? Responda SIM."
  ↓
Backend aguarda resposta (webhook)
  ↓
Contato responde: "SIM"
  ↓
Backend:
  - Registra confirmationRequestedAt
  - Envia mensagem de confirmação
    "Obrigado por confirmar!"
  - Emite evento Socket.IO
  ↓
Frontend:
  - Incrementa contador de confirmações
  - Atualiza card "Confirmações Recebidas"
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Promoção Simples

**Objetivo:** Divulgar Black Friday para todos clientes

**Configuração:**
```javascript
{
  name: "Black Friday 2025",
  whatsappId: 1,
  contactListId: 5, // Lista "Todos Clientes" (5.000 contatos)
  message1: "Olá {nome}! 🎉 Black Friday com até 70% OFF! Corra: www.loja.com/bf",
  message2: "Ei {nome}, Black Friday começou! Descontos de até 70%! www.loja.com/bf",
  message3: "{nome}, não perca! Black Friday com 70% de desconto! www.loja.com/bf",
  scheduledAt: "2025-11-24 00:00:00",
  confirmation: false,
  openTicket: "disabled"
}
```

**Resultado:**
- 5.000 contatos receberão 1 de 3 mensagens diferentes
- Envio começa às 00:00 da Black Friday
- Sem confirmação (apenas anúncio)
- Sem ticket (não precisa atendimento)

---

### Exemplo 2: Pesquisa NPS com Confirmação

**Objetivo:** Coletar NPS e abrir ticket para insatisfeitos

**Configuração:**
```javascript
{
  name: "NPS Q4 2025",
  whatsappId: 2,
  tagListId: 15, // Tag "Clientes Ativos" (1.200 contatos)
  message1: `Olá {nome}!

De 0 a 10, qual a chance de você nos recomendar?

Responda com um número de 0 a 10.`,
  confirmationMessage1: `Obrigado pelo seu feedback!

Sua opinião é muito importante para nós. 💙`,
  scheduledAt: "2025-12-15 10:00:00",
  confirmation: true,
  openTicket: "enabled",
  queueId: 3,        // Fila "Suporte"
  statusTicket: "pending",
  userId: null       // Distribuir para qualquer atendente da fila
}
```

**Fluxo:**
1. Cliente recebe: "De 0 a 10, qual a chance..."
2. Cliente responde: "8"
3. Bot envia: "Obrigado pelo seu feedback!..."
4. Sistema cria ticket na fila Suporte
5. Ticket fica pendente aguardando atendente
6. Se resposta for 0-6 (detratores), atendente pode abordar

---

### Exemplo 3: Lembrete de Pagamento

**Objetivo:** Lembrar clientes de pagamento vencendo

**Configuração:**
```javascript
{
  name: "Lembrete Pagamento Mensal",
  whatsappId: 1,
  contactListId: 8, // Lista "Pagamento Vencendo" (350 contatos)
  message1: `Olá {nome}!

Seu pagamento vence em 3 dias (dia 20/10).

Valor: R$ 149,90
PIX: pix@empresa.com

Dúvidas? Responda esta mensagem!`,
  scheduledAt: "2025-10-17 09:00:00",
  confirmation: false,
  openTicket: "disabled",
  mediaPath: "/uploads/boleto.pdf" // Anexar PDF do boleto
}
```

**Resultado:**
- 350 clientes recebem lembrete
- PDF do boleto em anexo
- Não precisa confirmação
- Se responder, abre ticket automático (mensagem não programada)

---

### Exemplo 4: Convite para Evento

**Objetivo:** Convidar VIPs e confirmar presença

**Configuração:**
```javascript
{
  name: "Convite Evento VIP",
  whatsappId: 3,
  tagListId: 22, // Tag "VIP" (50 contatos)
  message1: `{nome}, você está convidado! 🎊

📅 Evento: Lançamento 2026
📍 Local: Hotel Grand Plaza
🕐 Horário: 19h do dia 10/01/2026

Confirme sua presença respondendo:
✅ CONFIRMO ou ❌ NÃO VOU`,
  confirmationMessage1: `Perfeito, {nome}!

Sua presença está confirmada! ✅

Enviaremos os detalhes por email.

Até lá! 🎉`,
  scheduledAt: "2025-12-20 14:00:00",
  confirmation: true,
  openTicket: "disabled",
  mediaPath: "/uploads/convite.jpg" // Imagem do convite
}
```

**Fluxo:**
1. VIP recebe mensagem + imagem do convite
2. Responde: "CONFIRMO"
3. Recebe mensagem de confirmação
4. Sistema registra confirmação no relatório
5. Empresa consegue lista de confirmados

---

## 📡 API Endpoints

### GET /campaigns

**Descrição:** Listar todas campanhas

**Query Params:**
- `searchParam` (string) - Buscar por nome
- `pageNumber` (number) - Paginação

**Response:**
```json
{
  "records": [
    {
      "id": 1,
      "name": "Black Friday",
      "status": "EM_ANDAMENTO",
      "scheduledAt": "2025-11-24T00:00:00Z",
      "completedAt": null,
      "confirmation": false,
      "whatsappId": 1,
      "whatsapp": { "id": 1, "name": "Conexão 1" },
      "contactListId": 5,
      "contactList": { "id": 5, "name": "Todos Clientes" },
      "tagListId": null,
      "message1": "...",
      "message2": "...",
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "hasMore": true
}
```

---

### GET /campaigns/:id

**Descrição:** Obter campanha específica com shipping

**Response:**
```json
{
  "id": 1,
  "name": "Black Friday",
  "status": "FINALIZADA",
  "scheduledAt": "2025-11-24T00:00:00Z",
  "completedAt": "2025-11-24T03:47:00Z",
  "confirmation": false,
  "whatsapp": { "id": 1, "name": "Conexão 1" },
  "contactList": {
    "id": 5,
    "name": "Todos Clientes",
    "contacts": [
      { "id": 100, "name": "João", "isWhatsappValid": true },
      { "id": 101, "name": "Maria", "isWhatsappValid": true }
    ]
  },
  "shipping": [
    {
      "id": 1,
      "contactId": 100,
      "message": "Olá João! Black Friday...",
      "deliveredAt": "2025-11-24T00:05:00Z",
      "confirmationRequestedAt": null
    },
    {
      "id": 2,
      "contactId": 101,
      "message": "Ei Maria, Black Friday...",
      "deliveredAt": "2025-11-24T00:08:00Z",
      "confirmationRequestedAt": null
    }
  ]
}
```

---

### POST /campaigns

**Descrição:** Criar nova campanha

**Request:**
```json
{
  "name": "Nova Campanha",
  "whatsappId": 1,
  "contactListId": 5,
  "tagListId": null,
  "message1": "Mensagem 1",
  "message2": "",
  "message3": "",
  "message4": "",
  "message5": "",
  "confirmationMessage1": "",
  "confirmation": false,
  "scheduledAt": "2025-12-01T10:00:00",
  "openTicket": "disabled",
  "userId": null,
  "queueId": null,
  "statusTicket": "closed"
}
```

**Response:**
```json
{
  "id": 10,
  "name": "Nova Campanha",
  "status": "PROGRAMADA"
}
```

---

### PUT /campaigns/:id

**Descrição:** Atualizar campanha

**Request:** Mesmos campos do POST

**Response:**
```json
{
  "id": 10,
  "name": "Campanha Atualizada",
  "status": "PROGRAMADA"
}
```

---

### DELETE /campaigns/:id

**Descrição:** Deletar campanha

**Response:**
```json
{
  "message": "Campanha deletada com sucesso"
}
```

---

### POST /campaigns/:id/cancel

**Descrição:** Pausar campanha em andamento

**Response:**
```json
{
  "id": 5,
  "status": "CANCELADA"
}
```

---

### POST /campaigns/:id/restart

**Descrição:** Retomar campanha pausada

**Response:**
```json
{
  "id": 5,
  "status": "EM_ANDAMENTO"
}
```

---

### POST /campaigns/:id/media-upload

**Descrição:** Upload de mídia

**Request:** FormData
```javascript
const formData = new FormData();
formData.append("file", file);
```

**Response:**
```json
{
  "mediaPath": "/uploads/campaigns/abc123.jpg",
  "mediaName": "promocao.jpg"
}
```

---

### DELETE /campaigns/:id/media-upload

**Descrição:** Remover mídia

**Response:**
```json
{
  "message": "Mídia removida com sucesso"
}
```

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [PAGES.md](./PAGES.md) - Página Campaigns
- [COMPONENTS.md](./COMPONENTS.md) - CampaignModal
- [API.md](./API.md) - Endpoints completos
- [INTEGRATIONS.md](./INTEGRATIONS.md) - Integrações WhatsApp

### Boas Práticas

1. **Rotacionar Mensagens** - Use 3-5 mensagens diferentes
2. **Agendar Horário Adequado** - 9h-18h dias úteis
3. **Testar Antes** - Crie campanha teste com 10 contatos
4. **Monitorar em Tempo Real** - Acompanhe relatório
5. **Listas Segmentadas** - Envie apenas para quem importa
6. **Evitar Spam** - Máximo 1 campanha/semana por contato

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
