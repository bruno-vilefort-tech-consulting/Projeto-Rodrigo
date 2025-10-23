import { Op } from "sequelize";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import MoveTicketLaneService from "./MoveTicketLaneService";
import logger from "../../utils/logger";

/**
 * Job que processa tickets cujo timer de lane expirou e os move para a nextLaneId
 * Deve ser executado periodicamente (ex: a cada minuto via cron)
 */
const ProcessExpiredLaneTimersJob = async (): Promise<void> => {
  try {
    const now = new Date();

    // Buscar todos os tickets com timer expirado E movimento automático permitido
    const expiredTickets = await Ticket.findAll({
      where: {
        laneNextMoveAt: {
          [Op.lte]: now // laneNextMoveAt <= agora
        },
        laneTimerStartedAt: {
          [Op.not]: null // Tem timer ativo
        },
        allowAutomaticMove: true // ✅ Só move tickets com movimento automático HABILITADO
      },
      include: [
        {
          model: TicketTag,
          as: "ticketTags",
          required: true,
          include: [
            {
              model: Tag,
              as: "tag",
              where: {
                kanban: 1 // Apenas tags kanban
              }
            }
          ]
        }
      ]
    });

    if (expiredTickets.length === 0) {
      // Não há tickets expirados
      return;
    }

    logger.info(`⏰ [ProcessExpiredLaneTimers] Encontrados ${expiredTickets.length} tickets com timer expirado`);

    // Processar cada ticket expirado
    for (const ticket of expiredTickets) {
      try {
        // Buscar a tag kanban atual do ticket
        const ticketTag = ticket.ticketTags.find(tt => tt.tag?.kanban === 1);

        if (!ticketTag || !ticketTag.tag) {
          logger.warn(`⚠️ [ProcessExpiredLaneTimers] Ticket ${ticket.id} não tem tag kanban, limpando timer`);
          await ticket.update({
            laneTimerStartedAt: null,
            laneNextMoveAt: null
          });
          continue;
        }

        const currentLane = ticketTag.tag;

        // Verificar se a lane tem nextLaneId configurado
        if (!currentLane.nextLaneId) {
          logger.warn(`⚠️ [ProcessExpiredLaneTimers] Ticket ${ticket.id} na lane "${currentLane.name}" não tem nextLaneId configurado, limpando timer`);
          await ticket.update({
            laneTimerStartedAt: null,
            laneNextMoveAt: null
          });
          continue;
        }

        logger.info(`🔄 [ProcessExpiredLaneTimers] Movendo ticket ${ticket.id} da lane "${currentLane.name}" para nextLaneId ${currentLane.nextLaneId}`);

        // Mover o ticket para a próxima lane
        await MoveTicketLaneService({
          ticketId: ticket.id,
          companyId: ticket.companyId,
          toLaneId: currentLane.nextLaneId,
          sendGreeting: true
        });

        logger.info(`✅ [ProcessExpiredLaneTimers] Ticket ${ticket.id} movido com sucesso`);
      } catch (error) {
        logger.error(`❌ [ProcessExpiredLaneTimers] Erro ao processar ticket ${ticket.id}:`, error);
        // Continua processando os outros tickets mesmo se um falhar
      }
    }

    logger.info(`✅ [ProcessExpiredLaneTimers] Processamento de timers expirados concluído`);
  } catch (error) {
    logger.error("❌ [ProcessExpiredLaneTimers] Erro ao processar timers expirados:", error);
  }
};

export default ProcessExpiredLaneTimersJob;
