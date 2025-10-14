// backend/src/services/ContactServices/BulkDeleteContactsService.ts

import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { Op } from "sequelize"; // Importar o Op do Sequelize
import ContactTag from "../../models/ContactTag";
import ContactCustomField from "../../models/ContactCustomField";
import ContactWallet from "../../models/ContactWallet";
import logger from "../../utils/logger";

const BulkDeleteContactsService = async (
  contactIds: number[],
  companyId: number
): Promise<void> => {
  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    throw new AppError("Nenhum ID de contato fornecido para exclusão em massa.", 400);
  }

  try {
    // Opcional: Verificação de segurança adicional para garantir que os contatos
    // realmente existem E pertencem à empresa antes de tentar deletá-los.
    // Isso evita deleções de IDs inválidos ou de outras empresas.
    const contactsFound = await Contact.findAll({
      where: {
        id: {
          [Op.in]: contactIds // Verifica se os IDs estão no array contactIds
        },
        companyId: companyId // ESSENCIAL: Garante que os contatos pertencem à empresa do usuário
      }
    });

    if (contactsFound.length !== contactIds.length) {
        // Se a quantidade de contatos encontrados for diferente da quantidade de IDs passados,
        // significa que alguns IDs eram inválidos ou não pertenciam à empresa.
        // Você pode ajustar este comportamento:
        // - Lançar um erro (como abaixo), ou
        // - Simplesmente deletar os que foram encontrados (removendo esta verificação e usando contactsFound.map(c => c.id) no destroy).
        // Por segurança, manteremos o erro.
        const notFoundIds = contactIds.filter(id => !contactsFound.some(c => c.id === id));
        throw new AppError(`Alguns contatos não foram encontrados ou não pertencem à sua empresa. IDs: ${notFoundIds.join(', ')}`, 404);
    }

    // Deletar associações primeiro para evitar erros de foreign key

    // Deletar tags associadas aos contatos
    await ContactTag.destroy({
      where: {
        contactId: {
          [Op.in]: contactIds
        }
      }
    });

    // Deletar campos customizados
    await ContactCustomField.destroy({
      where: {
        contactId: {
          [Op.in]: contactIds
        }
      }
    });

    // Deletar wallets associadas
    await ContactWallet.destroy({
      where: {
        contactId: {
          [Op.in]: contactIds
        }
      }
    });

    // Executa a deleção para os IDs encontrados e confirmados da empresa
    await Contact.destroy({
      where: {
        id: {
          [Op.in]: contactIds // Deleta todos os IDs no array
        },
        companyId: companyId // ESSENCIAL: Garante que apenas contatos da empresa sejam deletados
      }
    });

    logger.info(`Bulk delete: ${contactIds.length} contacts deleted successfully with all associations`);

  } catch (error: any) {
    logger.error("Erro detalhado ao deletar contatos em massa:", error);

    if (error instanceof AppError) {
      throw error; // Se já é um AppError, apenas o relança
    }

    // Se falhar devido a tickets ou outros relacionamentos
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw new AppError("Alguns contatos possuem tickets ou outras dependências e não podem ser excluídos. Por favor, resolva os tickets primeiro.", 409);
    }

    // Para outros tipos de erro (ex: problema de DB), lança um AppError genérico
    throw new AppError("Erro interno do servidor ao deletar contatos: " + error.message, 500);
  }
};

export default BulkDeleteContactsService;