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

  if (!messageData?.ticketImported) {
    // Debug log para verificar o ticket UUID
    console.log("🚀 [CreateMessageService] Emitindo evento Socket.IO:", {
      ticketId: message.ticket?.id,
      ticketUuid: message.ticket?.uuid,
      hasTicket: !!message.ticket,
      companyId,
      channel: `company-${companyId}-appMessage`
    });

    const payload = {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    };

    // Emissão ampla para atender diferentes listeners do frontend
    // Emissão principal para o frontend que escuta company-${companyId}-appMessage
    io.emit(`company-${companyId}-appMessage`, payload);

    // Emissões adicionais para garantir compatibilidade
    io.of(String(companyId)).emit(`company-${companyId}-appMessage`, payload);
    io.of(String(companyId)).to(String(message.ticketId)).emit("appMessage", payload);
    io.of(String(companyId)).to(`company-${companyId}`).emit("appMessage", payload);

    // Emitir também para o room do ticket específico
    io.to(String(message.ticketId)).emit(`company-${companyId}-appMessage`, payload);
  }

  // 🎯 KANBAN LANE TIMER: Gerenciar movimento automático de cards
  if (!messageData?.ticketImported && !message.isPrivate && message.ticketId) {
    try {
      if (message.fromMe) {
        // Mensagem do atendente -> Iniciar timer para mover para nextLaneId
        await StartLaneTimerService({
          ticketId: message.ticketId,
          companyId
        });
      } else {
        // Mensagem do cliente -> Cancelar timer e mover para rollbackLaneId se configurado
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
