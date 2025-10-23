import AppError from "../../errors/AppError";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import logger from "../../utils/logger";
import ContactWallet from "../../models/ContactWallet";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Wallet {
  walletId: number | string;
  contactId: number | string;
  companyId: number | string;
}
interface Request {
  name: string;
  number: string | null;
  email?: string;
  profilePicUrl?: string;
  acceptAudioMessage?: boolean;
  active?: boolean;
  companyId: number;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  wallets?: null | number[] | string[];
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  acceptAudioMessage,
  active,
  companyId,
  extraInfo = [],
  remoteJid = "",
  wallets
}: Request): Promise<Contact> => {
  try {
    logger.info(`[CreateContactService] Creating contact`, { name, number, companyId });

    // Verificar duplicatas apenas se houver número
    // Permite múltiplos contatos sem número
    if (number && number.trim() !== "") {
      const numberExists = await Contact.findOne({
        where: { number, companyId }
      });
      if (numberExists) {
        logger.warn(`[CreateContactService] Contact already exists with number ${number} for company ${companyId}`);
        throw new AppError("ERR_DUPLICATED_CONTACT", 409);
      }
    }

    const settings = await CompaniesSettings.findOne({
      where: {
        companyId
      }
    });

    if (!settings) {
      logger.error(`[CreateContactService] Company settings not found for company ${companyId}`);
      throw new AppError("Configurações da empresa não encontradas", 404);
    }

    const { acceptAudioMessageContact } = settings;

    const contact = await Contact.create(
      {
        name,
        number,
        email,
        acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
        active,
        extraInfo,
        companyId,
        remoteJid
      },
      {
        include: ["extraInfo",
          {
            association: "wallets",
            attributes: ["id", "name"]
          }]
      }
    );

    logger.info(`[CreateContactService] Contact created successfully with id ${contact.id}`);

    if (wallets) {
      await ContactWallet.destroy({
        where: {
          companyId,
          contactId: contact.id
        }
      });

      const contactWallets: Wallet[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wallets.forEach((wallet: any) => {
        contactWallets.push({
          walletId: !wallet.id ? wallet : wallet.id,
          contactId: contact.id,
          companyId
        });
      });

      await ContactWallet.bulkCreate(contactWallets);
    }

    return contact;
  } catch (err: any) {
    logger.error(`[CreateContactService] Error creating contact:`, err);

    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError("Erro ao criar contato no banco de dados", 500);
  }
};

export default CreateContactService;
