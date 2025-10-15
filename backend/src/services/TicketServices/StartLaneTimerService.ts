import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

interface Request {
  ticketId: number;
  companyId: number;
}

const StartLaneTimerService = async ({
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

  // Se não tem lane kanban, não faz nada
  if (!ticketTag || !ticketTag.tag) {
    console.log(`⏭️ [StartLaneTimer] Ticket ${ticketId} não está em nenhuma lane kanban, timer não iniciado`);
    return;
  }

  const currentLane = ticketTag.tag;

  // Se a lane não tem timeLane configurado ou não tem nextLaneId, não inicia timer
  if (!currentLane.timeLane || currentLane.timeLane <= 0 || !currentLane.nextLaneId) {
    console.log(`⏭️ [StartLaneTimer] Lane "${currentLane.name}" não tem timer ou nextLaneId configurado, timer não iniciado`);
    return;
  }

  // Calcular quando o ticket deve ser movido
  const now = new Date();
  const moveAt = new Date(now.getTime() + currentLane.timeLane * 60 * 1000); // timeLane está em minutos

  // Atualizar o ticket com os dados do timer
  await ticket.update({
    laneTimerStartedAt: now,
    laneNextMoveAt: moveAt
  });

  console.log(`⏰ [StartLaneTimer] Timer iniciado para ticket ${ticketId}:`, {
    lane: currentLane.name,
    timeLane: currentLane.timeLane,
    startedAt: now,
    moveAt: moveAt,
    nextLaneId: currentLane.nextLaneId
  });
};

export default StartLaneTimerService;
