import * as Sentry from "@sentry/node";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import logger from "../../utils/logger";
import CreateOrUpdateContactService from "./CreateOrUpdateContactService";
import { Op } from "sequelize";

interface ImportChatsContactsOptions {
  companyId: number;
  whatsappId: number;
  hours?: number; // Importar contatos de chats das últimas X horas (default: 24h)
}

/**
 * Importa contatos de chats ativos recentes do WhatsApp
 * Filtra apenas contatos que enviaram/receberam mensagens nas últimas X horas
 */
const ImportChatsContactsService = async ({
  companyId,
  whatsappId,
  hours = 24
}: ImportChatsContactsOptions): Promise<{ imported: number; skipped: number }> => {
  try {
    logger.info({
      action: 'import_chats_contacts_started',
      companyId,
      whatsappId,
      hours
    });

    // 1. Buscar mensagens das últimas X horas
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const recentMessages = await Message.findAll({
      where: {
        companyId,
        createdAt: {
          [Op.gte]: cutoffDate
        }
      },
      attributes: ['contactId'],
      group: ['contactId'],
      raw: true
    });

    const contactIds = recentMessages.map(msg => msg.contactId).filter(Boolean);

    if (contactIds.length === 0) {
      logger.info({
        action: 'import_chats_contacts_no_recent_messages',
        companyId,
        hours
      });
      return { imported: 0, skipped: 0 };
    }

    // 2. Buscar contatos dos chats recentes
    const contacts = await Contact.findAll({
      where: {
        id: {
          [Op.in]: contactIds
        },
        companyId,
        isGroup: false // Ignorar grupos
      }
    });

    let imported = 0;
    let skipped = 0;

    // 3. Atualizar contatos para marcar como chat_import
    for (const contact of contacts) {
      try {
        // Se já está marcado como isInAgenda, pular
        if (contact.isInAgenda) {
          skipped++;
          continue;
        }

        // Atualizar source e isInAgenda
        await contact.update({
          source: 'chat_import',
          isInAgenda: true
        });

        imported++;

        logger.info({
          action: 'contact_imported_from_chat',
          contactId: contact.id,
          contactNumber: contact.number,
          companyId
        });
      } catch (error) {
        Sentry.captureException(error);
        logger.error({
          action: 'import_chat_contact_failed',
          contactId: contact.id,
          error: error.message,
          companyId
        });
        skipped++;
      }
    }

    logger.info({
      action: 'import_chats_contacts_completed',
      companyId,
      whatsappId,
      hours,
      imported,
      skipped,
      totalProcessed: contacts.length
    });

    return { imported, skipped };
  } catch (error) {
    Sentry.captureException(error);
    logger.error({
      action: 'import_chats_contacts_error',
      companyId,
      error: error.message
    });
    throw error;
  }
};

export default ImportChatsContactsService;
