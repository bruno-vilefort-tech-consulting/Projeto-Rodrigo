# 🧩 Componentes - ChatIA Flow

Documentação completa dos 151 componentes React do sistema.

---

## Índice

- [Componentes de Mensagens](#componentes-de-mensagens)
- [Componentes de Tickets](#componentes-de-tickets)
- [Componentes de Contatos](#componentes-de-contatos)
- [Componentes de UI](#componentes-de-ui)
- [Modals](#modals)
- [Componentes de Layout](#componentes-de-layout)
- [Componentes Especializados](#componentes-especializados)

---

## Componentes de Mensagens

### MessagesList

**Localização:** `/src/components/MessagesList/index.js`

**Descrição:** Renderiza a lista de mensagens de um ticket em tempo real com suporte a múltiplos tipos de mídia.

**Props:**
```javascript
{
  ticketId: string | number,    // ID do ticket
  isGroup: boolean,             // É um grupo?
  isCampaign: boolean          // É uma campanha?
}
```

**Funcionalidades:**
- ✅ Renderização de múltiplos tipos de mensagem (texto, imagem, vídeo, áudio, documento, localização, vCard, YouTube, Meta Ads)
- ✅ Sistema de ACK (acknowledgment): 0-5 estados
- ✅ Mensagens quotadas (reply)
- ✅ Mensagens privadas (fundo amarelo)
- ✅ Mensagens deletadas (LGPD)
- ✅ Drag & Drop de arquivos
- ✅ Separadores de tickets e datas
- ✅ Infinite scroll (paginação)
- ✅ Auto-scroll para última mensagem
- ✅ Sincronização real-time via Socket.IO

**Estados de ACK:**
```javascript
const ackIcons = {
  0: <AccessTimeIcon />,           // Enviando (relógio)
  1: <CheckIcon />,                // Enviado (check)
  2: <DoneAllIcon />,              // Entregue (double check)
  3: <DoneAllIcon color="primary"/>, // Lido (double check azul)
  4: <DoneAllIcon color="primary"/>, // Lido
  5: <HeadsetIcon />               // Áudio reproduzido
}
```

**Tipos de Mensagem Suportados:**

1. **Texto:**
   - Markdown (negrito, itálico, código)
   - Emojis
   - Links clicáveis
   - Quebras de linha

2. **Imagem:**
   - Preview inline
   - Modal para visualização ampliada
   - Suporte a CORS

3. **Vídeo:**
   - Player nativo
   - Controles de reprodução

4. **Áudio:**
   - Player customizado
   - Barra de progresso
   - Indicador de reprodução

5. **Documento:**
   - Ícone por tipo de arquivo
   - Download direto
   - Nome do arquivo

6. **Localização:**
   - Mapa estático (Google Maps)
   - Link para abrir no Maps
   - Descrição opcional

7. **Contato (vCard):**
   - Nome e telefone(s)
   - Botão para criar contato

8. **Link YouTube:**
   - Preview embutido
   - Thumbnail
   - Play inline

9. **Ad Meta Preview:**
   - Preview de anúncios do Facebook/Instagram
   - Imagem, título, corpo, URL

**Exemplo de Uso:**
```jsx
import MessagesList from "../../components/MessagesList";

<MessagesList
  ticketId={ticket.id}
  isGroup={ticket.isGroup}
/>
```

---

### MessageInput

**Localização:** `/src/components/MessageInput/index.js`

**Descrição:** Input de mensagem com múltiplas funcionalidades de envio e formatação.

**Props:**
```javascript
{
  ticketId: string | number,    // ID do ticket
  ticketStatus: string          // Status do ticket
}
```

**Funcionalidades:**
- ✅ Input de texto com auto-resize
- ✅ Emoji picker
- ✅ Upload de múltiplas mídias (imagens, vídeos, documentos)
- ✅ Gravação de áudio
- ✅ Captura de câmera
- ✅ Envio de contato
- ✅ Link de videoconferência (Jitsi)
- ✅ Botões interativos
- ✅ Agendamento de mensagens
- ✅ Quick answers (respostas rápidas com `/`)
- ✅ Assinatura de mensagem (toggleável)
- ✅ Mensagens privadas (não enviadas ao cliente)
- ✅ Reply, Forward, Edit
- ✅ Paste de imagens do clipboard
- ✅ Drag & drop de arquivos

**Contextos Utilizados:**
- `ReplyMessageContext` - Mensagem sendo respondida
- `ForwardMessageContext` - Mensagens sendo encaminhadas
- `EditingMessageContext` - Mensagem sendo editada
- `AuthContext` - Dados do usuário

**Quick Answers:**
- Digite `/` para abrir autocomplete
- Selecione resposta rápida
- Suporte a variáveis: `{{nome}}`, `{{protocolo}}`

**Assinatura de Mensagem:**
```javascript
const message = signMessage
  ? `*${user.name}:*\n${inputMessage}`
  : inputMessage;
```

**Mensagens Privadas:**
- Toggle "Enviar como Privado"
- Fundo amarelo
- Prefixo `\u200d` na API
- Visível apenas para atendentes

**Exemplo de Uso:**
```jsx
import MessageInput from "../../components/MessageInput";

<MessageInput
  ticketId={ticket.id}
  ticketStatus={ticket.status}
/>
```

---

### MessageOptionsMenu

**Localização:** `/src/components/MessageOptionsMenu/index.js`

**Descrição:** Menu de opções para cada mensagem (reply, forward, edit, delete).

**Props:**
```javascript
{
  message: object,              // Objeto da mensagem
  menuOpen: boolean,           // Menu aberto?
  handleClose: function,       // Fechar menu
  anchorEl: HTMLElement        // Elemento âncora
}
```

**Opções:**
- **Responder** - Cita a mensagem
- **Encaminhar** - Encaminha para outro ticket
- **Editar** - Edita mensagem (apenas próprias e texto)
- **Deletar** - Marca como deletada (LGPD)

---

## Componentes de Tickets

### Ticket

**Localização:** `/src/components/Ticket/index.js`

**Descrição:** Container principal de atendimento com chat completo.

**Props:**
```javascript
{
  ticket: object               // Objeto do ticket
}
```

**Estrutura:**
```jsx
<Ticket>
  <TicketHeader />
  <TagsContainer />
  <MessagesList />
  <MessageInput />
  <ContactDrawer />
</Ticket>
```

**Funcionalidades:**
- ✅ Header com informações do contato
- ✅ Ações do ticket (transferir, resolver, deletar)
- ✅ Tags do contato
- ✅ Lista de mensagens
- ✅ Input de mensagem
- ✅ Drawer lateral com dados do contato
- ✅ Sincronização real-time

---

### TicketHeader

**Localização:** `/src/components/TicketHeader/index.js`

**Descrição:** Cabeçalho do ticket com informações e ações.

**Elementos:**
- Avatar do contato
- Nome do contato
- Número do contato
- Status da conexão
- Botões de ação
- Informações adicionais (fila, usuário)

**Ações:**
- Transferir ticket
- Resolver ticket
- Deletar ticket
- Abrir drawer de contato

---

### TicketsList

**Localização:** `/src/components/TicketsList/index.js`

**Descrição:** Lista de tickets com filtros e busca.

**Props:**
```javascript
{
  status: string,              // "open", "pending", "closed"
  showAll: boolean,           // Mostrar todos ou só do usuário
  selectedQueueIds: array,    // IDs das filas filtradas
  updateCount: function,      // Callback para atualizar contagem
  style: object               // Estilos customizados
}
```

**Funcionalidades:**
- ✅ Busca por nome/número
- ✅ Filtro por fila
- ✅ Filtro por tags
- ✅ Ordenação por data
- ✅ Badge de mensagens não lidas
- ✅ Infinite scroll
- ✅ Atualização real-time

---

### TicketsManager

**Localização:** `/src/components/TicketsManager/index.js`

**Descrição:** Gerenciador de tickets com abas e lista.

**Abas:**
- 🟢 **Abertos** - Tickets em atendimento
- 🟡 **Pendentes** - Tickets aguardando
- 🔴 **Resolvidos** - Tickets finalizados

**Funcionalidades:**
- ✅ Tabs para cada status
- ✅ Contadores de tickets
- ✅ Filtros globais
- ✅ Botão "Aceitar" ticket
- ✅ Notificação sonora de novo ticket

---

### TicketListItem

**Localização:** `/src/components/TicketListItem/index.js`

**Descrição:** Item individual da lista de tickets.

**Informações Exibidas:**
- Avatar do contato
- Nome do contato
- Última mensagem
- Timestamp
- Badge de não lidas
- Tags
- Fila
- Status

**Layout Grid:**
```css
.ticket-item {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  grid-template-rows: auto auto;
  min-height: 64px;
}
```

---

## Componentes de Contatos

### ContactDrawer

**Localização:** `/src/components/ContactDrawer/index.js`

**Descrição:** Drawer lateral com informações detalhadas do contato.

**Props:**
```javascript
{
  open: boolean,               // Drawer aberto?
  handleDrawerClose: function, // Fechar drawer
  contact: object,            // Objeto do contato
  ticket: object              // Ticket atual
}
```

**Seções:**
- **Dados do Contato:**
  - Nome
  - Número
  - Email
  - Endereço
  - Tags
  - Notas

- **Histórico de Atendimentos:**
  - Tickets anteriores
  - Mensagens trocadas
  - Data de criação

- **Ações:**
  - Editar contato
  - Adicionar tags
  - Adicionar notas

---

### ContactModal

**Localização:** `/src/components/ContactModal/index.js`

**Descrição:** Modal para criar/editar contatos.

**Props:**
```javascript
{
  open: boolean,
  onClose: function,
  contactId: string | number,  // Se edição
  initialValues: object,       // Valores iniciais
  onSave: function            // Callback após salvar
}
```

**Campos:**
- Nome (obrigatório)
- Número (obrigatório)
- Email
- Endereço
- Tags
- Extrainfo (campos customizados)

**Validação (Yup):**
```javascript
const schema = Yup.object().shape({
  name: Yup.string().required("Nome obrigatório"),
  number: Yup.string().required("Número obrigatório")
});
```

---

## Componentes de UI

### MainContainer

**Localização:** `/src/components/MainContainer/index.js`

**Descrição:** Container principal das páginas.

**Props:**
```javascript
{
  children: ReactNode,         // Conteúdo
  className: string           // Classes adicionais
}
```

**Estilos:**
- Padding responsivo
- Overflow auto
- Altura calculada (100vh - AppBar)

---

### MainHeader

**Localização:** `/src/components/MainHeader/index.js`

**Descrição:** Cabeçalho padrão das páginas.

**Props:**
```javascript
{
  children: ReactNode          // Geralmente Title + Buttons
}
```

**Estrutura:**
```jsx
<MainHeader>
  <Title>Página</Title>
  <MainHeaderButtonsWrapper>
    <Button>Ação</Button>
  </MainHeaderButtonsWrapper>
</MainHeader>
```

---

### Title

**Localização:** `/src/components/Title/index.js`

**Descrição:** Título padrão das páginas.

**Props:**
```javascript
{
  children: ReactNode,         // Texto do título
  className: string
}
```

---

### BackdropLoading

**Localização:** `/src/components/BackdropLoading/index.js`

**Descrição:** Overlay de carregamento em tela cheia.

**Uso:**
```jsx
{loading && <BackdropLoading />}
```

---

### ConfirmationModal

**Localização:** `/src/components/ConfirmationModal/index.js`

**Descrição:** Modal de confirmação para ações destrutivas.

**Props:**
```javascript
{
  title: string,               // Título do modal
  open: boolean,              // Aberto?
  onClose: function,          // Fechar
  onConfirm: function,        // Confirmar ação
  children: ReactNode         // Mensagem de confirmação
}
```

**Exemplo:**
```jsx
<ConfirmationModal
  title="Deletar Contato"
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleDeleteContact}
>
  Tem certeza que deseja deletar este contato?
</ConfirmationModal>
```

---

### Can

**Localização:** `/src/components/Can/index.js`

**Descrição:** Componente de controle de permissões (RBAC).

**Props:**
```javascript
{
  role: string,                // "admin" ou "user"
  perform: string,             // Ação a verificar
  data: object,               // Dados para validação dinâmica
  yes: function,              // Renderiza se permitido
  no: function                // Renderiza se negado (opcional)
}
```

**Exemplo:**
```jsx
<Can
  role={user.profile}
  perform="dashboard:view"
  yes={() => <DashboardLink />}
  no={() => <AccessDenied />}
/>
```

**Permissões Disponíveis:**
```javascript
const rules = {
  admin: {
    static: [
      "dashboard:view",
      "drawer-admin-items:view",
      "tickets-manager:showall",
      "user-modal:editProfile",
      "user-modal:editQueues",
      "ticket-options:deleteTicket",
      "contacts-page:deleteContact",
      "connections-page:actionButtons",
      "connections-page:addConnection",
      "connections-page:editOrDeleteConnection",
      "tickets-manager:closeAll"
    ]
  }
};
```

---

## Modals

### UserModal

**Localização:** `/src/components/UserModal/index.js`

**Descrição:** Modal para criar/editar usuários.

**Campos:**
- Nome
- Email
- Senha
- Perfil (admin/user)
- Filas
- WhatsApps
- Permissões especiais

---

### QueueModal

**Localização:** `/src/components/QueueModal/index.js`

**Descrição:** Modal para criar/editar filas.

**Campos:**
- Nome
- Cor
- Saudação
- Horários de funcionamento
- Opções de chatbot

---

### QuickMessageModal

**Localização:** `/src/components/QuickMessageModal/index.js`

**Descrição:** Modal para criar respostas rápidas.

**Campos:**
- Atalho
- Mensagem
- Mídia (opcional)

---

### ScheduleModal

**Localização:** `/src/components/ScheduleModal/index.js`

**Descrição:** Modal para agendar mensagens.

**Campos:**
- Data e hora
- Mensagem
- Recorrência (opcional)

---

### TagModal

**Localização:** `/src/components/TagModal/index.js`

**Descrição:** Modal para criar tags.

**Campos:**
- Nome
- Cor
- Kanban (sim/não)

---

## Componentes de Layout

### MainListItems

**Localização:** `/src/layout/MainListItems.js`

**Descrição:** Menu lateral da aplicação.

**Estrutura Hierárquica:**

**Gerência (admin):**
- Dashboard
- Relatórios
- Painel em Tempo Real

**Principais:**
- Atendimentos
- Respostas Rápidas
- Kanban
- Contatos
- Agendamentos
- Tags
- Chat Interno
- Ajuda

**Administração (admin):**
- Campanhas (submenu)
- Flowbuilder (submenu)
- Informativos
- API
- Usuários
- Filas & Chatbot
- Prompts
- Integrações
- Conexões
- Arquivos
- Financeiro
- Configurações
- Empresas (super user)

**Ícones com Gradiente:**
```javascript
const iconStyles = {
  dashboard: {
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
  },
  // ...
};
```

---

### NotificationsPopOver

**Localização:** `/src/components/NotificationsPopOver/index.js`

**Descrição:** Popover de notificações no header.

**Funcionalidades:**
- Lista de notificações
- Contador de não lidas
- Marcar como lida
- Som de notificação

---

### UserLanguageSelector

**Localização:** `/src/components/UserLanguageSelector/index.js`

**Descrição:** Seletor de idioma no header.

**Idiomas:**
- 🇧🇷 Português
- 🇺🇸 Inglês
- 🇪🇸 Espanhol
- 🇹🇷 Turco
- 🇸🇦 Árabe

---

## Componentes Especializados

### Audio

**Localização:** `/src/components/Audio/index.js`

**Descrição:** Player de áudio customizado com waveform.

---

### MarkdownWrapper

**Localização:** `/src/components/MarkdownWrapper/index.js`

**Descrição:** Renderiza texto com Markdown de forma segura.

**Suporte:**
- Negrito: `*texto*`
- Itálico: `_texto_`
- Tachado: `~texto~`
- Código: `` `código` ``

---

### ModalImageCors

**Localização:** `/src/components/ModalImageCors/index.js`

**Descrição:** Modal para visualização de imagens com suporte a CORS.

---

### VcardPreview

**Localização:** `/src/components/VcardPreview/index.js`

**Descrição:** Preview de contato (vCard) em mensagens.

---

### LocationPreview

**Localização:** `/src/components/LocationPreview/index.js`

**Descrição:** Preview de localização com mapa estático.

---

### AdMetaPreview

**Localização:** `/src/components/AdMetaPreview/index.js`

**Descrição:** Preview de anúncios do Facebook/Instagram.

---

### ButtonsWhats

**Localização:** `/src/components/ButtonsWhats/index.js`

**Descrição:** Renderiza botões interativos do WhatsApp.

---

### ChartsDate / ChartsUser

**Localização:** `/src/components/ChartsDate/` e `/src/components/ChartsUser/`

**Descrição:** Gráficos de performance com Chart.js e Recharts.

---

## Padrões de Uso

### Criar Novo Componente

```jsx
// /src/components/MeuComponente/index.js
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const MeuComponente = ({ prop1, prop2 }) => {
  const classes = useStyles();
  const [state, setState] = useState(null);

  return (
    <Paper className={classes.root}>
      <Typography variant="h6">
        {i18n.t("meuComponente.titulo")}
      </Typography>
    </Paper>
  );
};

export default MeuComponente;
```

---

## Boas Práticas

1. **Sempre use `makeStyles` para estilos:**
   ```javascript
   const useStyles = makeStyles((theme) => ({...}));
   ```

2. **Use i18n para textos:**
   ```javascript
   {i18n.t("chave.traducao")}
   ```

3. **Memoize quando apropriado:**
   ```javascript
   const ExpensiveComponent = React.memo(({ data }) => {...});
   ```

4. **Use PropTypes ou TypeScript:**
   ```javascript
   MeuComponente.propTypes = {
     prop1: PropTypes.string.isRequired,
   };
   ```

5. **Contextos via hooks:**
   ```javascript
   const { user } = useContext(AuthContext);
   ```

---

**Total de Componentes:** 151
**Componentes Documentados:** Principais (20+)
**Padrão de Design:** Component-Based Architecture
