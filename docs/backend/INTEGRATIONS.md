# 🔌 Integrations - ChatIA Flow Backend

> Documentação completa de todas as integrações (IA, Automação, Pagamentos, Social Media, ERP)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [IA & NLP](#ia--nlp)
   - [OpenAI (GPT-4, Whisper)](#openai)
   - [Dialogflow](#dialogflow)
   - [Google Gemini](#google-gemini)
3. [Automação](#automação)
   - [N8N Webhooks](#n8n-webhooks)
   - [Typebot](#typebot)
   - [Custom Webhooks](#custom-webhooks)
4. [Pagamentos](#pagamentos)
   - [MercadoPago](#mercadopago)
   - [Asaas](#asaas)
5. [Social Media](#social-media)
   - [Facebook Messenger](#facebook-messenger)
   - [Instagram Direct](#instagram-direct)
6. [ERP & CRM](#erp--crm)
   - [Bling](#bling)
   - [Supabase](#supabase)
7. [Configuração](#configuração)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

### Integrações Disponíveis

| Categoria | Integração | Status | Uso Principal |
|-----------|-----------|--------|---------------|
| **IA & NLP** | OpenAI | ✅ Ativo | Chat GPT-4, transcrição Whisper |
| | Dialogflow | ✅ Ativo | NLU e detecção de intents |
| | Google Gemini | ✅ Ativo | IA generativa |
| **Automação** | N8N | ✅ Ativo | Workflows e webhooks |
| | Typebot | ✅ Ativo | Chatbot visual |
| | Custom Webhooks | ✅ Ativo | Integrações personalizadas |
| **Pagamentos** | MercadoPago | ✅ Ativo | Gateway de pagamento |
| | Asaas | ✅ Ativo | Cobranças recorrentes |
| **Social Media** | Facebook | ✅ Ativo | Messenger |
| | Instagram | ✅ Ativo | Direct |
| **ERP/CRM** | Bling | ✅ Ativo | ERP e-commerce |
| | Supabase | ✅ Ativo | Backend as a Service |

---

## IA & NLP

### OpenAI

**Localização**: `services/IntegrationsServices/OpenAiService.ts`
**Versão**: openai@4.24.7
**Features**: GPT-4, GPT-3.5-turbo, Whisper

#### Setup

```bash
# Instalar dependência
npm install openai

# Configurar .env
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-... # Opcional
```

#### Configuração no Banco

```typescript
// Table: Settings
{
  key: "openaiApiKey",
  value: "sk-...",
  companyId: 1
}

{
  key: "openaiModel",
  value: "gpt-4", // ou "gpt-3.5-turbo"
  companyId: 1
}
```

#### Uso - Chat Completion

```typescript
import OpenAI from "openai";

interface Request {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  messages?: Array<{role: string; content: string}>;
}

interface Response {
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const OpenAiChatService = async ({
  prompt,
  model = "gpt-4",
  maxTokens = 150,
  temperature = 0.7,
  messages = []
}: Request): Promise<Response> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    // Prepara mensagens
    const chatMessages = messages.length > 0
      ? messages
      : [{ role: "user", content: prompt }];

    // Chama API
    const completion = await openai.chat.completions.create({
      model,
      messages: chatMessages,
      max_tokens: maxTokens,
      temperature
    });

    return {
      response: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    };
  } catch (error) {
    logger.error("OpenAI Service Error:", error);

    if (error.status === 429) {
      throw new AppError("Limite de requisições OpenAI atingido", 429);
    }

    if (error.status === 401) {
      throw new AppError("API Key OpenAI inválida", 401);
    }

    throw new AppError("Erro ao processar com OpenAI", 500);
  }
};
```

#### Uso - Transcription (Whisper)

```typescript
import fs from "fs";

const TranscribeAudioService = async (
  audioPath: string
): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const audioFile = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt", // pt, en, es, etc
      response_format: "text" // text, json, srt, vtt
    });

    return transcription.text;
  } catch (error) {
    logger.error("Whisper Service Error:", error);
    throw new AppError("Erro ao transcrever áudio", 500);
  }
};
```

#### Integração com Chatbot

```typescript
// services/WbotServices/ChatBotListener.ts
const handleOpenAIResponse = async (
  ticket: Ticket,
  userMessage: string
): Promise<void> => {
  // Busca configuração
  const setting = await CompaniesSettings.findOne({
    where: { companyId: ticket.companyId }
  });

  if (!setting?.openaiApiKey) return;

  // Busca histórico de mensagens
  const messages = await Message.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
    limit: 10
  });

  // Monta contexto
  const chatMessages = messages.map(msg => ({
    role: msg.fromMe ? "assistant" : "user",
    content: msg.body
  }));

  // Adiciona mensagem do usuário
  chatMessages.push({
    role: "user",
    content: userMessage
  });

  // Chama OpenAI
  const { response } = await OpenAiChatService({
    messages: chatMessages,
    model: setting.openaiModel || "gpt-4",
    maxTokens: 300,
    temperature: 0.8
  });

  // Envia resposta
  await SendWhatsAppMessage({
    body: response,
    ticket
  });
};
```

#### Custos e Limites

```typescript
// Preços aproximados (2024)
const OPENAI_PRICING = {
  "gpt-4": {
    input: 0.03,  // por 1K tokens
    output: 0.06  // por 1K tokens
  },
  "gpt-3.5-turbo": {
    input: 0.0005,
    output: 0.0015
  },
  "whisper-1": {
    perMinute: 0.006 // por minuto de áudio
  }
};

// Calcular custo de uma resposta
function calculateCost(usage, model) {
  const pricing = OPENAI_PRICING[model];
  const inputCost = (usage.promptTokens / 1000) * pricing.input;
  const outputCost = (usage.completionTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}
```

---

### Dialogflow

**Localização**: `services/DialogChatBotsServices/`
**Versão**: @google-cloud/dialogflow@5.9.0
**Features**: NLU, Intent Detection, Entity Extraction

#### Setup

```bash
# Instalar dependência
npm install @google-cloud/dialogflow

# Configurar .env
DIALOGFLOW_PROJECT_ID=your-project-id
DIALOGFLOW_CREDENTIALS='{"type":"service_account",...}'
```

#### Configuração no Banco

```typescript
// Table: QueueIntegrations
{
  type: "dialogflow",
  name: "Bot Vendas",
  projectName: "my-project-123",
  jsonContent: '{"type":"service_account",...}',
  language: "pt-BR",
  queueId: 1,
  companyId: 1
}
```

#### Uso - Detect Intent

```typescript
import dialogflow from "@google-cloud/dialogflow";

interface Request {
  text: string;
  sessionId: string;
  languageCode?: string;
  projectId?: string;
  credentials?: any;
}

interface Response {
  fulfillmentText: string;
  intent: string;
  confidence: number;
  parameters: any;
  fulfillmentMessages?: any[];
}

const DialogflowService = async ({
  text,
  sessionId,
  languageCode = "pt-BR",
  projectId,
  credentials
}: Request): Promise<Response> => {
  try {
    // Cria client com credentials
    const sessionClient = new dialogflow.SessionsClient({
      credentials: JSON.parse(credentials)
    });

    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );

    // Prepara request
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text,
          languageCode
        }
      }
    };

    // Chama Dialogflow
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    logger.info("Dialogflow response:", {
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence
    });

    return {
      fulfillmentText: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
      parameters: result.parameters,
      fulfillmentMessages: result.fulfillmentMessages
    };
  } catch (error) {
    logger.error("Dialogflow Service Error:", error);
    throw new AppError("Erro ao processar com Dialogflow", 500);
  }
};
```

#### Integração com Queue

```typescript
// services/WbotServices/ChatBotListener.ts
const handleDialogflowQueue = async (
  ticket: Ticket,
  msg: proto.IWebMessageInfo
): Promise<void> => {
  // Busca integração da fila
  const queueIntegration = await QueueIntegration.findOne({
    where: {
      queueId: ticket.queueId,
      type: "dialogflow"
    }
  });

  if (!queueIntegration) return;

  const messageBody =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text;

  // Chama Dialogflow
  const dialogflowResponse = await DialogflowService({
    text: messageBody,
    sessionId: `${ticket.id}`,
    languageCode: queueIntegration.language || "pt-BR",
    projectId: queueIntegration.projectName,
    credentials: queueIntegration.jsonContent
  });

  // Processa intent
  if (dialogflowResponse.intent === "Default Fallback Intent") {
    // Não entendeu - transfere para atendente
    await ticket.update({
      queueId: null,
      userId: null,
      status: "pending"
    });
    return;
  }

  // Envia resposta
  if (dialogflowResponse.fulfillmentText) {
    await SendWhatsAppMessage({
      body: dialogflowResponse.fulfillmentText,
      ticket
    });
  }

  // Processa ações baseadas no intent
  await handleDialogflowIntent(
    ticket,
    dialogflowResponse.intent,
    dialogflowResponse.parameters
  );
};

const handleDialogflowIntent = async (
  ticket: Ticket,
  intent: string,
  parameters: any
): Promise<void> => {
  switch (intent) {
    case "Horario.Funcionamento":
      // Já respondeu via fulfillmentText
      break;

    case "Falar.Atendente":
      // Transfere para atendente humano
      await ticket.update({
        queueId: null,
        status: "pending"
      });
      break;

    case "Fazer.Pedido":
      // Extrai parâmetros e processa
      const produto = parameters.fields.produto?.stringValue;
      const quantidade = parameters.fields.quantidade?.numberValue;

      await SendWhatsAppMessage({
        body: `Pedido registrado:\n${quantidade}x ${produto}`,
        ticket
      });
      break;

    default:
      logger.info(`Intent não tratado: ${intent}`);
  }
};
```

---

### Google Gemini

**Localização**: `services/IntegrationsServices/GeminiService.ts`
**Versão**: @google/generative-ai@0.24.1
**Features**: IA Generativa multimodal

#### Setup

```bash
# Instalar dependência
npm install @google/generative-ai

# Configurar .env
GEMINI_API_KEY=AIza...
```

#### Uso - Text Generation

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Request {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface Response {
  text: string;
  safetyRatings?: any[];
}

const GeminiService = async ({
  prompt,
  model = "gemini-pro",
  temperature = 0.7,
  maxTokens = 1024
}: Request): Promise<Response> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model });

    const generationConfig = {
      temperature,
      maxOutputTokens: maxTokens
    };

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig
    });

    const response = result.response;

    return {
      text: response.text(),
      safetyRatings: response.candidates?.[0]?.safetyRatings
    };
  } catch (error) {
    logger.error("Gemini Service Error:", error);
    throw new AppError("Erro ao processar com Gemini", 500);
  }
};
```

#### Uso - Vision (Análise de Imagens)

```typescript
import fs from "fs";

const GeminiVisionService = async (
  imagePath: string,
  prompt: string = "Descreva esta imagem"
): Promise<string> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Lê imagem
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = "image/jpeg"; // ou image/png

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      }
    ]);

    return result.response.text();
  } catch (error) {
    logger.error("Gemini Vision Error:", error);
    throw new AppError("Erro ao analisar imagem com Gemini", 500);
  }
};
```

---

## Automação

### N8N Webhooks

**Localização**: `services/QueueIntegrationServices/`
**Features**: Workflows, Automações, Integrações

#### Configuração no Banco

```typescript
// Table: QueueIntegrations
{
  type: "n8n",
  name: "Workflow CRM",
  urlN8N: "https://n8n.mycompany.com/webhook/abc123",
  queueId: 1,
  companyId: 1
}
```

#### Envio de Dados

```typescript
// services/WbotServices/wbotMessageListener.ts
import axios from "axios";

const sendToN8N = async (
  integration: QueueIntegration,
  ticket: Ticket,
  message: Message,
  contact: Contact
): Promise<void> => {
  try {
    const payload = {
      // Dados do ticket
      ticket: {
        id: ticket.id,
        uuid: ticket.uuid,
        status: ticket.status,
        lastMessage: ticket.lastMessage,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      },
      // Dados da mensagem
      message: {
        id: message.id,
        body: message.body,
        fromMe: message.fromMe,
        mediaType: message.mediaType,
        mediaUrl: message.mediaUrl,
        createdAt: message.createdAt
      },
      // Dados do contato
      contact: {
        id: contact.id,
        name: contact.name,
        number: contact.number,
        email: contact.email,
        profilePicUrl: contact.profilePicUrl
      },
      // Dados da empresa
      company: {
        id: ticket.companyId
      },
      // Timestamp
      timestamp: new Date().toISOString()
    };

    // Envia para N8N
    const response = await axios.post(integration.urlN8N, payload, {
      timeout: 10000, // 10 segundos
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "ChatIA-Flow/1.0"
      }
    });

    logger.info("N8N webhook success:", {
      ticketId: ticket.id,
      status: response.status
    });

    // Processa resposta do N8N
    if (response.data?.reply) {
      await SendWhatsAppMessage({
        body: response.data.reply,
        ticket
      });
    }

    if (response.data?.closeTicket) {
      await UpdateTicketService({
        ticketData: { status: "closed" },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
    }

    if (response.data?.transferQueue) {
      await UpdateTicketService({
        ticketData: { queueId: response.data.transferQueue },
        ticketId: ticket.id,
        companyId: ticket.companyId
      });
    }

  } catch (error) {
    logger.error("N8N webhook error:", error);

    // Não falha o fluxo se N8N estiver indisponível
    if (error.code === "ECONNREFUSED") {
      logger.warn("N8N unreachable, continuing flow");
    } else {
      throw error;
    }
  }
};
```

#### Webhook de Entrada (N8N → ChatIA)

```typescript
// controllers/api/WebhookController.ts
export const handleN8NWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      companyId,
      number,
      message,
      mediaUrl,
      mediaType
    } = req.body;

    // Valida dados
    if (!companyId || !number || !message) {
      return res.status(400).json({
        error: "Campos obrigatórios: companyId, number, message"
      });
    }

    // Busca ou cria contato
    const [contact] = await Contact.findOrCreate({
      where: { number, companyId },
      defaults: {
        name: number,
        number,
        companyId
      }
    });

    // Busca WhatsApp padrão
    const whatsapp = await GetDefaultWhatsApp(companyId);

    // Busca ou cria ticket
    let ticket = await Ticket.findOne({
      where: {
        contactId: contact.id,
        companyId,
        status: { [Op.in]: ["open", "pending"] }
      }
    });

    if (!ticket) {
      ticket = await CreateTicketService({
        contactId: contact.id,
        status: "open",
        companyId,
        whatsappId: whatsapp.id,
        channel: "webhook"
      });
    }

    // Envia mensagem
    if (mediaUrl) {
      // Download e envia mídia
      const mediaResponse = await axios.get(mediaUrl, {
        responseType: "arraybuffer"
      });

      const mediaBuffer = Buffer.from(mediaResponse.data);
      const fileName = `webhook-${Date.now()}.${mediaType || "jpg"}`;
      const filePath = path.join("public", `company${companyId}`, fileName);

      fs.writeFileSync(filePath, mediaBuffer);

      await SendWhatsAppMedia({
        media: { path: filePath, filename: fileName },
        ticket,
        body: message
      });
    } else {
      await SendWhatsAppMessage({
        body: message,
        ticket
      });
    }

    return res.json({
      success: true,
      ticketId: ticket.id,
      messageId: message.id
    });

  } catch (error) {
    logger.error("N8N incoming webhook error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
};
```

---

### Typebot

**Localização**: `services/TypebotServices/typebotListener.ts`
**Features**: Chatbot visual no-code

#### Configuração no Banco

```typescript
// Table: QueueIntegrations
{
  type: "typebot",
  name: "Bot Atendimento",
  typebotUrl: "https://typebot.io",
  typebotName: "bot-atendimento-abc123",
  typebotDelayMessage: 1000, // delay entre mensagens
  companyId: 1,
  queueId: 1
}
```

#### Integração

```typescript
import axios from "axios";

interface TypebotSession {
  sessionId: string;
  typebotUrl: string;
  typebotName: string;
}

const sendToTypebot = async (
  message: string,
  session: TypebotSession
): Promise<string[]> => {
  try {
    const response = await axios.post(
      `${session.typebotUrl}/api/v1/typebots/${session.typebotName}/startChat`,
      {
        message,
        sessionId: session.sessionId
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Extrai respostas
    const messages = response.data.messages || [];
    const responses = messages
      .map(msg =>
        msg.content?.richText?.[0]?.children?.[0]?.text ||
        msg.content?.text ||
        ""
      )
      .filter(text => text.length > 0);

    return responses;

  } catch (error) {
    logger.error("Typebot Error:", error);
    throw new AppError("Erro ao processar com Typebot", 500);
  }
};

export const typebotListener = async (
  ticket: Ticket,
  msg: proto.IWebMessageInfo,
  wbot: Session
): Promise<void> => {
  // Busca integração Typebot da fila
  const queueIntegration = await QueueIntegration.findOne({
    where: {
      queueId: ticket.queueId,
      type: "typebot"
    }
  });

  if (!queueIntegration) return;

  // Cria ou recupera sessão
  let session = await TypebotSession.findOne({
    where: { ticketId: ticket.id }
  });

  if (!session) {
    session = await TypebotSession.create({
      ticketId: ticket.id,
      sessionId: uuid(),
      typebotUrl: queueIntegration.typebotUrl,
      typebotName: queueIntegration.typebotName
    });
  }

  // Extrai mensagem
  const messageBody =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text;

  // Envia para Typebot
  const typebotResponses = await sendToTypebot(messageBody, session);

  // Envia respostas com delay
  const delay = queueIntegration.typebotDelayMessage || 1000;

  for (const response of typebotResponses) {
    await SendWhatsAppMessage({
      body: response,
      ticket
    });

    // Aguarda entre mensagens
    if (typebotResponses.indexOf(response) < typebotResponses.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Verifica se deve finalizar sessão
  if (response.data.sessionEnded) {
    await session.destroy();
    await ticket.update({
      queueId: null,
      status: "pending"
    });
  }
};
```

---

### Custom Webhooks

**Localização**: `services/WebhookService/`
**Features**: Webhooks personalizados

#### Configuração

```typescript
// Table: Webhooks
{
  name: "Webhook CRM",
  url: "https://crm.mycompany.com/webhook/chatia",
  events: ["message.received", "ticket.created", "ticket.closed"],
  headers: '{"Authorization":"Bearer token123"}',
  active: true,
  companyId: 1
}
```

#### Disparo de Webhook

```typescript
// services/WebhookService/ExecuteWebhookService.ts
import axios from "axios";

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  companyId: number;
}

const ExecuteWebhookService = async (
  webhook: Webhook,
  event: string,
  data: any
): Promise<void> => {
  try {
    // Verifica se evento está configurado
    const events = JSON.parse(webhook.events);
    if (!events.includes(event)) return;

    // Prepara payload
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      companyId: webhook.companyId
    };

    // Prepara headers
    const headers = webhook.headers
      ? JSON.parse(webhook.headers)
      : {};

    headers["Content-Type"] = "application/json";
    headers["User-Agent"] = "ChatIA-Flow/1.0";
    headers["X-ChatIA-Event"] = event;

    // Envia webhook
    const response = await axios.post(webhook.url, payload, {
      headers,
      timeout: 10000
    });

    logger.info("Webhook executed:", {
      webhookId: webhook.id,
      event,
      status: response.status
    });

    // Registra execução
    await WebhookLog.create({
      webhookId: webhook.id,
      event,
      payload: JSON.stringify(payload),
      response: JSON.stringify(response.data),
      statusCode: response.status,
      success: true
    });

  } catch (error) {
    logger.error("Webhook execution failed:", error);

    // Registra falha
    await WebhookLog.create({
      webhookId: webhook.id,
      event,
      payload: JSON.stringify({ event, data }),
      error: error.message,
      statusCode: error.response?.status || 500,
      success: false
    });

    // Não falha o fluxo principal
  }
};

// Dispara webhooks para um evento
export const dispatchWebhooks = async (
  event: string,
  data: any,
  companyId: number
): Promise<void> => {
  const webhooks = await Webhook.findAll({
    where: {
      companyId,
      active: true
    }
  });

  // Executa em paralelo
  const promises = webhooks.map(webhook =>
    ExecuteWebhookService(webhook, event, data)
  );

  await Promise.allSettled(promises);
};
```

#### Uso nos Services

```typescript
// services/MessageServices/CreateMessageService.ts
const message = await Message.create({...});

// Dispara webhook
await dispatchWebhooks("message.received", {
  message: {
    id: message.id,
    body: message.body,
    fromMe: message.fromMe
  },
  ticket: {
    id: ticket.id,
    status: ticket.status
  },
  contact: {
    id: contact.id,
    name: contact.name,
    number: contact.number
  }
}, ticket.companyId);
```

---

## Pagamentos

### MercadoPago

**Localização**: `services/PaymentServices/MercadoPagoService.ts`
**Versão**: mercadopago@2.0.15
**Features**: Pagamentos, PIX, Boleto, Cartão

#### Setup

```bash
# Instalar dependência
npm install mercadopago

# Configurar .env
MERCADOPAGO_ACCESS_TOKEN=TEST-...
```

#### Criar Pagamento

```typescript
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

interface CreatePaymentRequest {
  amount: number;
  description: string;
  payerEmail: string;
  paymentMethod?: "pix" | "boleto" | "credit_card";
}

interface PaymentResponse {
  id: string;
  status: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  paymentUrl: string;
}

const CreateMercadoPagoPayment = async ({
  amount,
  description,
  payerEmail,
  paymentMethod = "pix"
}: CreatePaymentRequest): Promise<PaymentResponse> => {
  try {
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      description,
      payment_method_id: paymentMethod,
      payer: {
        email: payerEmail
      },
      notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
    });

    return {
      id: payment.body.id,
      status: payment.body.status,
      qrCode: payment.body.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.body.point_of_interaction?.transaction_data?.qr_code_base64,
      ticketUrl: payment.body.transaction_details?.external_resource_url,
      paymentUrl: payment.body.init_point || payment.body.ticket_url
    };

  } catch (error) {
    logger.error("MercadoPago error:", error);
    throw new AppError("Erro ao criar pagamento MercadoPago", 500);
  }
};
```

#### Webhook Handler

```typescript
// controllers/api/PaymentWebhookController.ts
export const handleMercadoPagoWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { type, data } = req.body;

    if (type === "payment") {
      const paymentId = data.id;

      // Busca detalhes do pagamento
      const payment = await mercadopago.payment.get(paymentId);

      // Processa baseado no status
      switch (payment.body.status) {
        case "approved":
          // Pagamento aprovado
          await handlePaymentApproved(payment.body);
          break;

        case "rejected":
          // Pagamento rejeitado
          await handlePaymentRejected(payment.body);
          break;

        case "pending":
          // Pagamento pendente
          await handlePaymentPending(payment.body);
          break;
      }
    }

    return res.status(200).json({ received: true });

  } catch (error) {
    logger.error("MercadoPago webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const handlePaymentApproved = async (payment: any): Promise<void> => {
  // Atualiza invoice
  await Invoice.update(
    {
      status: "paid",
      paidAt: new Date(),
      transactionId: payment.id
    },
    {
      where: { externalId: payment.external_reference }
    }
  );

  // Notifica empresa
  const invoice = await Invoice.findOne({
    where: { externalId: payment.external_reference }
  });

  if (invoice) {
    await SendPaymentConfirmationEmail(invoice);
  }
};
```

---

### Asaas

**Localização**: `services/PaymentServices/AsaasService.ts`
**Features**: Cobranças Recorrentes, Assinaturas

#### Setup

```bash
# Configurar .env
ASAAS_API_KEY=$aact_...
ASAAS_ENVIRONMENT=sandbox # ou production
```

#### Criar Cobrança

```typescript
import axios from "axios";

const asaasApi = axios.create({
  baseURL: process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://www.asaas.com/api/v3"
    : "https://sandbox.asaas.com/api/v3",
  headers: {
    "access_token": process.env.ASAAS_API_KEY,
    "Content-Type": "application/json"
  }
});

interface CreateChargeRequest {
  customer: string; // ID do cliente no Asaas
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  billingType?: "BOLETO" | "CREDIT_CARD" | "PIX";
}

const CreateAsaasCharge = async ({
  customer,
  value,
  dueDate,
  description,
  billingType = "PIX"
}: CreateChargeRequest): Promise<any> => {
  try {
    const response = await asaasApi.post("/payments", {
      customer,
      billingType,
      value,
      dueDate,
      description
    });

    return response.data;

  } catch (error) {
    logger.error("Asaas error:", error);
    throw new AppError("Erro ao criar cobrança Asaas", 500);
  }
};
```

---

## Social Media

### Facebook Messenger

**Localização**: `services/FacebookServices/`
**Features**: Receber e enviar mensagens via Messenger

#### Setup

```bash
# Configurar .env
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_PAGE_ACCESS_TOKEN=...
FACEBOOK_VERIFY_TOKEN=random-string-123
```

#### Webhook Verification

```typescript
// controllers/api/FacebookWebhookController.ts
export const verifyFacebookWebhook = (
  req: Request,
  res: Response
): Response => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};
```

#### Receber Mensagens

```typescript
export const handleFacebookWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { entry } = req.body;

    for (const event of entry) {
      const messaging = event.messaging[0];

      if (messaging.message) {
        await handleFacebookMessage(messaging);
      }
    }

    return res.status(200).json({ status: "ok" });

  } catch (error) {
    logger.error("Facebook webhook error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const handleFacebookMessage = async (messaging: any): Promise<void> => {
  const senderId = messaging.sender.id;
  const messageText = messaging.message.text;

  // Busca ou cria contato
  const [contact] = await Contact.findOrCreate({
    where: { facebookId: senderId },
    defaults: {
      name: `Facebook ${senderId}`,
      number: senderId,
      facebookId: senderId,
      companyId: 1 // configurar
    }
  });

  // Busca ou cria ticket
  let ticket = await Ticket.findOne({
    where: {
      contactId: contact.id,
      status: { [Op.in]: ["open", "pending"] },
      channel: "facebook"
    }
  });

  if (!ticket) {
    ticket = await CreateTicketService({
      contactId: contact.id,
      status: "pending",
      companyId: contact.companyId,
      channel: "facebook"
    });
  }

  // Cria mensagem
  await CreateMessageService({
    ticketId: ticket.id,
    body: messageText,
    fromMe: false,
    read: false
  });

  // Processa chatbot se configurado
  await handleChatbot(ticket, messageText);
};
```

#### Enviar Mensagens

```typescript
import axios from "axios";

const sendFacebookMessage = async (
  recipientId: string,
  message: string
): Promise<void> => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message }
      },
      {
        params: {
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        }
      }
    );
  } catch (error) {
    logger.error("Facebook send error:", error);
    throw error;
  }
};
```

---

### Instagram Direct

**Localização**: `services/FacebookServices/` (usa mesma API)
**Features**: Mensagens via Instagram Direct

Similar ao Facebook Messenger, mas com `channel: "instagram"`.

---

## ERP & CRM

### Bling

**Localização**: `services/BlingService/`
**Features**: Integração com ERP Bling

#### Criar Pedido

```typescript
import axios from "axios";

const blingApi = axios.create({
  baseURL: "https://bling.com.br/Api/v2",
  params: {
    apikey: process.env.BLING_API_KEY
  }
});

interface CreateOrderRequest {
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  itens: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
    valorunidade: number;
  }>;
}

const CreateBlingOrder = async (data: CreateOrderRequest): Promise<any> => {
  try {
    const xml = `
      <pedido>
        <cliente>
          <nome>${data.cliente.nome}</nome>
          <email>${data.cliente.email}</email>
          <fone>${data.cliente.telefone}</fone>
        </cliente>
        <itens>
          ${data.itens.map(item => `
            <item>
              <codigo>${item.codigo}</codigo>
              <descricao>${item.descricao}</descricao>
              <quantidade>${item.quantidade}</quantidade>
              <valorunidade>${item.valorunidade}</valorunidade>
            </item>
          `).join('')}
        </itens>
      </pedido>
    `;

    const response = await blingApi.post("/pedido/json/", {
      xml
    });

    return response.data;

  } catch (error) {
    logger.error("Bling error:", error);
    throw new AppError("Erro ao criar pedido no Bling", 500);
  }
};
```

---

### Supabase

**Localização**: `services/SupabaseService/`
**Features**: Backend as a Service

#### Setup

```bash
# Instalar
npm install @supabase/supabase-js

# Configurar .env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

#### Uso

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Inserir dados
const { data, error } = await supabase
  .from("contacts")
  .insert([
    { name: "João", phone: "11999999999" }
  ]);

// Buscar dados
const { data: contacts } = await supabase
  .from("contacts")
  .select("*")
  .eq("company_id", 1);
```

---

## Configuração

### Variáveis de Ambiente

```.env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORGANIZATION=org-...

# Dialogflow
DIALOGFLOW_PROJECT_ID=my-project-123
DIALOGFLOW_CREDENTIALS='{"type":"service_account",...}'

# Google Gemini
GEMINI_API_KEY=AIza...

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-...

# Asaas
ASAAS_API_KEY=$aact_...
ASAAS_ENVIRONMENT=sandbox

# Facebook/Instagram
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_PAGE_ACCESS_TOKEN=...
FACEBOOK_VERIFY_TOKEN=...

# Bling
BLING_API_KEY=...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Troubleshooting

### OpenAI Rate Limit

**Erro**: `429 Too Many Requests`

**Solução**:
```typescript
// Implementar retry com backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### Dialogflow Credentials Invalid

**Erro**: `UNAUTHENTICATED`

**Solução**:
- Verificar se JSON das credentials está correto
- Verificar permissões da service account
- Regenerar credenciais no Google Cloud Console

### Webhook Timeout

**Erro**: `ETIMEDOUT`

**Solução**:
```typescript
// Aumentar timeout
axios.post(url, data, {
  timeout: 30000 // 30 segundos
});

// Ou processar assincronamente
await queue.add("SendWebhook", { url, data });
```

---

**Versão:** 1.0.0
**Última Atualização:** 2025-10-12
**Total de Linhas:** ~1.500
