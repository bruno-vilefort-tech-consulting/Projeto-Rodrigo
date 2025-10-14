import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import sequelize from "../../database";
import CompaniesSettings from "../../models/CompaniesSettings";
import { normalizeDocument, validateCPFOrCNPJ } from "../../helpers/DocumentValidator";
import logger from "../../utils/logger";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME"),
    document: Yup.string()
      .nullable()
      .transform((value) => {
        if (!value || value.trim() === '') return null;
        return normalizeDocument(value);
      })
      .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
        // Feature flag check
        const featureFlagEnabled = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';
        if (!featureFlagEnabled) return true; // Se flag OFF, não validar

        // Se null/undefined, permitir (campo opcional)
        if (!value) return true;

        // Validar CPF ou CNPJ
        return validateCPFOrCNPJ(value);
      })
  });

  try {
    await companySchema.validate({ name, document });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const t = await sequelize.transaction();

  try {
    const company = await Company.create({
      name,
      phone,
      email,
      status,
      planId,
      dueDate,
      recurrence,
      document: normalizeDocument(document), // Normalizar antes de salvar
      paymentMethod
    },
      { transaction: t }
    );

    // Log de criação
    logger.info({
      message: 'Company created successfully',
      companyId: company.id,
      companyName: company.name,
      documentPresent: !!company.document
    });

    const user = await User.create({
      name: companyUserName ? companyUserName : name,
      email: company.email,
      password: password ? password : "mudar123",
      profile: "admin",
      companyId: company.id
    },
      { transaction: t }
    );

    const settings = await CompaniesSettings.create({
          companyId: company.id,
          hoursCloseTicketsAuto: "9999999999",
          chatBotType: "text",
          acceptCallWhatsapp: "enabled",
          userRandom: "enabled",
          sendGreetingMessageOneQueues: "enabled",
          sendSignMessage: "enabled",
          sendFarewellWaitingTicket: "disabled",
          userRating: "disabled",
          sendGreetingAccepted: "enabled",
          CheckMsgIsGroup: "enabled",
          sendQueuePosition: "disabled",
          scheduleType: "disabled",
          acceptAudioMessageContact: "enabled",
          sendMsgTransfTicket:"disabled",
          enableLGPD: "disabled",
          requiredTag: "disabled",
          lgpdDeleteMessage: "disabled",
          lgpdHideNumber: "disabled",
          lgpdConsent: "disabled",
          lgpdLink:"",
          lgpdMessage:"",
          createDemoUser: "enabled", // Habilitar criação de usuário demo por padrão
          createdAt: new Date(),
          updatedAt: new Date(),
          closeTicketOnTransfer: false,
          DirectTicketsToWallets: false
    },{ transaction: t })
    
    await t.commit();

    return company;
  } catch (error) {
    await t.rollback();
    throw new AppError("Não foi possível criar a empresa!", error);
  }
};

export default CreateCompanyService;