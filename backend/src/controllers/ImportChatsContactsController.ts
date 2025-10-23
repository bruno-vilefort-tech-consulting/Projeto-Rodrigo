import { Request, Response } from "express";
import ImportChatsContactsService from "../services/ContactServices/ImportChatsContactsService";
import AppError from "../errors/AppError";
import logger from "../utils/logger";

/**
 * Controller para importar contatos de chats recentes do WhatsApp
 * POST /contacts/import/chats
 * Body: { whatsappId: number, hours?: number }
 */
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { whatsappId, hours } = req.body;

    if (!whatsappId) {
      throw new AppError("WhatsApp ID é obrigatório", 400);
    }

    logger.info({
      action: 'import_chats_contacts_request',
      companyId,
      whatsappId,
      hours: hours || 24
    });

    const result = await ImportChatsContactsService({
      companyId,
      whatsappId: Number(whatsappId),
      hours: hours ? Number(hours) : 24
    });

    return res.status(200).json({
      message: `${result.imported} contatos importados de chats recentes`,
      imported: result.imported,
      skipped: result.skipped
    });
  } catch (error) {
    logger.error({
      action: 'import_chats_contacts_error',
      error: error.message
    });

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: "Erro ao importar contatos de chats" });
  }
};
