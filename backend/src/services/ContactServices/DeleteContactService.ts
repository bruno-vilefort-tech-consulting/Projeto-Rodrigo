import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import ContactTag from "../../models/ContactTag";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Schedule from "../../models/Schedule";
import TicketNote from "../../models/TicketNote";
import DialogChatBots from "../../models/DialogChatBots";
import logger from "../../utils/logger";

const DeleteContactService = async (
  id: string,
  companyId: number
): Promise<void> => {
  console.log(`[DeleteContactService] Starting deletion for contact ID: ${id}, Company: ${companyId}`);

  const contact = await Contact.findOne({
    where: { id, companyId }
  });

  if (!contact) {
    console.log(`[DeleteContactService] Contact not found: ${id}`);
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  console.log(`[DeleteContactService] Contact found: ${contact.id} - ${contact.name}`);

  try {
    // Deletar associações primeiro para evitar erros de foreign key
    // Ordem: do mais dependente para o menos dependente

    // 1. Deletar messages que referenciam diretamente o contactId
    await Message.destroy({
      where: { contactId: id }
    });
    logger.info(`Messages deleted for contact ${id}`);

    // 2. Deletar schedules associados ao contato
    await Schedule.destroy({
      where: { contactId: id }
    });
    logger.info(`Schedules deleted for contact ${id}`);

    // 3. Deletar ticket notes associados ao contato
    await TicketNote.destroy({
      where: { contactId: id }
    });
    logger.info(`TicketNotes deleted for contact ${id}`);

    // 4. Deletar dialog chatbots associados ao contato
    await DialogChatBots.destroy({
      where: { contactId: id }
    });
    logger.info(`DialogChatBots deleted for contact ${id}`);

    // 5. Deletar tickets associados ao contato (isso deletará messages vinculadas ao ticket via CASCADE)
    await Ticket.destroy({
      where: { contactId: id }
    });
    logger.info(`Tickets deleted for contact ${id}`);

    // 6. Deletar tags associadas ao contato
    await ContactTag.destroy({
      where: { contactId: id }
    });

    // 7. Deletar campos customizados
    await ContactCustomField.destroy({
      where: { contactId: id }
    });

    // 8. Deletar wallets associadas
    await ContactWallet.destroy({
      where: { contactId: id }
    });

    // 9. Finalmente deletar o contato
    await contact.destroy();

    logger.info(`Contact ${id} deleted successfully with all associations`);
  } catch (error: any) {
    console.log(`[DeleteContactService] ERROR CAUGHT:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      sql: error.sql,
      parent: error.parent
    });
    logger.error(`Error deleting contact ${id}:`, error);

    // Se falhar devido a tickets ou outros relacionamentos
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.log(`[DeleteContactService] Foreign key constraint error detected`);
      throw new AppError("Este contato possui tickets ou outras dependências e não pode ser excluído. Por favor, resolva os tickets primeiro.", 409);
    }

    console.log(`[DeleteContactService] Throwing generic 500 error`);
    throw new AppError("Erro ao excluir contato. Por favor, tente novamente.", 500);
  }
};

export default DeleteContactService;
