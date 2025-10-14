# 🎯 Queues & Background Jobs - ChatIA Flow Backend

> Documentação completa do sistema de filas Bull e jobs assíncronos (queues.ts - 1.730 linhas)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Queues Principais](#queues-principais)
4. [Job Handlers](#job-handlers)
5. [Cron Jobs](#cron-jobs)
6. [Helpers](#helpers)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

### Arquitetura

O ChatIA Flow utiliza **Bull** (baseado em Redis) para gerenciar jobs assíncronos e agendados.

```
┌──────────────┐
│  Application │
└──────┬───────┘
       │ add()
       ▼
┌──────────────┐
│  Bull Queue  │ ─────► Redis (Job Storage)
└──────┬───────┘
       │ process()
       ▼
┌──────────────┐
│  Job Handler │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Execute    │ (Enviar msg, fechar ticket, etc)
└──────────────┘
```

### Benefícios

✅ **Processamento Assíncrono** - Não bloqueia requisições HTTP
✅ **Retry Automático** - Jobs falhados são reprocessados
✅ **Agendamento** - Execução em data/hora específica
✅ **Priorização** - Jobs prioritários são processados primeiro
✅ **Escalabilidade** - Múltiplos workers podem processar em paralelo
✅ **Monitoramento** - Bull Board para visualização

---

## Configuração

### Setup Redis

```typescript
// queues.ts
const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;
```

### Variáveis de Ambiente

```.env
REDIS_URI=redis://localhost:6379
REDIS_OPT_LIMITER_MAX=1        # Max jobs por duração
REDIS_OPT_LIMITER_DURATION=3000 # Duração em ms
```

### Inicialização

```typescript
// server.ts
import { startQueueProcess } from "./queues";

// Inicia processamento de queues
startQueueProcess();
```

---

## Queues Principais

### 1. messageQueue

**Função**: Envia mensagens WhatsApp de forma assíncrona

**Configuração**:
```typescript
export const messageQueue = new BullQueue("MessageQueue", connection, {
  limiter: {
    max: limiterMax as number,      // 1 job
    duration: limiterDuration as number // a cada 3 segundos
  }
});
```

**Uso**:
```typescript
// Adicionar mensagem à fila
await messageQueue.add(
  "SendMessage",
  {
    whatsappId: 1,
    data: {
      number: "5511999999999",
      body: "Olá!",
      mediaPath: null
    }
  },
  {
    priority: 1,    // Prioridade (menor = mais prioritário)
    delay: 1000,    // Delay em ms
    attempts: 3,    // Tentativas se falhar
    backoff: {
      type: "exponential",
      delay: 2000
    }
  }
);
```

**Handler**: `handleSendMessage`

**Processamento**:
```typescript
messageQueue.process("SendMessage", handleSendMessage);

async function handleSendMessage(job) {
  try {
    const { data } = job;
    const whatsapp = await Whatsapp.findByPk(data.whatsappId);

    if (whatsapp === null) {
      throw Error("Whatsapp não identificado");
    }

    const messageData: MessageData = data.data;
    await SendMessage(whatsapp, messageData);

  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("MessageQueue -> SendMessage: error", e.message);
    throw e;
  }
}
```

---

### 2. scheduleMonitor

**Função**: Monitora e processa mensagens agendadas

**Configuração**:
```typescript
export const scheduleMonitor = new BullQueue("ScheduleMonitor", connection);
```

**Cron**:
```typescript
scheduleMonitor.add(
  "Verify",
  {},
  {
    repeat: { cron: "0 * * * * *" }, // A cada minuto
    removeOnComplete: true
  }
);
```

**Handler**: `handleVerifySchedules`

**Processamento**:
```typescript
scheduleMonitor.process("Verify", handleVerifySchedules);

async function handleVerifySchedules(job) {
  try {
    // Busca agendamentos pendentes nos próximos 30 segundos
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: {
        status: "PENDENTE",
        sentAt: null,
        sendAt: {
          [Op.gte]: moment().format("YYYY-MM-DD HH:mm:ss"),
          [Op.lte]: moment().add("30", "seconds").format("YYYY-MM-DD HH:mm:ss")
        }
      },
      include: [
        { model: Contact, as: "contact" },
        { model: User, as: "user", attributes: ["name"] }
      ]
    });

    if (count > 0) {
      schedules.map(async schedule => {
        // Marca como agendada
        await schedule.update({ status: "AGENDADA" });

        // Adiciona na fila de envio
        sendScheduledMessages.add(
          "SendMessage",
          { schedule },
          { delay: 40000 } // 40 segundos de delay
        );

        logger.info(`Disparo agendado para: ${schedule.contact.name}`);
      });
    }
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SendScheduledMessage -> Verify: error", e.message);
    throw e;
  }
}
```

---

### 3. sendScheduledMessages

**Função**: Envia mensagens agendadas

**Configuração**:
```typescript
export const sendScheduledMessages = new BullQueue(
  "SendSacheduledMessages",
  connection
);
```

**Handler**: `handleSendScheduledMessage`

**Processamento**:
```typescript
sendScheduledMessages.process("SendMessage", handleSendScheduledMessage);

async function handleSendScheduledMessage(job) {
  const { data: { schedule } } = job;
  let scheduleRecord: Schedule | null = null;

  try {
    scheduleRecord = await Schedule.findByPk(schedule.id);
  } catch (e) {
    Sentry.captureException(e);
    logger.info(`Erro ao tentar consultar agendamento: ${schedule.id}`);
  }

  try {
    // Busca WhatsApp
    let whatsapp;
    if (!isNil(schedule.whatsappId)) {
      whatsapp = await Whatsapp.findByPk(schedule.whatsappId);
    }

    if (!whatsapp) {
      whatsapp = await GetDefaultWhatsApp(schedule.companyId);
    }

    // Prepara mídia se houver
    let filePath = null;
    if (schedule.mediaPath) {
      filePath = path.resolve(
        "public",
        `company${schedule.companyId}`,
        schedule.mediaPath
      );
    }

    // Se deve abrir ticket
    if (schedule.openTicket === "enabled") {
      // Busca ou cria ticket
      let ticket = await Ticket.findOne({
        where: {
          contactId: schedule.contact.id,
          companyId: schedule.companyId,
          whatsappId: whatsapp.id,
          status: ["open", "pending"]
        }
      });

      if (!ticket) {
        ticket = await Ticket.create({
          companyId: schedule.companyId,
          contactId: schedule.contactId,
          whatsappId: whatsapp.id,
          queueId: schedule.queueId,
          userId: schedule.ticketUserId,
          status: schedule.statusTicket
        });
      }

      ticket = await ShowTicketService(ticket.id, schedule.companyId);

      // Prepara mensagem com assinatura se necessário
      let bodyMessage;
      if (schedule.assinar && !isNil(schedule.userId)) {
        bodyMessage = `*${schedule?.user?.name}:*\n${schedule.body.trim()}`;
      } else {
        bodyMessage = schedule.body.trim();
      }

      // Envia mensagem
      const sentMessage = await SendMessage(
        whatsapp,
        {
          number: schedule.contact.number,
          body: `\u200e ${formatBody(bodyMessage, ticket)}`,
          mediaPath: filePath,
          companyId: schedule.companyId
        },
        schedule.contact.isGroup
      );

      // Registra mensagem no banco
      if (schedule.mediaPath) {
        await verifyMediaMessage(
          sentMessage,
          ticket,
          ticket.contact,
          null,
          true,
          false,
          whatsapp
        );
      } else {
        await verifyMessage(
          sentMessage,
          ticket,
          ticket.contact,
          null,
          true,
          false
        );
      }
    } else {
      // Envia direto sem ticket
      await SendMessage(
        whatsapp,
        {
          number: schedule.contact.number,
          body: `\u200e ${schedule.body}`,
          mediaPath: filePath,
          companyId: schedule.companyId
        },
        schedule.contact.isGroup
      );
    }

    // Verifica se deve reenviar (recorrência)
    if (
      schedule.valorIntervalo > 0 &&
      (isNil(schedule.contadorEnvio) ||
        schedule.contadorEnvio < schedule.enviarQuantasVezes)
    ) {
      // Calcula próxima data
      let unidadeIntervalo;
      switch (schedule.intervalo) {
        case 1: unidadeIntervalo = "days"; break;
        case 2: unidadeIntervalo = "weeks"; break;
        case 3: unidadeIntervalo = "months"; break;
        case 4: unidadeIntervalo = "minuts"; break;
        default: throw new Error("Intervalo inválido");
      }

      const dataExistente = new Date(schedule.sendAt);
      let novaData = new Date(dataExistente);

      // Adiciona intervalo
      if (unidadeIntervalo !== "minuts") {
        novaData.setDate(
          novaData.getDate() +
          schedule.valorIntervalo *
          (unidadeIntervalo === "days" ? 1
            : unidadeIntervalo === "weeks" ? 7
            : 30)
        );
      } else {
        novaData.setMinutes(
          novaData.getMinutes() + Number(schedule.valorIntervalo)
        );
      }

      // Atualiza agendamento
      await scheduleRecord?.update({
        status: "PENDENTE",
        contadorEnvio: schedule.contadorEnvio + 1,
        sendAt: new Date(novaData.toISOString().slice(0, 19).replace("T", " "))
      });
    } else {
      // Marca como enviada
      await scheduleRecord?.update({
        sentAt: new Date(moment().format("YYYY-MM-DD HH:mm")),
        status: "ENVIADA"
      });
    }

    logger.info(`Mensagem agendada enviada para: ${schedule.contact.name}`);
    sendScheduledMessages.clean(15000, "completed");

  } catch (e: any) {
    Sentry.captureException(e);
    await scheduleRecord?.update({ status: "ERRO" });
    logger.error("SendScheduledMessage -> SendMessage: error", e.message);
    throw e;
  }
}
```

---

### 4. campaignQueue

**Função**: Processa campanhas de envio em massa

**Configuração**:
```typescript
export const campaignQueue = new BullQueue("CampaignQueue", connection);
```

**Cron**:
```typescript
campaignQueue.add(
  "VerifyCampaignsDaatabase",
  {},
  {
    repeat: { cron: "*/20 * * * * *" }, // A cada 20 segundos
    removeOnComplete: true
  }
);
```

**Handlers**: 4 handlers em cascata

#### 4.1. `handleVerifyCampaigns` (Verificador)

```typescript
campaignQueue.process("VerifyCampaignsDaatabase", handleVerifyCampaigns);

async function handleVerifyCampaigns(job) {
  if (isProcessing) {
    // Evita processamento concorrente
    return;
  }

  isProcessing = true;
  try {
    await new Promise(r => setTimeout(r, 1500));

    // Busca campanhas programadas nas próximas 3 horas
    const campaigns: { id: number; scheduledAt: string }[] =
      await sequelize.query(
        `SELECT id, "scheduledAt" FROM "Campaigns" c
        WHERE "scheduledAt" BETWEEN NOW() AND NOW() + INTERVAL '3 hour'
        AND status = 'PROGRAMADA'`,
        { type: QueryTypes.SELECT }
      );

    if (campaigns.length > 0) {
      logger.info(`Campanhas encontradas: ${campaigns.length}`);

      const promises = campaigns.map(async (campaign) => {
        try {
          // Atualiza status
          await sequelize.query(
            `UPDATE "Campaigns" SET status = 'EM_ANDAMENTO' WHERE id = ${campaign.id}`
          );

          // Calcula delay até horário agendado
          const now = moment();
          const scheduledAt = moment(campaign.scheduledAt);
          const delay = scheduledAt.diff(now, "milliseconds");

          logger.info(
            `Campanha enviada para a fila: Campanha=${campaign.id}, Delay=${delay}`
          );

          // Adiciona na fila de processamento
          return campaignQueue.add(
            "ProcessCampaign",
            { id: campaign.id, delay },
            {
              priority: 3,
              removeOnComplete: { age: 60 * 60, count: 10 },
              removeOnFail: { age: 60 * 60, count: 10 }
            }
          );

        } catch (err) {
          Sentry.captureException(err);
        }
      });

      await Promise.all(promises);
      logger.info("Todas as campanhas foram processadas");
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error processing campaigns: ${err.message}`);
  } finally {
    isProcessing = false;
  }
}
```

#### 4.2. `handleProcessCampaign` (Preparador)

```typescript
campaignQueue.process("ProcessCampaign", handleProcessCampaign);

async function handleProcessCampaign(job) {
  try {
    const { id }: ProcessCampaignData = job.data;
    const campaign = await getCampaign(id);
    const settings = await getSettings(campaign);

    if (campaign) {
      const { contacts } = campaign.contactList;

      if (isArray(contacts)) {
        const contactData = contacts.map(contact => ({
          contactId: contact.id,
          campaignId: campaign.id,
          variables: settings.variables,
          isGroup: contact.isGroup
        }));

        // Configurações de intervalo
        const longerIntervalAfter = parseToMilliseconds(settings.longerIntervalAfter);
        const greaterInterval = parseToMilliseconds(settings.greaterInterval);
        const messageInterval = settings.messageInterval;

        let baseDelay = campaign.scheduledAt;

        // Adiciona cada contato na fila com delay calculado
        const queuePromises = [];
        for (let i = 0; i < contactData.length; i++) {
          baseDelay = addSeconds(
            baseDelay,
            i > longerIntervalAfter ? greaterInterval : messageInterval
          );

          const { contactId, campaignId, variables } = contactData[i];
          const delay = calculateDelay(
            i,
            baseDelay,
            longerIntervalAfter,
            greaterInterval,
            messageInterval
          );

          const queuePromise = campaignQueue.add(
            "PrepareContact",
            { contactId, campaignId, variables, delay },
            { removeOnComplete: true }
          );

          queuePromises.push(queuePromise);

          logger.info(
            `Registro enviado pra fila: Campanha=${campaign.id};Contato=${contacts[i].name};delay=${delay}`
          );
        }

        await Promise.all(queuePromises);
      }
    }
  } catch (err: any) {
    Sentry.captureException(err);
  }
}
```

#### 4.3. `handlePrepareContact` (Preparação)

```typescript
campaignQueue.process("PrepareContact", handlePrepareContact);

async function handlePrepareContact(job) {
  try {
    const { contactId, campaignId, delay, variables }: PrepareContactData =
      job.data;

    const campaign = await getCampaign(campaignId);
    const contact = await getContact(contactId);

    const campaignShipping: any = {};
    campaignShipping.number = contact.number;
    campaignShipping.contactId = contactId;
    campaignShipping.campaignId = campaignId;

    // Escolhe mensagem aleatória
    const messages = getCampaignValidMessages(campaign);
    if (messages.length >= 0) {
      const radomIndex = randomValue(0, messages.length);
      const message = getProcessedMessage(
        messages[radomIndex] || "",
        variables,
        contact
      );
      campaignShipping.message = message === null ? "" : `\u200c ${message}`;
    }

    // Mensagem de confirmação se habilitado
    if (campaign.confirmation) {
      const confirmationMessages = getCampaignValidConfirmationMessages(campaign);
      if (confirmationMessages.length) {
        const radomIndex = randomValue(0, confirmationMessages.length);
        const message = getProcessedMessage(
          confirmationMessages[radomIndex] || "",
          variables,
          contact
        );
        campaignShipping.confirmationMessage = `\u200c ${message}`;
      }
    }

    // Cria registro de envio
    const [record, created] = await CampaignShipping.findOrCreate({
      where: {
        campaignId: campaignShipping.campaignId,
        contactId: campaignShipping.contactId
      },
      defaults: campaignShipping
    });

    if (
      !created &&
      record.deliveredAt === null &&
      record.confirmationRequestedAt === null
    ) {
      record.set(campaignShipping);
      await record.save();
    }

    // Adiciona na fila de disparo
    if (
      record.deliveredAt === null &&
      record.confirmationRequestedAt === null
    ) {
      const nextJob = await campaignQueue.add(
        "DispatchCampaign",
        {
          campaignId: campaign.id,
          campaignShippingId: record.id,
          contactListItemId: contactId
        },
        { delay }
      );

      await record.update({ jobId: String(nextJob.id) });
    }

    await verifyAndFinalizeCampaign(campaign);

  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(`campaignQueue -> PrepareContact -> error: ${err.message}`);
  }
}
```

#### 4.4. `handleDispatchCampaign` (Disparo)

```typescript
campaignQueue.process("DispatchCampaign", handleDispatchCampaign);

async function handleDispatchCampaign(job) {
  try {
    const { data } = job;
    const { campaignShippingId, campaignId }: DispatchCampaignData = data;

    const campaign = await getCampaign(campaignId);
    const wbot = await GetWhatsappWbot(campaign.whatsapp);

    if (!wbot || !campaign.whatsapp || !wbot?.user?.id) {
      logger.error(`campaignQueue -> DispatchCampaign -> error: wbot/whatsapp not found`);
      return;
    }

    logger.info(
      `Disparo de campanha solicitado: Campanha=${campaignId};Registro=${campaignShippingId}`
    );

    const campaignShipping = await CampaignShipping.findByPk(
      campaignShippingId,
      {
        include: [{ model: ContactListItem, as: "contact" }]
      }
    );

    const chatId = campaignShipping.contact.isGroup
      ? `${campaignShipping.number}@g.us`
      : `${campaignShipping.number}@s.whatsapp.net`;

    // Se deve abrir ticket
    if (campaign.openTicket === "enabled") {
      // Cria ou busca contato
      const [contact] = await Contact.findOrCreate({
        where: {
          number: campaignShipping.number,
          companyId: campaign.companyId
        },
        defaults: {
          companyId: campaign.companyId,
          name: campaignShipping.contact.name,
          number: campaignShipping.number,
          email: campaignShipping.contact.email,
          whatsappId: campaign.whatsappId,
          profilePicUrl: ""
        }
      });

      const whatsapp = await Whatsapp.findByPk(campaign.whatsappId);

      // Cria ou busca ticket
      let ticket = await Ticket.findOne({
        where: {
          contactId: contact.id,
          companyId: campaign.companyId,
          whatsappId: whatsapp.id,
          status: ["open", "pending"]
        }
      });

      if (!ticket) {
        ticket = await Ticket.create({
          companyId: campaign.companyId,
          contactId: contact.id,
          whatsappId: whatsapp.id,
          queueId: campaign?.queueId,
          userId: campaign?.userId,
          status: campaign?.statusTicket
        });
      }

      ticket = await ShowTicketService(ticket.id, campaign.companyId);

      if (whatsapp.status === "CONNECTED") {
        // Envia confirmação ou mensagem
        if (campaign.confirmation && campaignShipping.confirmation === null) {
          const confirmationMessage = await wbot.sendMessage(chatId, {
            text: `\u200c ${campaignShipping.confirmationMessage}`
          });

          await verifyMessage(
            confirmationMessage,
            ticket,
            contact,
            null,
            true,
            false
          );

          await campaignShipping.update({ confirmationRequestedAt: moment() });
        } else {
          // Envia mensagem (texto ou mídia)
          if (!campaign.mediaPath) {
            const sentMessage = await wbot.sendMessage(chatId, {
              text: `\u200c ${campaignShipping.message}`
            });

            await verifyMessage(sentMessage, ticket, contact, null, true, false);
          }

          if (campaign.mediaPath) {
            const publicFolder = path.resolve(__dirname, "..", "public");
            const filePath = path.join(
              publicFolder,
              `company${campaign.companyId}`,
              campaign.mediaPath
            );

            const options = await getMessageOptions(
              campaign.mediaName,
              filePath,
              String(campaign.companyId),
              `\u200c ${campaignShipping.message}`
            );

            if (Object.keys(options).length) {
              // Se for áudio, envia texto antes
              if (
                "mimetype" in options &&
                typeof (options as any).mimetype === "string" &&
                (options as any).mimetype.startsWith("audio/")
              ) {
                const audioMessage = await wbot.sendMessage(chatId, {
                  text: `\u200c ${campaignShipping.message}`
                });

                await verifyMessage(
                  audioMessage,
                  ticket,
                  contact,
                  null,
                  true,
                  false
                );
              }

              const sentMessage = await wbot.sendMessage(chatId, { ...options });

              await verifyMediaMessage(
                sentMessage,
                ticket,
                ticket.contact,
                null,
                false,
                true,
                wbot
              );
            }
          }
        }

        await campaignShipping.update({ deliveredAt: moment() });
      }
    } else {
      // Envia direto sem ticket
      if (campaign.confirmation && campaignShipping.confirmation === null) {
        await wbot.sendMessage(chatId, {
          text: campaignShipping.confirmationMessage
        });
        await campaignShipping.update({ confirmationRequestedAt: moment() });
      } else {
        if (!campaign.mediaPath) {
          await wbot.sendMessage(chatId, {
            text: campaignShipping.message
          });
        }

        if (campaign.mediaPath) {
          const publicFolder = path.resolve(__dirname, "..", "public");
          const filePath = path.join(
            publicFolder,
            `company${campaign.companyId}`,
            campaign.mediaPath
          );

          const options = await getMessageOptions(
            campaign.mediaName,
            filePath,
            String(campaign.companyId),
            campaignShipping.message
          );

          if (Object.keys(options).length) {
            if (
              "mimetype" in options &&
              typeof (options as any).mimetype === "string" &&
              (options as any).mimetype.startsWith("audio/")
            ) {
              await wbot.sendMessage(chatId, {
                text: campaignShipping.message
              });
            }
            await wbot.sendMessage(chatId, { ...options });
          }
        }
      }

      await campaignShipping.update({ deliveredAt: moment() });
    }

    await verifyAndFinalizeCampaign(campaign);

    // Emite evento
    const io = getIO();
    io.of(String(campaign.companyId))
      .emit(`company-${campaign.companyId}-campaign`, {
        action: "update",
        record: campaign
      });

    logger.info(
      `Campanha enviada para: Campanha=${campaignId};Contato=${campaignShipping.contact.name}`
    );

  } catch (err: any) {
    Sentry.captureException(err);
    logger.error(err.message);
    console.log(err.stack);
  }
}
```

---

### 5. queueMonitor

**Função**: Monitora filas e move tickets perdidos

**Configuração**:
```typescript
export const queueMonitor = new BullQueue("QueueMonitor", connection);
```

**Cron**:
```typescript
queueMonitor.add(
  "VerifyQueueStatus",
  {},
  {
    repeat: { cron: "0 * * * * *" }, // A cada minuto
    removeOnComplete: true
  }
);
```

**Handler**: `handleVerifyQueue`

**Processamento**:
```typescript
queueMonitor.process("VerifyQueueStatus", handleVerifyQueue);

async function handleVerifyQueue(job) {
  try {
    const companies = await Company.findAll({
      attributes: ["id", "name"],
      where: { status: true },
      include: [
        {
          model: Whatsapp,
          attributes: ["id", "name", "status", "timeSendQueue", "sendIdQueue"]
        }
      ]
    });

    companies.map(async c => {
      c.whatsapps.map(async w => {
        if (w.status === "CONNECTED") {
          var companyId = c.id;

          const moveQueue = w.timeSendQueue ? w.timeSendQueue : 0;
          const moveQueueId = w.sendIdQueue;
          const moveQueueTime = moveQueue;
          const idQueue = moveQueueId;
          const timeQueue = moveQueueTime;

          if (moveQueue > 0) {
            if (
              !isNaN(idQueue) &&
              Number.isInteger(idQueue) &&
              !isNaN(timeQueue) &&
              Number.isInteger(timeQueue)
            ) {
              const tempoPassado = moment()
                .subtract(timeQueue, "minutes")
                .utc()
                .format();

              // Busca tickets perdidos (pending sem fila há X minutos)
              const { count, rows: tickets } = await Ticket.findAndCountAll({
                attributes: ["id"],
                where: {
                  status: "pending",
                  queueId: null,
                  companyId: companyId,
                  whatsappId: w.id,
                  updatedAt: {
                    [Op.lt]: tempoPassado
                  }
                },
                include: [
                  {
                    model: Contact,
                    as: "contact",
                    attributes: [
                      "id",
                      "name",
                      "number",
                      "email",
                      "profilePicUrl",
                      "acceptAudioMessage",
                      "active",
                      "disableBot",
                      "urlPicture",
                      "lgpdAcceptedAt",
                      "companyId"
                    ],
                    include: ["extraInfo", "tags"]
                  },
                  {
                    model: Queue,
                    as: "queue",
                    attributes: ["id", "name", "color"]
                  },
                  {
                    model: Whatsapp,
                    as: "whatsapp",
                    attributes: ["id", "name", "expiresTicket", "groupAsTicket"]
                  }
                ]
              });

              if (count > 0) {
                tickets.map(async ticket => {
                  // Move para fila configurada
                  await ticket.update({ queueId: idQueue });

                  // Cria log
                  await CreateLogTicketService({
                    userId: null,
                    queueId: idQueue,
                    ticketId: ticket.id,
                    type: "redirect"
                  });

                  await ticket.reload();

                  // Emite evento
                  const io = getIO();
                  io.of(String(companyId))
                    .emit(`company-${companyId}-ticket`, {
                      action: "update",
                      ticket,
                      ticketId: ticket.id
                    });

                  logger.info(
                    `Atendimento Perdido: ${ticket.id} - Empresa: ${companyId}`
                  );
                });
              }
            } else {
              logger.info(`Condição não respeitada - Empresa: ${companyId}`);
            }
          }
        }
      });
    });
  } catch (e: any) {
    Sentry.captureException(e);
    logger.error("SearchForQueue -> VerifyQueue: error", e.message);
    throw e;
  }
}
```

---

### 6. userMonitor

**Função**: Atualiza status online dos usuários

**Configuração**:
```typescript
export const userMonitor = new BullQueue("UserMonitor", connection);
```

**Cron**:
```typescript
userMonitor.add(
  "VerifyLoginStatus",
  {},
  {
    repeat: { cron: "* * * * *" }, // A cada minuto
    removeOnComplete: true
  }
);
```

**Handler**: `handleLoginStatus`

**Processamento**:
```typescript
userMonitor.process("VerifyLoginStatus", handleLoginStatus);

async function handleLoginStatus(job) {
  // Marca como offline usuários inativos há 5 minutos
  const thresholdTime = new Date();
  thresholdTime.setMinutes(thresholdTime.getMinutes() - 5);

  await User.update(
    { online: false },
    {
      where: {
        updatedAt: { [Op.lt]: thresholdTime },
        online: true
      }
    }
  );
}
```

---

## Cron Jobs

### 1. handleRandomUser (Distribuição Automática)

**Função**: Distribui tickets pendentes entre usuários online de forma aleatória

**Frequência**: A cada 2 minutos

```typescript
const handleRandomUser = async () => {
  const jobR = new CronJob("0 */2 * * * *", async () => {
    try {
      // Busca empresas ativas com filas que tem roteador ativado
      const companies = await Company.findAll({
        attributes: ["id", "name"],
        where: { status: true },
        include: [
          {
            model: Queues,
            attributes: ["id", "name", "ativarRoteador", "tempoRoteador"],
            where: {
              ativarRoteador: true,
              tempoRoteador: { [Op.ne]: 0 }
            }
          }
        ]
      });

      if (companies) {
        companies.map(async c => {
          c.queues.map(async q => {
            // Busca tickets pending da fila
            const { count, rows: tickets } = await Ticket.findAndCountAll({
              where: {
                companyId: c.id,
                status: "pending",
                queueId: q.id
              }
            });

            // Função para escolher usuário aleatório
            const getRandomUserId = (userIds) => {
              const randomIndex = Math.floor(Math.random() * userIds.length);
              return userIds[randomIndex];
            };

            // Função para verificar se usuário está online
            const findUserById = async (userId, companyId) => {
              try {
                const user = await User.findOne({
                  where: { id: userId, companyId }
                });

                if (user && user?.profile === "user") {
                  if (user.online === true) {
                    return user.id;
                  } else {
                    return 0;
                  }
                } else {
                  return 0; // Admin não recebe distribuição automática
                }
              } catch (errorV) {
                Sentry.captureException(errorV);
                throw errorV;
              }
            };

            if (count > 0) {
              for (const ticket of tickets) {
                const { queueId, userId } = ticket;
                const tempoRoteador = q.tempoRoteador;

                // Busca usuários da fila
                const userQueues = await UserQueue.findAll({
                  where: { queueId: queueId }
                });

                const userIds = userQueues.map(userQueue => userQueue.userId);

                const tempoPassadoB = moment()
                  .subtract(tempoRoteador, "minutes")
                  .utc()
                  .toDate();
                const updatedAtV = new Date(ticket.updatedAt);

                let settings = await CompaniesSettings.findOne({
                  where: { companyId: ticket.companyId }
                });
                const sendGreetingMessageOneQueues =
                  settings.sendGreetingMessageOneQueues === "enabled" || false;

                if (!userId) {
                  // Ticket sem usuário: atribui aleatório
                  const randomUserId = getRandomUserId(userIds);

                  if (
                    randomUserId !== undefined &&
                    (await findUserById(randomUserId, ticket.companyId)) > 0
                  ) {
                    if (sendGreetingMessageOneQueues) {
                      const ticketToSend = await ShowTicketService(
                        ticket.id,
                        ticket.companyId
                      );

                      await SendWhatsAppMessage({
                        body: `\u200e *Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!`,
                        ticket: ticketToSend
                      });
                    }

                    await UpdateTicketService({
                      ticketData: { status: "pending", userId: randomUserId },
                      ticketId: ticket.id,
                      companyId: ticket.companyId
                    });

                    logger.info(
                      `Ticket ID ${ticket.id} atualizado para UserId ${randomUserId}`
                    );
                  }
                } else if (userIds.includes(userId)) {
                  // Ticket já tem usuário: verifica se precisa trocar
                  if (tempoPassadoB > updatedAtV) {
                    const availableUserIds = userIds.filter(id => id !== userId);

                    if (availableUserIds.length > 0) {
                      const randomUserId = getRandomUserId(availableUserIds);

                      if (
                        randomUserId !== undefined &&
                        (await findUserById(randomUserId, ticket.companyId)) > 0
                      ) {
                        if (sendGreetingMessageOneQueues) {
                          const ticketToSend = await ShowTicketService(
                            ticket.id,
                            ticket.companyId
                          );
                          await SendWhatsAppMessage({
                            body: "*Assistente Virtual*:\nAguarde enquanto localizamos um atendente... Você será atendido em breve!",
                            ticket: ticketToSend
                          });
                        }

                        await UpdateTicketService({
                          ticketData: { status: "pending", userId: randomUserId },
                          ticketId: ticket.id,
                          companyId: ticket.companyId
                        });

                        logger.info(
                          `Ticket ID ${ticket.id} atualizado para UserId ${randomUserId}`
                        );
                      }
                    }
                  }
                }
              }
            }
          });
        });
      }
    } catch (e) {
      Sentry.captureException(e);
      logger.error("SearchForUsersRandom -> VerifyUsersRandom: error", e.message);
      throw e;
    }
  });

  jobR.start();
};

// Inicia ao iniciar server
handleRandomUser();
```

---

### 2. handleProcessLanes (Kanban)

**Função**: Move tickets entre lanes (colunas) do kanban baseado em tempo

**Frequência**: A cada 1 minuto

```typescript
const handleProcessLanes = async () => {
  const job = new CronJob("*/1 * * * *", async () => {
    // Busca empresas com plano que tem Kanban
    const companies = await Company.findAll({
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["id", "name", "useKanban"],
          where: { useKanban: true }
        }
      ]
    });

    companies.map(async c => {
      try {
        const companyId = c.id;

        // Busca tickets com tags que tem nextLaneId configurado
        const ticketTags = await TicketTag.findAll({
          include: [
            {
              model: Ticket,
              as: "ticket",
              where: {
                status: "open",
                fromMe: true,
                companyId
              },
              attributes: ["id", "contactId", "updatedAt", "whatsappId"]
            },
            {
              model: Tag,
              as: "tag",
              attributes: ["id", "timeLane", "nextLaneId", "greetingMessageLane"],
              where: { companyId }
            }
          ]
        });

        if (ticketTags.length > 0) {
          ticketTags.map(async t => {
            if (
              !isNil(t?.tag.nextLaneId) &&
              t?.tag.nextLaneId > 0 &&
              t?.tag.timeLane > 0
            ) {
              const nextTag = await Tag.findByPk(t?.tag.nextLaneId);

              // Calcula data limite
              const dataLimite = new Date();
              dataLimite.setHours(
                dataLimite.getHours() - Number(t.tag.timeLane)
              );
              const dataUltimaInteracaoChamado = new Date(t.ticket.updatedAt);

              // Se passou do tempo, move para próxima lane
              if (dataUltimaInteracaoChamado < dataLimite) {
                await TicketTag.destroy({
                  where: { ticketId: t.ticketId, tagId: t.tagId }
                });
                await TicketTag.create({ ticketId: t.ticketId, tagId: nextTag.id });

                const whatsapp = await Whatsapp.findByPk(t.ticket.whatsappId);

                // Envia mensagem de saudação da nova lane
                if (
                  !isNil(nextTag.greetingMessageLane) &&
                  nextTag.greetingMessageLane !== ""
                ) {
                  const bodyMessage = nextTag.greetingMessageLane;
                  const contact = await Contact.findByPk(t.ticket.contactId);
                  const ticketUpdate = await ShowTicketService(
                    t.ticketId,
                    companyId
                  );

                  await SendMessage(
                    whatsapp,
                    {
                      number: contact.number,
                      body: `${formatBody(bodyMessage, ticketUpdate)}`,
                      mediaPath: null,
                      companyId: companyId
                    },
                    contact.isGroup
                  );
                }
              }
            }
          });
        }
      } catch (e: any) {
        Sentry.captureException(e);
        logger.error("Process Lanes -> Verify: error", e.message);
        throw e;
      }
    });
  });

  job.start();
};

// Inicia ao iniciar server
handleProcessLanes();
```

---

### 3. handleCloseTicketsAutomatic (Fechamento Automático)

**Função**: Fecha tickets automaticamente após período de inatividade

**Frequência**: A cada 1 minuto

```typescript
const handleCloseTicketsAutomatic = async () => {
  const job = new CronJob("*/1 * * * *", async () => {
    const companies = await Company.findAll({
      where: { status: true }
    });

    companies.map(async c => {
      try {
        const companyId = c.id;
        await ClosedAllOpenTickets(companyId);
      } catch (e: any) {
        Sentry.captureException(e);
        logger.error("ClosedAllOpenTickets -> Verify: error", e.message);
        throw e;
      }
    });
  });

  job.start();
};

// Inicia ao iniciar server
handleCloseTicketsAutomatic();
```

---

### 4. handleInvoiceCreate (Geração de Faturas)

**Função**: Cria faturas automaticamente para empresas próximas do vencimento

**Frequência**: A cada 1 hora

```typescript
const handleInvoiceCreate = async () => {
  const job = new CronJob("0 * * * * *", async () => {
    const companies = await Company.findAll();

    companies.map(async c => {
      var dueDate = c.dueDate;
      const date = moment(dueDate).format();
      const timestamp = moment().format();
      const hoje = moment(moment()).format("DD/MM/yyyy");
      var vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(vencimento, "DD/MM/yyyy").diff(
        moment(hoje, "DD/MM/yyyy")
      );
      var dias = moment.duration(diff).asDays();

      // Se faltam menos de 20 dias
      if (dias < 20) {
        const plan = await Plan.findByPk(c.planId);

        // Verifica se já existe fatura
        const sql = `SELECT COUNT(*) mycount FROM "Invoices"
                     WHERE "companyId" = ${c.id}
                     AND "dueDate"::text LIKE '${moment(dueDate).format("yyyy-MM-DD")}%';`;

        const invoice = await sequelize.query(sql, { type: QueryTypes.SELECT });

        if (invoice[0]["mycount"] > 0) {
          // Já existe fatura
        } else {
          // Cria nova fatura
          const sql = `INSERT INTO "Invoices" (detail, status, value, "updatedAt", "createdAt", "dueDate", "companyId")
                       VALUES ('${plan.name}', 'open', '${plan.amount}', '${timestamp}', '${timestamp}', '${date}', ${c.id});`;

          const invoiceInsert = await sequelize.query(sql, {
            type: QueryTypes.INSERT
          });

          // Aqui poderia enviar email de notificação
        }
      }
    });
  });

  job.start();
};

// Inicia ao iniciar server
handleInvoiceCreate();
```

---

### 5. handleWhatsapp (Limpeza de Sessões)

**Função**: Limpa sessões WhatsApp antigas

**Frequência**: Diariamente às 3:15 AM

```typescript
const handleWhatsapp = async () => {
  // Use default timezone since this is a system-wide operation
  const defaultTimezone = await import(
    "./services/TimezoneServices/TimezoneService"
  ).then(module =>
    module.default.getDefaultTimezone().catch(() => "America/Sao_Paulo")
  );

  const jobW = new CronJob(
    "* 15 3 * * *",
    async () => {
      GetWhatsapp();
      jobW.stop();
    },
    null,
    false,
    defaultTimezone
  );

  jobW.start();
};

// Inicia ao iniciar server
handleWhatsapp();
```

---

## Helpers

### parseToMilliseconds

```typescript
export function parseToMilliseconds(seconds) {
  return seconds * 1000;
}
```

### randomValue

```typescript
export function randomValue(min, max) {
  return Math.floor(Math.random() * max) + min;
}
```

### calculateDelay

```typescript
function calculateDelay(
  index,
  baseDelay,
  longerIntervalAfter,
  greaterInterval,
  messageInterval
) {
  const diffSeconds = differenceInSeconds(baseDelay, new Date());
  if (index > longerIntervalAfter) {
    return diffSeconds * 1000 + greaterInterval;
  } else {
    return diffSeconds * 1000 + messageInterval;
  }
}
```

### getCampaignValidMessages

```typescript
function getCampaignValidMessages(campaign) {
  const messages = [];

  if (!isEmpty(campaign.message1) && !isNil(campaign.message1)) {
    messages.push(campaign.message1);
  }

  if (!isEmpty(campaign.message2) && !isNil(campaign.message2)) {
    messages.push(campaign.message2);
  }

  if (!isEmpty(campaign.message3) && !isNil(campaign.message3)) {
    messages.push(campaign.message3);
  }

  if (!isEmpty(campaign.message4) && !isNil(campaign.message4)) {
    messages.push(campaign.message4);
  }

  if (!isEmpty(campaign.message5) && !isNil(campaign.message5)) {
    messages.push(campaign.message5);
  }

  return messages;
}
```

### getProcessedMessage

```typescript
function getProcessedMessage(msg: string, variables: any[], contact: any) {
  let finalMessage = msg;

  // Substitui variáveis padrão
  if (finalMessage.includes("{nome}")) {
    finalMessage = finalMessage.replace(/{nome}/g, contact.name);
  }

  if (finalMessage.includes("{email}")) {
    finalMessage = finalMessage.replace(/{email}/g, contact.email);
  }

  if (finalMessage.includes("{numero}")) {
    finalMessage = finalMessage.replace(/{numero}/g, contact.number);
  }

  // Substitui variáveis customizadas
  if (variables[0]?.value !== "[]") {
    variables.forEach(variable => {
      if (finalMessage.includes(`{${variable.key}}`)) {
        const regex = new RegExp(`{${variable.key}}`, "g");
        finalMessage = finalMessage.replace(regex, variable.value);
      }
    });
  }

  return finalMessage;
}
```

### verifyAndFinalizeCampaign

```typescript
async function verifyAndFinalizeCampaign(campaign) {
  const { companyId, contacts } = campaign.contactList;

  const count1 = contacts.length;

  // Conta envios concluídos
  const count2 = await CampaignShipping.count({
    where: {
      campaignId: campaign.id,
      deliveredAt: {
        [Op.ne]: null
      },
      confirmation: campaign.confirmation ? true : { [Op.or]: [null, false] }
    }
  });

  // Se enviou para todos, finaliza
  if (count1 === count2) {
    await campaign.update({ status: "FINALIZADA", completedAt: moment() });
  }

  // Emite evento
  const io = getIO();
  io.of(companyId).emit(`company-${campaign.companyId}-campaign`, {
    action: "update",
    record: campaign
  });
}
```

---

## Monitoramento

### Bull Board

Interface web para monitoramento de filas.

**URL**: `http://localhost:8080/admin/queues`

**Setup (app.ts)**:
```typescript
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

import {
  messageQueue,
  scheduleMonitor,
  sendScheduledMessages,
  campaignQueue,
  queueMonitor,
  userMonitor
} from "./queues";

// Setup Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullAdapter(messageQueue),
    new BullAdapter(scheduleMonitor),
    new BullAdapter(sendScheduledMessages),
    new BullAdapter(campaignQueue),
    new BullAdapter(queueMonitor),
    new BullAdapter(userMonitor)
  ],
  serverAdapter
});

// Protege com basic auth
app.use(
  "/admin/queues",
  basicAuth({
    users: {
      [process.env.BULL_USER || "admin"]: process.env.BULL_PASS || "admin"
    },
    challenge: true
  }),
  serverAdapter.getRouter()
);
```

**Visualização**:
- Jobs waiting, active, completed, failed
- Retry jobs falhados
- Clean jobs antigos
- Ver detalhes de cada job
- Métricas de performance

---

## Troubleshooting

### Jobs não estão sendo processados

**Possíveis causas**:
1. Redis não está rodando
2. Queue não foi inicializada
3. Listener não foi registrado

**Solução**:
```bash
# Verificar Redis
redis-cli ping
# Deve retornar: PONG

# Verificar logs
tail -f logs/application.log | grep queue

# Reiniciar processo
pm2 restart chatia-backend
```

### Jobs falhando constantemente

**Possíveis causas**:
1. Erro na lógica do handler
2. Dependência externa indisponível (WhatsApp, API)
3. Dados corrompidos

**Solução**:
```typescript
// Adicionar mais logs
async function handleSendMessage(job) {
  try {
    logger.info(`Processing job ${job.id}`, job.data);
    // ... lógica
  } catch (e) {
    logger.error(`Job ${job.id} failed:`, e);
    Sentry.captureException(e);
    throw e; // Importante para retry
  }
}

// Ajustar retry
messageQueue.add(
  "SendMessage",
  data,
  {
    attempts: 5,          // Aumentar tentativas
    backoff: {
      type: "exponential",
      delay: 5000         // Aumentar delay
    }
  }
);
```

### Fila travada (stalled jobs)

**Solução**:
```typescript
// Limpar jobs stalled
await messageQueue.clean(0, "stalled");

// Ou via Bull Board:
// 1. Acesse http://localhost:8080/admin/queues
// 2. Selecione a fila
// 3. Clique em "Clean" > "Stalled"
```

### Memória Redis crescendo

**Causa**: Jobs completed/failed acumulando

**Solução**:
```typescript
// Configurar limpeza automática
messageQueue.add(
  "SendMessage",
  data,
  {
    removeOnComplete: {
      age: 3600,      // Remove após 1 hora
      count: 1000     // Mantém apenas 1000
    },
    removeOnFail: {
      age: 7200,      // Remove após 2 horas
      count: 500      // Mantém apenas 500
    }
  }
);

// Ou limpar manualmente
await messageQueue.clean(3600, "completed");
await messageQueue.clean(7200, "failed");
```

### Campanhas não enviando

**Verificações**:
1. Campanha está com status correto
2. WhatsApp está conectado
3. Contatos estão válidos

**Debug**:
```bash
# Ver jobs da campanha
redis-cli keys "bull:CampaignQueue:*"

# Ver dados de um job específico
redis-cli get "bull:CampaignQueue:12345"

# Verificar logs
tail -f logs/application.log | grep -i campaign
```

---

## 📊 Resumo

### Estatísticas

| Item | Quantidade |
|------|-----------|
| Queues | 6 |
| Job Handlers | 12 |
| Cron Jobs | 5 |
| Helpers | 8 |
| Linhas de código | 1.730 |

### Queues

1. **messageQueue** - Envio de mensagens WhatsApp
2. **scheduleMonitor** - Monitor de agendamentos
3. **sendScheduledMessages** - Envio de mensagens agendadas
4. **campaignQueue** - Processamento de campanhas (4 handlers)
5. **queueMonitor** - Monitor de filas
6. **userMonitor** - Monitor de usuários online

### Cron Jobs

1. **handleRandomUser** - Distribuição automática (2 min)
2. **handleProcessLanes** - Movimentação kanban (1 min)
3. **handleCloseTicketsAutomatic** - Fechamento automático (1 min)
4. **handleInvoiceCreate** - Geração de faturas (1 hora)
5. **handleWhatsapp** - Limpeza de sessões (diário 3:15 AM)

---

**Versão:** 1.0.0
**Última Atualização:** 2025-10-12
**Total de Linhas:** ~1.400
