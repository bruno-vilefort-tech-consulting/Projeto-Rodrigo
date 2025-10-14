import { Request, Response } from "express";
import AppError from "../errors/AppError";
import TicketTag from '../models/TicketTag';
import Tag from '../models/Tag'
import { getIO } from "../libs/socket";
import Ticket from "../models/Ticket";
import ShowTicketService from "../services/TicketServices/ShowTicketService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId, tagId } = req.params;
  const { companyId } = req.user;

  try {
    // SECURITY: Validate ticket belongs to company BEFORE creating tag
    const ticket = await ShowTicketService(ticketId, companyId);

    // SECURITY: Validate tag exists, is Kanban type, and belongs to company
    const tag = await Tag.findOne({
      where: {
        id: tagId,
        kanban: 1,
        companyId
      }
    });

    if (!tag) {
      return res.status(400).json({ error: 'Tag não encontrada ou não é do tipo Kanban.' });
    }

    // Create TicketTag after validations pass
    const ticketTag = await TicketTag.create({ ticketId, tagId });

    // Re-fetch ticket with updated tags
    const updatedTicket = await ShowTicketService(ticketId, companyId);

    // FIXED: Use correct namespace pattern /workspace-{companyId}
    const io = getIO();
    io.of(`/workspace-${companyId}`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });

    return res.status(201).json(ticketTag);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to store ticket tag.' });
  }
};

/*
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  console.log("remove");
  console.log(req.params);

  try {
    await TicketTag.destroy({ where: { ticketId } });
    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};
*/
export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  try {
    // SECURITY: Validate ticket belongs to company BEFORE any operation
    const ticket = await ShowTicketService(ticketId, companyId);

    // Retrieve tagIds associated with the provided ticketId from TicketTags
    const ticketTags = await TicketTag.findAll({ where: { ticketId } });
    const tagIds = ticketTags.map((ticketTag) => ticketTag.tagId);

    // SECURITY: Find tagIds with kanban=1 AND companyId (multi-tenant filter)
    const tagsWithKanbanOne = await Tag.findAll({
      where: {
        id: tagIds,
        kanban: 1,
        companyId  // ADDED: Multi-tenant filter
      },
    });

    // Remove the tagIds with kanban = 1 from TicketTags
    const tagIdsWithKanbanOne = tagsWithKanbanOne.map((tag) => tag.id);
    if (tagIdsWithKanbanOne.length > 0) {
      await TicketTag.destroy({ where: { ticketId, tagId: tagIdsWithKanbanOne } });
    }

    // Re-fetch ticket with updated tags
    const updatedTicket = await ShowTicketService(ticketId, companyId);

    // FIXED: Use correct namespace pattern /workspace-{companyId}
    const io = getIO();
    io.of(`/workspace-${companyId}`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket: updatedTicket
      });

    return res.status(200).json({ message: 'Ticket tags removed successfully.' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to remove ticket tags.' });
  }
};