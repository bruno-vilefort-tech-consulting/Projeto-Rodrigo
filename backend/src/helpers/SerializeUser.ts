import Queue from "../models/Queue";
import Company from "../models/Company";
import User from "../models/User";
import jwt from "jsonwebtoken";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  companyId: number;
  company: Company | null;
  super: boolean;
  queues: Queue[];
  startWork: string;
  endWork: string;
  allTicket: string;
  whatsappId: number;
  profileImage: string;
  defaultTheme: string;
  defaultMenu: string;
  allHistoric: string;
  allUserChat?: string;
  defaultTicketsManagerWidth?: number;
  userClosePendingTicket?: string;
  showDashboard?: string;
  token?: string;
  allowGroup: boolean;
  allowRealTime: string;
  allowConnections: string;
}

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  // Gera um token de 32 bytes
  const generateToken = (userId: number | string): string => {
    // Gerar o token com base no userId e sua chave secreta
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Você pode definir o tempo de expiração conforme necessário
    return token;
  };

  // Garantir que o plan existe mesmo se não foi incluído
  let serializedCompany = user.company;
  if (serializedCompany && !serializedCompany.plan && serializedCompany.planId) {
    // Adiciona um plan padrão para evitar erro no frontend
    serializedCompany.plan = {
      id: serializedCompany.planId,
      useCampaigns: false,
      useSchedules: false,
      useInternalChat: false,
      useExternalApi: false,
      useKanban: false,
      useOpenAi: false,
      useIntegrations: false,
      useWhatsapp: true,
      useFacebook: false,
      useInstagram: false
    } as any;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    companyId: user.companyId,
    company: serializedCompany,
    super: user.super,
    queues: user.queues,
    startWork: user.startWork,
    endWork: user.endWork,
    allTicket: user.allTicket,
    whatsappId: user.whatsappId,
    profileImage: user.profileImage,
    defaultTheme: user.defaultTheme,
    defaultMenu: user.defaultMenu,
    allHistoric: user.allHistoric,
    allUserChat: user.allUserChat,
    defaultTicketsManagerWidth: user.defaultTicketsManagerWidth,
    userClosePendingTicket: user.userClosePendingTicket,
    showDashboard: user.showDashboard,
    token: generateToken(user.id),
    allowGroup: user.allowGroup,
    allowRealTime: user.allowRealTime,
    allowConnections: user.allowConnections
  };
};
