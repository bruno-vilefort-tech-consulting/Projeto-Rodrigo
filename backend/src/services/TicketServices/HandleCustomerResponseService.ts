import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import MoveTicketLaneService from "./MoveTicketLaneService";

interface Request {
  ticketId: number;
  companyId: number;
}

const HandleCustomerResponseService = async ({
  ticketId,
  companyId
}: Request): Promise<void> => {
  // Buscar o ticket
  const ticket = await Ticket.findOne({
    where: {
      id: ticketId,
      companyId
    }
  });

  if (!ticket) {
    throw new AppError("Ticket não encontrado", 404);
  }

  // Se não há timer ativo, não faz nada
  if (!ticket.laneTimerStartedAt || !ticket.laneNextMoveAt) {
    console.log(`⏭️ [HandleCustomerResponse] Ticket ${ticketId} não tem timer ativo`);
    return;
  }

  // Buscar a lane (tag kanban) atual do ticket
  const ticketTag = await TicketTag.findOne({
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

  // Se não tem lane kanban, apenas limpa o timer
  if (!ticketTag || !ticketTag.tag) {
    await ticket.update({
      laneTimerStartedAt: null,
      laneNextMoveAt: null
    });
    console.log(`⏭️ [HandleCustomerResponse] Ticket ${ticketId} não está em lane kanban, timer limpo`);
    return;
  }

  const currentLane = ticketTag.tag;

  // Se a lane tem rollbackLaneId configurado, move o ticket
  if (currentLane.rollbackLaneId) {
    console.log(`🔄 [HandleCustomerResponse] Cliente respondeu no ticket ${ticketId}, movendo para rollbackLaneId ${currentLane.rollbackLaneId}`);

    await MoveTicketLaneService({
      ticketId,
      companyId,
      toLaneId: currentLane.rollbackLaneId,
      sendGreeting: true // Envia mensagem de saudação da lane de rollback
    });
  } else {
    // Se não tem rollbackLaneId, apenas cancela o timer
    await ticket.update({
      laneTimerStartedAt: null,
      laneNextMoveAt: null
    });
    console.log(`⏹️ [HandleCustomerResponse] Cliente respondeu no ticket ${ticketId}, timer cancelado (sem rollbackLaneId configurado)`);
  }
};

export default HandleCustomerResponseService;
