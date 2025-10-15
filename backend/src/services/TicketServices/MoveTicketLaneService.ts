import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import ShowTicketService from "./ShowTicketService";
import { getIO } from "../../libs/socket";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import CompaniesSettings from "../../models/CompaniesSettings";

interface Request {
  ticketId: number;
  companyId: number;
  toLaneId: number;
  sendGreeting?: boolean;
}

const MoveTicketLaneService = async ({
  ticketId,
  companyId,
  toLaneId,
  sendGreeting = true
}: Request): Promise<Ticket> => {
  // Buscar o ticket com as tags atuais
  const ticket = await ShowTicketService(ticketId, companyId);

  // Validar que a lane de destino existe e pertence à empresa
  const toLane = await Tag.findOne({
    where: {
      id: toLaneId,
      kanban: 1,
      companyId
    }
  });

  if (!toLane) {
    throw new AppError("Lane de destino não encontrada", 404);
  }

  // Remover tags kanban antigas (kanban: 1)
  const oldKanbanTags = await TicketTag.findAll({
    where: { ticketId },
    include: [{
      model: Tag,
      as: "tag",
      where: {
        kanban: 1,
        companyId
      }
    }]
  });

  const oldTagIds = oldKanbanTags.map(tt => tt.tagId);
  if (oldTagIds.length > 0) {
    await TicketTag.destroy({
      where: {
        ticketId,
        tagId: oldTagIds
      }
    });
  }

  // Adicionar a nova tag da lane
  await TicketTag.create({
    ticketId,
    tagId: toLaneId
  });

  // Limpar os timers de lane
  await Ticket.update(
    {
      laneTimerStartedAt: null,
      laneNextMoveAt: null
    },
    { where: { id: ticketId } }
  );

  console.log(`✅ [MoveTicketLane] Ticket ${ticketId} movido para lane ${toLane.name} (ID: ${toLaneId})`);

  // Enviar mensagem de saudação se configurada e se sendGreeting for true
  if (sendGreeting && toLane.greetingMessageLane && toLane.greetingMessageLane.trim() !== "") {
    try {
      // Verificar se assinatura está habilitada nas configurações da empresa
      const companySettings = await CompaniesSettings.findOne({
        where: { companyId }
      });

      let messageBody = toLane.greetingMessageLane;

      // Se sendSignMessage está enabled e o ticket tem usuário, adicionar assinatura
      if (companySettings?.sendSignMessage === "enabled" && ticket.user?.name) {
        messageBody = `*${ticket.user.name}:*\n${toLane.greetingMessageLane}`;
        console.log(`✍️ [MoveTicketLane] Adicionando assinatura "${ticket.user.name}" à mensagem`);
      }

      await SendWhatsAppMessage({
        body: messageBody,
        ticket,
        isForwarded: false
      });
      console.log(`📨 [MoveTicketLane] Mensagem de saudação enviada para ticket ${ticketId}`);
    } catch (error) {
      console.error(`❌ [MoveTicketLane] Erro ao enviar mensagem de saudação:`, error);
    }
  }

  // Recarregar ticket com todas as associações
  const updatedTicket = await ShowTicketService(ticketId, companyId);

  // Emitir evento Socket.IO para atualizar o frontend
  const io = getIO();
  io.of(`/workspace-${companyId}`)
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket: updatedTicket
    });

  return updatedTicket;
};

export default MoveTicketLaneService;
