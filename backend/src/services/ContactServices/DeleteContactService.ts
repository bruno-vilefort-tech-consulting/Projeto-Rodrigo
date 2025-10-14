import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import ContactTag from "../../models/ContactTag";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";
import logger from "../../utils/logger";

const DeleteContactService = async (
  id: string,
  companyId: number
): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id, companyId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  try {
    // Deletar associações primeiro para evitar erros de foreign key

    // Deletar tags associadas ao contato
    await ContactTag.destroy({
      where: { contactId: id }
    });

    // Deletar campos customizados
    await ContactCustomField.destroy({
      where: { contactId: id }
    });

    // Deletar wallets associadas
    await ContactWallet.destroy({
      where: { contactId: id }
    });

    // Agora deletar o contato
    await contact.destroy();

    logger.info(`Contact ${id} deleted successfully with all associations`);
  } catch (error) {
    logger.error(`Error deleting contact ${id}:`, error);

    // Se falhar devido a tickets ou outros relacionamentos
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError("Este contato possui tickets ou outras dependências e não pode ser excluído. Por favor, resolva os tickets primeiro.", 409);
    }

    throw new AppError("Erro ao excluir contato. Por favor, tente novamente.", 500);
  }
};

export default DeleteContactService;
