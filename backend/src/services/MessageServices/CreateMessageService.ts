import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import Whatsapp from "../../models/Whatsapp";
import StartLaneTimerService from "../TicketServices/StartLaneTimerService";
import HandleCustomerResponseService from "../TicketServices/HandleCustomerResponseService";

export interface MessageData {
  wid: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  ack?: number;
  queueId?: number;
  channel?: string;
  ticketTrakingId?: number;
  isPrivate?: boolean;
  ticketImported?: any;
  isForwarded?: boolean;
}
interface Request {
  messageData: MessageData;
  companyId: number;
}

const CreateMessageService = async ({
  messageData,
  companyId
}: Request): Promise<Message> => {
  // 🔒 ANTI-DUPLICAÇÃO: Verificar se mensagem já existe antes de criar
  const existingMessage = await Message.findOne({
    where: {
      wid: messageData.wid,
      companyId
    },
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id", "uuid", "status", "queueId", "contactId", "whatsappId", "userId", "isGroup", "companyId"],
        include: [
          {
            model: Contact,
            attributes: [
              "id",
              "name",
              "number",
              "email",
              "profilePicUrl",
              "acceptAudioMessage",
              "active",
              "urlPicture",
              "companyId"
            ],
            include: ["extraInfo", "tags"]
          },
          {
            model: Queue,
            attributes: ["id", "name", "color"]
          },
          {
            model: Whatsapp,
            attributes: ["id", "name", "groupAsTicket"]
          },
          {
            model: User,
            attributes: ["id", "name"]
          },
          {
            model: Tag,
            as: "tags",
            attributes: ["id", "name", "color"]
          }
        ]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (existingMessage) {
    console.log(`⚠️ [CreateMessageService] Mensagem já existe (wid: ${messageData.wid}, id: ${existingMessage.id}), retornando existente`);
    return existingMessage;
  }

  // Criar nova mensagem
  await Message.upsert({ ...messageData, companyId });

  const message = await Message.findOne({
    where: {
      wid: messageData.wid,
      companyId
    },
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id", "uuid", "status", "queueId", "contactId", "whatsappId", "userId", "isGroup", "companyId"],
        include: [
          {
            model: Contact,
            attributes: [
              "id",
              "name",
              "number",
              "email",
              "profilePicUrl",
              "acceptAudioMessage",
              "active",
              "urlPicture",
              "companyId"
            ],
            include: ["extraInfo", "tags"]
          },
          {
            model: Queue,
            attributes: ["id", "name", "color"]
          },
          {
            model: Whatsapp,
            attributes: ["id", "name", "groupAsTicket"]
          },
          {
            model: User,
            attributes: ["id", "name"]
          },
          {
            model: Tag,
            as: "tags",
            attributes: ["id", "name", "color"]
          }
        ]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new Error("ERR_CREATING_MESSAGE");
  }

  if (message.ticket?.queueId != null && message.queueId == null) {
    await message.update({ queueId: message.ticket.queueId });
  }

  if (message.isPrivate) {
    await message.update({ wid: `PVT${message.id}` });
  }

  const io = getIO();

  // ✅ DEBUG: Sempre logar, mesmo quando não emitir
  console.log("🔍 [CreateMessageService] Verificando condições de emissão:", {
    ticketImported: messageData?.ticketImported,
    willEmit: !messageData?.ticketImported,
    messageId: message.id,
    messageWid: message.wid,
    companyId
  });

  if (!messageData?.ticketImported) {
    // Debug log para verificar o ticket UUID
    console.log("🚀 [CreateMessageService] Emitindo evento Socket.IO:", {
      ticketId: message.ticket?.id,
      ticketUuid: message.ticket?.uuid,
      hasTicket: !!message.ticket,
      companyId,
      namespace: `/workspace-${companyId}`,
      channel: `company-${companyId}-appMessage`
    });

    const payload = {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    };

    // ✅ CORREÇÃO: Emitir para o namespace correto /workspace-{companyId}
    const workspaceNamespace = io.of(`/workspace-${companyId}`);

    // Emitir para todos os clientes conectados ao namespace
    workspaceNamespace.emit(`company-${companyId}-appMessage`, payload);

    // Emitir também para o room específico do ticket (para clientes que entraram no room)
    workspaceNamespace.to(message.ticket?.uuid || String(message.ticketId)).emit(`company-${companyId}-appMessage`, payload);

    console.log("✅ [CreateMessageService] Evento emitido com sucesso para namespace /workspace-" + companyId);
  } else {
    console.log("⏭️ [CreateMessageService] Emissão Socket.IO PULADA (ticketImported = true)");
  }

  // 🎯 KANBAN LANE TIMER: Gerenciar movimento automático de cards
  if (!messageData?.ticketImported && !message.isPrivate && message.ticketId) {
    try {
      // 🔍 DEBUG: Log detalhado para investigar problema de movimento para Retorno
      console.log(`
╔════════════════════════════════════════════════════════════
║ 🔍 KANBAN DEBUG - CreateMessageService
╠════════════════════════════════════════════════════════════
║ Timestamp:        ${new Date().toISOString()}
║ Message ID:       ${message.id}
║ Ticket ID:        ${message.ticketId}
║ Company ID:       ${companyId}
║ fromMe:           ${message.fromMe}
║ isPrivate:        ${message.isPrivate}
║ ticketImported:   ${messageData?.ticketImported || 'false'}
║
║ Decisão: ${message.fromMe ? 'StartLaneTimerService ✅' : 'HandleCustomerResponseService ❌'}
╚════════════════════════════════════════════════════════════
`);

      if (message.fromMe) {
        // Mensagem do atendente -> Iniciar timer para mover para nextLaneId
        console.log(`✅ [CreateMessageService] Chamando StartLaneTimerService para ticket ${message.ticketId}`);
        await StartLaneTimerService({
          ticketId: message.ticketId,
          companyId
        });
      } else {
        // Mensagem do cliente -> Cancelar timer e mover para rollbackLaneId se configurado
        console.log(`❌ [CreateMessageService] Chamando HandleCustomerResponseService para ticket ${message.ticketId} (MENSAGEM DO CLIENTE)`);
        await HandleCustomerResponseService({
          ticketId: message.ticketId,
          companyId
        });
      }
    } catch (error) {
      // Não bloqueia a criação da mensagem se houver erro no timer
      console.error("❌ [CreateMessageService] Erro ao processar timer de lane:", error);
    }
  }

  return message;
};

export default CreateMessageService;
