import { Op } from "sequelize";
import { sub } from "date-fns";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import ShowTicketService from "./ShowTicketService";
import FindOrCreateATicketTrakingService from "./FindOrCreateATicketTrakingService";
import { isNil } from "lodash";
import { getIO } from "../../libs/socket";
import logger from "../../utils/logger";
import Whatsapp from "../../models/Whatsapp";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "./CreateLogTicketService";
import AppError from "../../errors/AppError";
import UpdateTicketService from "./UpdateTicketService";

// interface Response {
//   ticket: Ticket;
//   // isCreated: boolean;
// }

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsapp: Whatsapp,
  unreadMessages: number,
  companyId: number,
  queueId: number = null,
  userId: number = null,
  groupContact?: Contact,
  channel?: string,
  isImported?: boolean,
  isForward?: boolean,
  settings?: any,
  isTransfered?: boolean,
  isCampaign: boolean = false
): Promise<Ticket> => {
  // try {
  // let isCreated = false;

  let openAsLGPD = false
  if (settings.enableLGPD) { //adicionar lgpdMessage

    openAsLGPD = !isCampaign &&
      !isTransfered &&
      settings.enableLGPD === "enabled" &&
      settings.lgpdMessage !== "" &&
      (settings.lgpdConsent === "enabled" ||
        (settings.lgpdConsent === "disabled" && isNil(contact?.lgpdAcceptedAt)))
  }

  const io = getIO();

  const DirectTicketsToWallets = settings.DirectTicketsToWallets;

  // ===== ADIÇÃO: extrair lid/jid do contato/grupo como chave canônica =====
  const target = groupContact ?? contact;
  const targetContactId = target?.id;
  // Em Contact já existe remoteJid; priorizamos lid, depois jid, depois remoteJid
  const targetLid = (target as any)?.lid || null;
  const targetJid = (target as any)?.jid || (target as any)?.remoteJid || null;

  // Monta cláusula OR dinamicamente: contactId OU lid OU jid
  const orKeys: any[] = [];
  if (!isNil(targetContactId)) orKeys.push({ contactId: targetContactId });
  if (targetLid) orKeys.push({ lid: String(targetLid).toLowerCase() });
  if (targetJid) orKeys.push({ jid: String(targetJid).toLowerCase() });
  // =======================================================================

  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending", "group", "nps", "lgpd"]
      },
      companyId,
      whatsappId: whatsapp.id,
      ...(orKeys.length > 0 ? { [Op.or]: orKeys } : {})
    },
    order: [["id", "DESC"]]
  });

  if (ticket) {
    // ===== ADIÇÃO: garantir que ticket receba lid/jid se ainda não tiver =====
    const needSyncIds =
      (!!targetLid && !ticket.lid) ||
      (!!targetJid && !ticket.jid);

    if (needSyncIds) {
      await ticket.update({
        lid: ticket.lid || (targetLid ? String(targetLid).toLowerCase() : null),
        jid: ticket.jid || (targetJid ? String(targetJid).toLowerCase() : null),
      });
    }
    // ========================================================================

    if (isCampaign) {
      await ticket.update({
        userId: userId !== ticket.userId ? ticket.userId : userId,
        queueId: queueId !== ticket.queueId ? ticket.queueId : queueId,
      })
    } else {
      await ticket.update({ unreadMessages, isBot: false });
    }

    ticket = await ShowTicketService(ticket.id, companyId);
    // console.log(ticket.id)

    if (!isCampaign && !isForward) {
      // @ts-ignore: Unreachable code error
      if ((Number(ticket?.userId) !== Number(userId) && userId !== 0 && userId !== "" && userId !== "0" && !isNil(userId) && !ticket.isGroup)
        // @ts-ignore: Unreachable code error 
        || (queueId !== 0 && Number(ticket?.queueId) !== Number(queueId) && queueId !== "" && queueId !== "0" && !isNil(queueId))) {
        throw new AppError(`Ticket em outro atendimento. ${"Atendente: " + ticket?.user?.name} - ${"Fila: " + ticket?.queue?.name}`);
      }
    }

    // isCreated = true;

    return ticket

  }

  const timeCreateNewTicket = whatsapp.timeCreateNewTicket;

  if (!ticket && timeCreateNewTicket !== 0) {

    // @ts-ignore: Unreachable code error
    if (timeCreateNewTicket !== 0 && timeCreateNewTicket !== "0") {
      const orKeysRecent: any[] = [];
      if (!isNil(targetContactId)) orKeysRecent.push({ contactId: targetContactId });
      if (targetLid) orKeysRecent.push({ lid: String(targetLid).toLowerCase() });
      if (targetJid) orKeysRecent.push({ jid: String(targetJid).toLowerCase() });

      ticket = await Ticket.findOne({
        where: {
          updatedAt: {
            [Op.between]: [
              +sub(new Date(), {
                minutes: Number(timeCreateNewTicket)
              }),
              +new Date()
            ]
          },
          companyId,
          whatsappId: whatsapp.id,
          ...(orKeysRecent.length > 0 ? { [Op.or]: orKeysRecent } : {})
        },
        order: [["updatedAt", "DESC"]]
      });
    }

    if (ticket && ticket.status !== "nps") {
      await ticket.update({
        status: "pending",
        unreadMessages,
        companyId,
        // queueId: timeCreateNewTicket === 0 ? null : ticket.queueId
      });
    }
  }

  if (!ticket) {

    const ticketData: any = {
      contactId: groupContact ? groupContact.id : contact.id,
      status: (!isImported && !isNil(settings.enableLGPD)
        && openAsLGPD && !groupContact) ? //verifica se lgpd está habilitada e não é grupo e se tem a mensagem e link da política
        "lgpd" :  //abre como LGPD caso habilitado parâmetro
        (whatsapp.groupAsTicket === "enabled" || !groupContact) ? // se lgpd estiver desabilitado, verifica se é para tratar ticket como grupo ou se é contato normal
          "pending" : //caso  é para tratar grupo como ticket ou não é grupo, abre como pendente
          "group", // se não é para tratar grupo como ticket, vai direto para grupos
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId: whatsapp.id,
      companyId,
      isBot: groupContact ? false : true,
      channel,
      imported: isImported ? new Date() : null,
      isActiveDemand: false,
      // ===== ADIÇÃO: persistir lid/jid no ticket criado =====
      lid: targetLid ? String(targetLid).toLowerCase() : null,
      jid: targetJid ? String(targetJid).toLowerCase() : null
      // =====================================================
    };

    if (DirectTicketsToWallets && contact.id) {
      const wallet: any = contact;
      const wallets = await wallet.getWallets();
      if (wallets && wallets[0]?.id) {
        ticketData.status = (!isImported && !isNil(settings.enableLGPD)
          && openAsLGPD && !groupContact) ? //verifica se lgpd está habilitada e não é grupo e se tem a mensagem e link da política
          "lgpd" :  //abre como LGPD caso habilitado parâmetro
          (whatsapp.groupAsTicket === "enabled" || !groupContact) ? // se lgpd estiver desabilitado, verifica se é para tratar ticket como grupo ou se é contato normal
            "open" : //caso  é para tratar grupo como ticket ou não é grupo, abre como pendente
            "group", // se não é para tratar grupo como ticket, vai direto para grupos
          ticketData.userId = wallets[0].id;
      }
    }

    ticket = await Ticket.create(
      ticketData
    );

    // await FindOrCreateATicketTrakingService({
    //   ticketId: ticket.id,
    //   companyId,
    //   whatsappId: whatsapp.id,
    //   userId: userId ? userId : ticket.userId
    // });
  }


  if (queueId != 0 && !isNil(queueId)) {
    //Determina qual a fila esse ticket pertence.
    await ticket.update({ queueId: queueId });
  }

  if (userId != 0 && !isNil(userId)) {
    //Determina qual a fila esse ticket pertence.
    await ticket.update({ userId: userId });
  }

  ticket = await ShowTicketService(ticket.id, companyId);

  await CreateLogTicketService({
    ticketId: ticket.id,
    type: openAsLGPD ? "lgpd" : "create"
  });


  return ticket;
};

export default FindOrCreateTicketService;
