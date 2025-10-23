import path, { join } from "path";
import { readFile, writeFile } from "fs/promises";
import fs from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull } from "lodash";
import { REDIS_URI_MSG_CONN } from "../../config/redis";
import axios from "axios";

import {
  downloadMediaMessage,
  extractMessageContent,
  getContentType,
  GroupMetadata,
  jidNormalizedUser,
  delay,
  MediaType,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket,
  downloadContentFromMessage,
  AnyMessageContent,
  generateWAMessageContent,
  generateWAMessageFromContent
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { Mutex } from "async-mutex";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import logger from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import formatBody from "../../helpers/Mustache";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import sendFaceMessage from "../FacebookServices/sendFacebookMessage";
import Queue from "../../models/Queue";
import moment from "moment";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import sequelize from "../../database";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import { sayChatbot } from "./ChatBotListener";
import MarkDeleteWhatsAppMessage from "./MarkDeleteWhatsAppMessage";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";
import cacheLayer from "../../libs/cache";
import { addLogs } from "../../helpers/addLogs";
import SendWhatsAppMedia, { getMessageOptions } from "./SendWhatsAppMedia";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import ShowQueueIntegrationService from "../QueueIntegrationServices/ShowQueueIntegrationService";
import { createDialogflowSessionWithModel } from "../QueueIntegrationServices/CreateSessionDialogflow";
import { queryDialogFlow } from "../QueueIntegrationServices/QueryDialogflow";
import CompaniesSettings from "../../models/CompaniesSettings";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import Whatsapp from "../../models/Whatsapp";
import QueueIntegrations from "../../models/QueueIntegrations";
import ShowFileService from "../FileServices/ShowService";
import { acquireTicketWelcomeLock } from "../../libs/ticketLock";
import { getWidFromMsg } from "../../helpers/getWid";

import Message from "../../models/Message"; 
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import {
  SpeechConfig,
  SpeechSynthesizer,
  AudioConfig
} from "microsoft-cognitiveservices-speech-sdk";
import typebotListener from "../TypebotServices/typebotListener";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import pino from "pino";
import BullQueues from "../../libs/queue";
import { Transform } from "stream";
import { msgDB } from "../../libs/wbot";
import {CheckSettings1, CheckCompanySetting} from "../../helpers/CheckSettings";
import { title } from "process";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { IConnections, INodes } from "../WebhookService/DispatchWebHookService";
import { FlowDefaultModel } from "../../models/FlowDefault";
import { ActionsWebhookService } from "../WebhookService/ActionsWebhookService";
import { WebhookModel } from "../../models/Webhook";
import { add, differenceInMilliseconds } from "date-fns";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import ShowTicketService from "../TicketServices/ShowTicketService";
import { handleOpenAi } from "../IntegrationsServices/OpenAiService";
import { IOpenAi } from "../../@types/openai";
import HandleNpsReplyService from "../TicketServices/HandleNpsReplyService";
import { MessageUserReceiptUpdate } from "@whiskeysockets/baileys";

function emitAppMessage(companyId: number, ticketId: number, payload: any) {
  const io = getIO();

  // ✅ CORREÇÃO: Usar apenas o namespace correto /workspace-{companyId}
  const workspaceNamespace = io.of(`/workspace-${companyId}`);

  console.log("🚀 [wbotMessageListener] Emitindo evento Socket.IO:", {
    namespace: `/workspace-${companyId}`,
    ticketId,
    action: payload.action,
    channel: `company-${companyId}-appMessage`
  });

  // Emitir para todos os clientes conectados ao namespace
  workspaceNamespace.emit(`company-${companyId}-appMessage`, payload);

  // Emitir também para o room específico do ticket (se houver clientes que entraram no room)
  if (payload.ticket?.uuid) {
    workspaceNamespace.to(payload.ticket.uuid).emit(`company-${companyId}-appMessage`, payload);
  } else {
    workspaceNamespace.to(String(ticketId)).emit(`company-${companyId}-appMessage`, payload);
  }

  console.log("✅ [wbotMessageListener] Evento emitido com sucesso para namespace /workspace-" + companyId);
}

// Helper function para matching de frases em campanhas
const matchPhrase = (phrase: string, body: string, matchType: string = 'exact'): boolean => {
  const normalizedPhrase = phrase.trim();
  const normalizedBody = body.trim();

  if (matchType === 'exact') {
    return normalizedPhrase === normalizedBody;
  } else if (matchType === 'contains') {
    return normalizedBody.toLowerCase().includes(normalizedPhrase.toLowerCase());
  }

  return false;
};

const HAS_MESSAGE_ID = !!(Message as any)?.rawAttributes?.messageId;

function getTextFromBaileysMsg(wm: any): string {
  // desencaixa mensagens efêmeras
  const root = wm?.message?.ephemeralMessage?.message ?? wm?.message ?? {};
  return (
    root?.conversation ??
    root?.extendedTextMessage?.text ??
    root?.imageMessage?.caption ??
    root?.videoMessage?.caption ??
    root?.buttonsResponseMessage?.selectedDisplayText ??
    root?.listResponseMessage?.singleSelectReply?.selectedRowId ??
    root?.templateButtonReplyMessage?.selectedId ??
    ""
  ).toString().trim();
}

const os = require("os");

const request = require("request");

let i = 0;

setInterval(() => {
  i = 0;
}, 5000);

type Session = WASocket & {
  id?: number;
};

interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}

interface IMe {
  name: string;
  id: string;
}

interface SessionOpenAi extends OpenAI {
  id?: number;
}
const sessionsOpenAi: SessionOpenAi[] = [];

function removeFile(directory) {
  fs.unlink(directory, error => {
    if (error) throw error;
  });
}

const getTimestampMessage = (msgTimestamp: any) => {
  return msgTimestamp * 1;
};

// ===== [LID/JID] util =====
const parseLidJid = (peerId?: string) => {
  if (!peerId) return { lid: null as string | null, jid: null as string | null };
  const id = String(peerId).toLowerCase();
  // Heurística simples: @lid -> lid; @s.whatsapp.net / @g.us -> jid
  if (id.endsWith("@lid")) return { lid: id, jid: null };
  if (id.endsWith("@s.whatsapp.net") || id.endsWith("@c.us") || id.endsWith("@g.us")) return { lid: null, jid: id };
  // fallback: trate como jid
  return { lid: null, jid: id };
};
// ===========================

const multVecardGet = function (param: any) {
  let output = " ";

  let name = param
    .split("\n")[2]
    .replace(";;;", "\n")
    .replace("N:", "")
    .replace(";", "")
    .replace(";", " ")
    .replace(";;", " ")
    .replace("\n", "");
  let inicio = param.split("\n")[4].indexOf("=");
  let fim = param.split("\n")[4].indexOf(":");
  let contact = param
    .split("\n")[4]
    .substring(inicio + 1, fim)
    .replace(";", "");
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "");
  //console.log(contact);
  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n";
  } else output = output + name + ": 📞" + contactSemWhats + "" + "\n";
  return output;
};

const contactsArrayMessageGet = (msg: any) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts;
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });

  let bodymessage = ``;
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + "";
  });

  let contacts = bodymessage.split("BEGIN:");

  contacts.shift();
  let finalContacts = "";
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact);
  }

  return finalContacts;
};

const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  const msgType = getContentType(msg.message);
  if (msg.message?.extendedTextMessage && msg.message?.extendedTextMessage?.contextInfo && msg.message?.extendedTextMessage?.contextInfo?.externalAdReply) {
    return 'adMetaPreview'; // Adicionado para tratar mensagens de anúncios;
  }
  if (msg.message?.viewOnceMessageV2) {
    return "viewOnceMessageV2";
  }
  return msgType;
};
const getAd = (msg: any): string => {
  if (
    msg.key.fromMe &&
    msg.message?.listResponseMessage?.contextInfo?.externalAdReply
  ) {
    let bodyMessage = `*${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title}*`;

    bodyMessage += `\n\n${msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.body}`;

    return bodyMessage;
  }
};

const getBodyButton = (msg: any): string => {
  try {
    if (
      msg?.messageType === "buttonsMessage" ||
      msg?.message?.buttonsMessage?.contentText
    ) {
      let bodyMessage = `[BUTTON]\n\n*${msg?.message?.buttonsMessage?.contentText}*\n\n`;
      // eslint-disable-next-line no-restricted-syntax
      for (const button of msg.message?.buttonsMessage?.buttons) {
        bodyMessage += `*${button.buttonId}* - ${button.buttonText.displayText}\n`;
      }

      return bodyMessage;
    }
    if (msg?.messageType === "viewOnceMessage" || msg?.message?.viewOnceMessage?.message?.interactiveMessage) {
      let bodyMessage = '';
      const buttons =
        msg?.message?.viewOnceMessage?.message?.interactiveMessage?.nativeFlowMessage?.buttons;

      const bodyTextWithPix = buttons?.[0]?.name === 'review_and_pay';
      const bodyTextWithButtons = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.body?.text;

      if (bodyTextWithPix) {
        bodyMessage += `[PIX]`;
      } else
        if (bodyTextWithButtons) {
          bodyMessage += `[BOTOES]`;
        }

      return bodyMessage;
    }

    if (msg?.messageType === "interactiveMessage" || msg?.message?.interactiveMessage) {
      let bodyMessage = '';
      console.log('mensagem enviada pelo cel', msg);

      // Verifica se há botões na mensagem
      const buttons = msg?.message?.interactiveMessage?.nativeFlowMessage?.buttons;
      console.log("Buttons:", buttons);

      // Verifica se buttons é um array e se contém o botão 'reviewand_pay'
      const bodyTextWithPix = Array.isArray(buttons) && buttons.some(button => button.name = 'review_and_pay');

      if (bodyTextWithPix) {
        bodyMessage += `[PIX]`;
        console.log("Mensagem de PIX detectada, adicionando [PIX] ao bodyMessage.");
      } else {
        console.log("Nenhuma mensagem de PIX encontrada.");
      }

      // Log do bodyMessage final antes do retorno
      console.log("bodyMessage final:", bodyMessage);
      // Retornar bodyMessage se não estiver vazio
      return bodyMessage || null; // Verifique se este ponto é alcançado
  }

    if (msg?.messageType === "viewOnceMessage" || msg?.message?.viewOnceMessage?.message?.interactiveMessage) {
      let bodyMessage = '';

      // Verifica se é uma mensagem de PIX (PIX)
      const bodyTextWithPix = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.header?.title;
      // Verifica se é uma mensagem com botões (BOTOES)
      const bodyTextWithButtons = msg?.message?.viewOnceMessage?.message?.interactiveMessage?.body?.text;

      if (bodyTextWithPix) {
        bodyMessage += `[PIX]`;
      } else
        if (bodyTextWithButtons) {
          bodyMessage += `[BOTOES]`;
        }

      return bodyMessage;
    }


    if (msg?.messageType === "listMessage" || msg?.message?.listMessage?.description) {
      let bodyMessage = `[LIST]\n\n`;
      bodyMessage += msg?.message?.listMessage?.title ? `*${msg?.message?.listMessage?.title}**\n` : 'sem titulo\n';
      bodyMessage += msg?.message?.listMessage?.description ? `*${msg?.message?.listMessage?.description}*\n\n` : 'sem descrição\n\n';
      bodyMessage += msg?.message?.listMessage?.footerText ? `${msg?.message?.listMessage?.footerText}\n\n` : '\n\n';
      const sections = msg?.message?.listMessage?.sections;
      if (sections && sections.length > 0) {
        for (const section of sections) {
          bodyMessage += section?.title ? `*${section.title}*\n` : 'Sem titulo';
          const rows = section?.rows;
          if (rows && rows.length > 0) {
            for (const row of rows) {
              const rowTitle = row?.title || '';
              const rowDescription = row?.description || 'Sem descrição';
              const rowId = row?.rowId || '';
              bodyMessage += `${rowTitle} - ${rowDescription} - ${rowId}\n`;
            }
          }
          bodyMessage += `\n`;
        }
      }
      return bodyMessage;
    }

  } catch (error) {
    logger.error(error);
  }
};

const getBodyPIX = (msg: any): string => {
  try {
    // Verifica se é uma mensagem interativa
    if (msg?.messageType === "interactiveMessage" || msg?.message?.interactiveMessage) {
      let bodyMessage = '[PIX]'; // Inicializa bodyMessage com [PIX]
      console.log('mensagem enviada pelo cel', msg);

      // Verifica se há botões na mensagem
      const buttons = msg?.message?.interactiveMessage?.nativeFlowMessage?.buttons;
      console.log("Buttons:", buttons);

      // Se buttons existe e contém o botão 'review_and_pay'
      const bodyTextWithPix = Array.isArray(buttons) && buttons.some(button => button.name = 'review_and_pay');

      // Se o botão específico foi encontrado
      if (bodyTextWithPix) {
        console.log("Mensagem de PIX detectada.");
      } else {
        console.log("Nenhuma mensagem de PIX encontrada.");
        return ''; // Retorna vazio se não encontrar o botão
      }

      // Log do bodyMessage final antes do retorno
      console.log("bodyMessage final:", bodyMessage);
      return bodyMessage; // Retorna [PIX]
    }
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
  }

  return ''; // Retorna uma string vazia se a condição inicial não for satisfeita
};

const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");

    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    let type = getTypeMessage(msg);

    if (type === undefined) console.log(JSON.stringify(msg));

    const types = {
      conversation: msg.message?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      ptvMessage: msg.message?.ptvMessage?.caption,
      extendedTextMessage: msg?.message?.extendedTextMessage?.text,
      buttonsResponseMessage:
        msg.message?.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage:
        msg.message?.listResponseMessage?.title ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage:
        msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo:
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.title,
      buttonsMessage:
        getBodyButton(msg) || msg.message?.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage:
        msg.message?.contactsArrayMessage?.contacts &&
        contactsArrayMessageGet(msg),
      //locationMessage: `Latitude: ${msg.message.locationMessage?.degreesLatitude} - Longitude: ${msg.message.locationMessage?.degreesLongitude}`,
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message?.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message?.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.caption,
      audioMessage: "Áudio",
      interactiveMessage: getBodyPIX(msg),
      listMessage:
        getBodyButton(msg) || msg.message?.listResponseMessage?.title,
        viewOnceMessage: getBodyButton(msg) || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId,
      reactionMessage: msg.message?.reactionMessage?.text || "reaction",
      senderKeyDistributionMessage:
        msg?.message?.senderKeyDistributionMessage
          ?.axolotlSenderKeyDistributionMessage,
      documentWithCaptionMessage:
        msg.message?.documentWithCaptionMessage?.message?.documentMessage
          ?.caption,
      viewOnceMessageV2:
        msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption,
        adMetaPreview: msgAdMetaPreview(
          msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.thumbnail,
          msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.title,
          msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.body,
          msg.message?.extendedTextMessage?.contextInfo?.externalAdReply?.sourceUrl,
          msg.message?.extendedTextMessage?.text
        ), // Adicionado para tratar mensagens de anúncios;
      editedMessage:
        msg?.message?.protocolMessage?.editedMessage?.conversation ||
        msg?.message?.editedMessage?.message?.protocolMessage?.editedMessage
          ?.conversation,
      ephemeralMessage:
        msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text,
      imageWhitCaptionMessage:
        msg?.message?.ephemeralMessage?.message?.imageMessage,
      highlyStructuredMessage: msg.message?.highlyStructuredMessage,
      protocolMessage:
        msg?.message?.protocolMessage?.editedMessage?.conversation,
      advertising:
        getAd(msg) ||
        msg.message?.listResponseMessage?.contextInfo?.externalAdReply?.title,
        pollCreationMessageV3: msg?.message?.pollCreationMessageV3 ? `*Enquete*\n${msg.message.pollCreationMessageV3.name}\n\n${msg.message.pollCreationMessageV3.options.map(option => option.optionName).join('\n')}` : null,
      eventMessage: msg?.message?.eventMessage?.name ? `*Nome do Evento: ${msg.message.eventMessage.name}*\n` : 'sem nome do evento\n',
    };

    const objKey = Object.keys(types).find(key => key === type);

    if (!objKey) {
      logger.warn(
        `#### Nao achou o type 152: ${type} ${JSON.stringify(msg.message)}`
      );
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};

const msgAdMetaPreview = (image, title, body, sourceUrl, messageUser) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");
    let data = `data:image/png;base64, ${b64} | ${sourceUrl} | ${title} | ${body} | ${messageUser}`;
    return data;
  }
};

export const getQuotedMessage = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];

  if (!body?.contextInfo?.quotedMessage) return;
  const quoted = extractMessageContent(
    body?.contextInfo?.quotedMessage[
      Object.keys(body?.contextInfo?.quotedMessage).values().next().value
    ]
  );

  return quoted;
};

export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  let reaction = msg?.message?.reactionMessage
    ? msg?.message?.reactionMessage?.key?.id
    : "";

  return reaction ? reaction : body?.contextInfo?.stanzaId;
};

const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;
  let senderId: any =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;
  // Ajuste para contatos que usam @lid (substitui pelo senderPn quando disponível)
  if (
    typeof senderId === "string" &&
    senderId.endsWith("@lid") &&
    (msg as any)?.key?.senderPn
  ) {
    senderId = (msg as any).key.senderPn + (senderId.includes("@g.us") ? "@g.us" : "@s.whatsapp.net");
  }

  return senderId && jidNormalizedUser(senderId);
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  let remoteId = msg.key.remoteJid;
  if (
    remoteId.endsWith("@lid") &&
    (msg as any)?.key?.senderPn
  ) {
    remoteId = (msg as any).key.senderPn + (isGroup ? "@g.us" : "@s.whatsapp.net");
  }
  return isGroup
    ? {
        id: getSenderMessage(msg, wbot),
        name: msg.pushName
      }
    : {
        id: remoteId,
        name: msg.key.fromMe ? rawNumber : msg.pushName
      };
};

function findCaption(obj) {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }

  for (const key in obj) {
    if (key === "caption" || key === "text" || key === "conversation") {
      return obj[key];
    }

    const result = findCaption(obj[key]);
    if (result) {
      return result;
    }
  }

  return null;
}

// const downloadMedia = async (msg: proto.IWebMessageInfo, companyId: number, whatsappId: number) => {
//   const mineType =
//     msg.message?.imageMessage ||
//     msg.message?.audioMessage ||
//     msg.message?.videoMessage ||
//     msg.message?.stickerMessage ||
//     msg.message?.documentMessage ||
//     msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
//     // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.documentMessage ||
//     msg.message?.ephemeralMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.stickerMessage ||
//     msg.message?.ephemeralMessage?.message?.imageMessage ||
//     msg.message?.viewOnceMessage?.message?.imageMessage ||
//     msg.message?.viewOnceMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage ||
//     msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.documentMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
//     msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
//     msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
//     msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
//     msg.message?.interactiveMessage?.header?.imageMessage ||
//     msg.message?.interactiveMessage?.header?.documentMessage ||
//     msg.message?.interactiveMessage?.header?.videoMessage;

//   // eslint-disable-next-line no-nested-ternary
//   const messageType = msg.message?.documentMessage
//     ? "document"
//     : mineType.mimetype.split("/")[0].replace("application", "document")
//       ? (mineType.mimetype
//         .split("/")[0]
//         .replace("application", "document") as MediaType)
//       : (mineType.mimetype.split("/")[0] as MediaType);

//   let stream: Transform;
//   let contDownload = 0;

//   while (contDownload < 10 && !stream) {
//     try {
//       const { mediaKey, directPath, url } =
//         msg.message?.imageMessage ||
//         msg.message?.audioMessage ||
//         msg.message?.videoMessage ||
//         msg.message?.stickerMessage ||
//         msg.message?.documentMessage ||
//         msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
//         msg.message?.ephemeralMessage?.message?.audioMessage ||
//         msg.message?.ephemeralMessage?.message?.documentMessage ||
//         msg.message?.ephemeralMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.stickerMessage ||
//         msg.message?.ephemeralMessage?.message?.imageMessage ||
//         msg.message?.viewOnceMessage?.message?.imageMessage ||
//         msg.message?.viewOnceMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.imageMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.videoMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.audioMessage ||
//         msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message?.documentMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
//         msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
//         msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
//         msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
//         msg.message?.interactiveMessage?.header?.imageMessage ||
//         msg.message?.interactiveMessage?.header?.documentMessage ||
//         msg.message?.interactiveMessage?.header?.videoMessage ||
//         { mediakey: undefined, directPath: undefined, url: undefined };
//       // eslint-disable-next-line no-await-in-loop
//       stream = await downloadContentFromMessage(
//         { mediaKey, directPath, url: directPath ? "" : url },
//         messageType
//       );

//     } catch (error) {
//       contDownload += 1;
//       // eslint-disable-next-line no-await-in-loop, no-loop-func
//       await new Promise(resolve => { setTimeout(resolve, 1000 * contDownload * 2) }
//       );

//       logger.warn(
//         `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id} companie ${companyId} conexão ${whatsappId}`
//       );

//       if (contDownload === 10) {
//         logger.warn(
//           `>>>> erro ao baixar o arquivo ${JSON.stringify(msg)}`
//         );
//       }
//     }
//   }

//   let buffer = Buffer.from([]);
//   try {
//     // eslint-disable-next-line no-restricted-syntax
//     for await (const chunk of stream) {
//       buffer = Buffer.concat([buffer, chunk]);
//     }
//   } catch (error) {
//     return { data: "error", mimetype: "", filename: "" };
//   }

//   if (!buffer) {
//     Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
//     Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
//     throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
//   }
//   let filename = msg.message?.documentMessage?.fileName || "";

//   if (!filename) {
//     const ext = mineType.mimetype.split("/")[1].split(";")[0];
//     filename = `${new Date().getTime()}.${ext}`;
//   }
//   const media = {
//     data: buffer,
//     mimetype: mineType.mimetype,
//     filename
//   };
//   return media;
// };

const getUnpackedMessage = (msg: proto.IWebMessageInfo) => {
  return (
    msg.message?.documentWithCaptionMessage?.message ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    msg.message?.ephemeralMessage?.message ||
    msg.message?.viewOnceMessage?.message ||
    msg.message?.viewOnceMessageV2?.message ||
    msg.message?.ephemeralMessage?.message ||
    msg.message?.templateMessage?.hydratedTemplate ||
    msg.message?.templateMessage?.hydratedFourRowTemplate ||
    msg.message?.templateMessage?.fourRowTemplate ||
    msg.message?.interactiveMessage?.header ||
    msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate ||
    msg.message
  )
}
const getMessageMedia = (message: proto.IMessage) => {
  return (
    message?.imageMessage ||
    message?.audioMessage ||
    message?.videoMessage ||
    message?.stickerMessage ||
    message?.documentMessage || null
  );
}
const downloadMedia = async (msg: proto.IWebMessageInfo, isImported: Date = null, wbot: Session, ticket: Ticket) => {
  const unpackedMessage = getUnpackedMessage(msg);
  const message = getMessageMedia(unpackedMessage);
  if (!message) {
    return null;
  }
  const fileLimit = parseInt(await CheckSettings1("downloadLimit", "9999"), 10);
  if (wbot && message?.fileLength && +message.fileLength > fileLimit * 1024 * 1024) {
    throw new Error("ERR_FILESIZE_OVER_LIMIT");
  }

  if (msg.message?.stickerMessage) {
    const urlAnt = "https://web.whatsapp.net";
    const directPath = msg.message?.stickerMessage?.directPath;
    const newUrl = "https://mmg.whatsapp.net";
    const final = newUrl + directPath;
    if (msg.message?.stickerMessage?.url?.includes(urlAnt)) {
      msg.message.stickerMessage.url = msg.message?.stickerMessage.url.replace(
        urlAnt,
        final
      );
    }
  }

  let buffer;
  try {
    buffer = await downloadMediaMessage(
      msg,
      "buffer",
      {},
      {
        logger,
        reuploadRequest: wbot.updateMediaMessage
      }
    );
  } catch (err) {
    if (isImported) {
      console.log(
        "Falha ao fazer o download de uma mensagem importada, provavelmente a mensagem já não esta mais disponível"
      );
    } else {
      console.error("Erro ao baixar mídia:", err);
    }
  }

  let filename = msg.message?.documentMessage?.fileName || "";

  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.ephemeralMessage?.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
    msg.message?.ephemeralMessage?.message?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.documentMessage ||
    msg.message?.ephemeralMessage?.message?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.imageMessage ||
    msg.message?.viewOnceMessage?.message?.imageMessage ||
    msg.message?.viewOnceMessage?.message?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.imageMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.videoMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.audioMessage ||
    msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
      ?.documentMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
    msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
    msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
    msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
    msg.message?.interactiveMessage?.header?.imageMessage ||
    msg.message?.interactiveMessage?.header?.documentMessage ||
    msg.message?.interactiveMessage?.header?.videoMessage;

  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  } else {
    filename = `${new Date().getTime()}_${filename}`;
  }

  const media = {
    data: buffer,
    mimetype: mineType.mimetype,
    filename
  };

  return media;
};

const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string = "";
  // try {
  //   profilePicUrl = await wbot.profilePictureUrl(msgContact.id, "image");
  // } catch (e) {
  //   Sentry.captureException(e);
  //   profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  // }

  // [LID/JID] extrai ids a partir do msgContact.id
  const { lid, jid } = parseLidJid(msgContact?.id);

  const contactData = {
    name: msgContact.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId,
    remoteJid: msgContact.id,
    whatsappId: wbot.id,
    wbot,
    // [LID/JID] novos campos
    lid,
    jid
  };

  if (contactData.isGroup) {
    contactData.number = msgContact.id.replace("@g.us", "");
  }

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { wid: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

export const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  ticketTraking: TicketTraking,
  isForwarded: boolean = false,
  isPrivate: boolean = false,
  wbot: Session
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const companyId = ticket.companyId;

  try {
    const media = await downloadMedia(msg, ticket?.imported, wbot, ticket);

    if (!media && ticket.imported) {
      const body =
        "*System:* \nFalha no download da mídia verifique no dispositivo";
      const messageData = {
        //mensagem de texto
        wid: msg.key.id,
        ticketId: ticket.id,
        contactId: msg.key.fromMe ? undefined : ticket.contactId,
        body,
        reactionMessage: msg.message?.reactionMessage,
        fromMe: msg.key.fromMe,
        mediaType: getTypeMessage(msg),
        read: msg.key.fromMe,
        quotedMsgId: quotedMsg?.id || msg.message?.reactionMessage?.key?.id,
        ack: msg.status,
        companyId: companyId,
        remoteJid:
          msg.key.remoteJid?.endsWith("@lid") && (msg as any).key?.senderPn
            ? (msg as any).key.senderPn + (ticket.isGroup ? "@g.us" : "@s.whatsapp.net")
            : msg.key.remoteJid,
        participant: msg.key.participant,
        timestamp: getTimestampMessage(msg.messageTimestamp),
        createdAt: new Date(
          Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
        ).toISOString(),
        dataJson: JSON.stringify(msg),
        ticketImported: ticket.imported,
        isForwarded,
        isPrivate
      };

      await ticket.update({
        lastMessage: body
      });
      logger.error(Error("ERR_WAPP_DOWNLOAD_MEDIA"));
      return CreateMessageService({ messageData, companyId: companyId });
    }

    if (!media) {
      throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
    }

    // if (!media.filename || media.mimetype === "audio/mp4") {
    //   const ext = media.mimetype === "audio/mp4" ? "m4a" : media.mimetype.split("/")[1].split(";")[0];
    //   media.filename = `${new Date().getTime()}.${ext}`;
    // } else {
    //   // ext = tudo depois do ultimo .
    //   const ext = media.filename.split(".").pop();
    //   // name = tudo antes do ultimo .
    //   const name = media.filename.split(".").slice(0, -1).join(".").replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    //   media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
    // }
    if (!media.filename) {
      const ext = media.mimetype.split("/")[1].split(";")[0];
      media.filename = `${new Date().getTime()}.${ext}`;
    } else {
      // ext = tudo depois do ultimo .
      const ext = media.filename.split(".").pop();
      // name = tudo antes do ultimo .
      const name = media.filename
        .split(".")
        .slice(0, -1)
        .join(".")
        .replace(/\s/g, "_")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      media.filename = `${name.trim()}_${new Date().getTime()}.${ext}`;
    }

    try {
      const folder = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        "public",
        `company${companyId}`
      );

      // const folder = `public/company${companyId}`; // Correção adicionada por Altemir 16-08-2023
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true }); // Correção adicionada por Altemir 16-08-2023
        fs.chmodSync(folder, 0o777);
      }

      await writeFile(
        join(folder, media.filename),
        media.data.toString("base64"),
        "base64"
      ) // Correção adicionada por Altemir 16-08-2023
        .then(() => {
          // console.log("Arquivo salvo com sucesso!");
          if (media.mimetype.includes("audio")) {
            console.log(media.mimetype);
            const inputFile = path.join(folder, media.filename);
            let outputFile: string;

            if (inputFile.endsWith(".mpeg")) {
              outputFile = inputFile.replace(".mpeg", ".mp3");
            } else if (inputFile.endsWith(".ogg")) {
              outputFile = inputFile.replace(".ogg", ".mp3");
            } else {
              // Trate outros formatos de arquivo conforme necessário
              //console.error("Formato de arquivo não suportado:", inputFile);
              return;
            }

            return new Promise<void>((resolve, reject) => {
              ffmpeg(inputFile)
                .toFormat("mp3")
                .save(outputFile)
                .on("end", () => {
                  resolve();
                })
                .on("error", (err: any) => {
                  reject(err);
                });
            });
          }
        });
      // .then(() => {
      //   //console.log("Conversão concluída!");
      //   // Aqui você pode fazer o que desejar com o arquivo MP3 convertido.
      // })
    } catch (err) {
      Sentry.setExtra("Erro media", {
        companyId: companyId,
        ticket,
        contact,
        media,
        quotedMsg
      });
      Sentry.captureException(err);
      logger.error(err);
      console.log(msg);
    }

    const body = getBodyMessage(msg);

    const messageData = {
      wid: msg.key.id,
      ticketId: ticket.id,
      contactId: msg.key.fromMe ? undefined : contact.id,
      body: body || media.filename,
      fromMe: msg.key.fromMe,
      read: msg.key.fromMe,
      mediaUrl: media.filename,
      mediaType: media.mimetype.split("/")[0],
      quotedMsgId: quotedMsg?.id,
      ack:
        Number(
          String(msg.status).replace("PENDING", "2").replace("NaN", "1")
        ) || 2,
    remoteJid:
      msg.key.remoteJid?.endsWith("@lid") && (msg as any).key?.senderPn
        ? (msg as any).key.senderPn + (ticket.isGroup ? "@g.us" : "@s.whatsapp.net")
        : msg.key.remoteJid,
      participant: msg.key.participant,
      dataJson: JSON.stringify(msg),
      ticketTrakingId: ticketTraking?.id,
      createdAt: new Date(
        Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
      ).toISOString(),
      ticketImported: ticket.imported,
      isForwarded,
      isPrivate
    };

    await ticket.update({
      lastMessage: body || media.filename
    });

    console.log("🔍🔍🔍 [wbotMessageListener] ticketImported:", ticket.imported, "messageData.ticketImported:", messageData.ticketImported);
    const newMessage = await CreateMessageService({
      messageData,
      companyId: companyId
    });

    if (!msg.key.fromMe && ticket.status === "closed") {
      await ticket.update({ status: "pending" });
      await ticket.reload({
        attributes: [
          "id",
          "uuid",
          "queueId",
          "isGroup",
          "channel",
          "status",
          "contactId",
          "useIntegration",
          "lastMessage",
          "updatedAt",
          "unreadMessages",
          "companyId",
          "whatsappId",
          "imported",
          "lgpdAcceptedAt",
          "amountUsedBotQueues",
          "useIntegration",
          "integrationId",
          "userId",
          "amountUsedBotQueuesNPS",
          "lgpdSendMessageAt",
          "isBot"
        ],
        include: [
          { model: Queue, as: "queue" },
          { model: User, as: "user" },
          { model: Contact, as: "contact" },
          { model: Whatsapp, as: "whatsapp" }
        ]
      });

      io.of(`/workspace-${companyId}`)
        // .to("closed")
        .emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });
      // console.log("emitiu socket 902", ticket.id)
      io.of(`/workspace-${companyId}`)
        // .to(ticket.status)
        //   .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }

    return newMessage;
  } catch (error) {
    console.log(error);
    logger.warn("Erro ao baixar media: ", JSON.stringify(msg));
  }
};

export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  ticketTraking?: TicketTraking,
  isPrivate?: boolean,
  isForwarded: boolean = false
) => {
  // console.log("Mensagem recebida:", JSON.stringify(msg, null, 2));
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);
  const companyId = ticket.companyId;

  const messageData = {
    wid: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack:
      Number(String(msg.status).replace("PENDING", "2").replace("NaN", "1")) ||
      2,
    remoteJid:
      msg.key.remoteJid?.endsWith("@lid") && (msg as any).key?.senderPn
        ? (msg as any).key.senderPn + (ticket.isGroup ? "@g.us" : "@s.whatsapp.net")
        : msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
    ticketTrakingId: ticketTraking?.id,
    isPrivate,
    createdAt: new Date(
      Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
    ).toISOString(),
    ticketImported: ticket.imported,
    isForwarded
  };

  await ticket.update({
    lastMessage: body
  });

  await CreateMessageService({ messageData, companyId: companyId });

  if (!msg.key.fromMe && ticket.status === "closed") {
    console.log("===== CHANGE =====");
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" },
        { model: Whatsapp, as: "whatsapp" }
      ]
    });

    // io.to("closed").emit(`company-${companyId}-ticket`, {
    //   action: "delete",
    //   ticket,
    //   ticketId: ticket.id
    // });

    if (!ticket.imported) {
      io.of(`/workspace-${companyId}`)
        // .to(ticket.status)
        // .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  }
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "ptvMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "interactiveMessage" ||
      msgType === "pollCreationMessageV3" ||
      msgType === "viewOnceMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "viewOnceMessageV2" ||
      msgType === "editedMessage" ||
      msgType === "advertisingMessage" ||
      msgType === "highlyStructuredMessage" ||
      msgType === "eventMessage" ||
      msgType === "adMetaPreview"; // Adicionado para tratar mensagens de anúncios

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};

const sendDialogflowAwswer = async (
  wbot: Session,
  ticket: Ticket,
  msg: WAMessage,
  contact: Contact,
  inputAudio: string | undefined,
  companyId: number,
  queueIntegration: QueueIntegrations
) => {
  const session = await createDialogflowSessionWithModel(queueIntegration);

  if (session === undefined) {
    return;
  }

  wbot.presenceSubscribe(contact.remoteJid);
  await delay(500);

  let dialogFlowReply = await queryDialogFlow(
    session,
    queueIntegration.projectName,
    contact.remoteJid,
    getBodyMessage(msg),
    queueIntegration.language,
    inputAudio
  );

  if (!dialogFlowReply) {
    wbot.sendPresenceUpdate("composing", contact.remoteJid);

    const bodyDuvida = formatBody(
      `\u200e *${queueIntegration?.name}:* Não consegui entender sua dúvida.`
    );

    await delay(1000);

    await wbot.sendPresenceUpdate("paused", contact.remoteJid);

    const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, {
      text: bodyDuvida
    });

    await verifyMessage(sentMessage, ticket, contact);
    return;
  }

  if (dialogFlowReply.endConversation) {
    await ticket.update({
      contactId: ticket.contact.id,
      useIntegration: false
    });
  }

  const image = dialogFlowReply.parameters.image?.stringValue ?? undefined;

  const react = dialogFlowReply.parameters.react?.stringValue ?? undefined;

  const audio = dialogFlowReply.encodedAudio.toString("base64") ?? undefined;

  wbot.sendPresenceUpdate("composing", contact.remoteJid);
  await delay(500);

  let lastMessage;

  for (let message of dialogFlowReply.responses) {
    lastMessage = message.text.text[0] ? message.text.text[0] : lastMessage;
  }
  for (let message of dialogFlowReply.responses) {
    if (message.text) {
      await sendDelayedMessages(
        wbot,
        ticket,
        contact,
        message.text.text[0],
        lastMessage,
        audio,
        queueIntegration
      );
    }
  }
};

async function sendDelayedMessages(
  wbot: Session,
  ticket: Ticket,
  contact: Contact,
  message: string,
  lastMessage: string,
  audio: string | undefined,
  queueIntegration: QueueIntegrations
) {
  const companyId = ticket.companyId;
  // console.log("GETTING WHATSAPP SEND DELAYED MESSAGES", ticket.whatsappId, wbot.id)
  const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
  const farewellMessage = whatsapp.farewellMessage.replace(/[_*]/g, "");

  // if (react) {
  //   const test =
  //     /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(
  //       react
  //     );
  //   if (test) {
  //     msg.react(react);
  //     await delay(1000);
  //   }
  // }
  const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, {
    text: `\u200e *${queueIntegration?.name}:* ` + message
  });

  await verifyMessage(sentMessage, ticket, contact);
  if (message != lastMessage) {
    await delay(500);
    wbot.sendPresenceUpdate("composing", contact.remoteJid);
  } else if (audio) {
    wbot.sendPresenceUpdate("recording", contact.remoteJid);
    await delay(500);

    // if (audio && message === lastMessage) {
    //   const newMedia = new MessageMedia("audio/ogg", audio);

    //   const sentMessage = await wbot.sendMessage(
    //     `${contact.number}@c.us`,
    //     newMedia,
    //     {
    //       sendAudioAsVoice: true
    //     }
    //   );

    //   await verifyMessage(sentMessage, ticket, contact);
    // }

    // if (sendImage && message === lastMessage) {
    //   const newMedia = await MessageMedia.fromUrl(sendImage, {
    //     unsafeMime: true
    //   });
    //   const sentMessage = await wbot.sendMessage(
    //     `${contact.number}@c.us`,
    //     newMedia,
    //     {
    //       sendAudioAsVoice: true
    //     }
    //   );

    //   await verifyMessage(sentMessage, ticket, contact);
    //   await ticket.update({ lastMessage: "📷 Foto" });
    // }

    if (farewellMessage && message.includes(farewellMessage)) {
      await delay(1000);
      setTimeout(async () => {
        await ticket.update({
          contactId: ticket.contact.id,
          useIntegration: true
        });
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId: companyId
        });
      }, 3000);
    }
  }
}

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact,
  settings?: any,
  ticketTraking?: TicketTraking
) => {
  const companyId = ticket.companyId;

  console.log("verifyQueue");
  // console.log("GETTING WHATSAPP VERIFY QUEUE", ticket.whatsappId, wbot.id)
  const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } =
    await ShowWhatsAppService(wbot.id!, companyId);

  let chatbot = false;

  if (queues.length === 1) {
    console.log("log... 1186");
    chatbot = queues[0]?.chatbots.length > 1;
  }

  const enableQueuePosition = settings.sendQueuePosition === "enabled";

  if (queues.length === 1 && !chatbot) {
    const sendGreetingMessageOneQueues =
      settings.sendGreetingMessageOneQueues === "enabled" || false;

    console.log("log... 1195");

    //inicia integração dialogflow/n8n
    if (!msg.key.fromMe && !ticket.isGroup && queues[0].integrationId) {
      const integrations = await ShowQueueIntegrationService(
        queues[0].integrationId,
        companyId
      );

      console.log("log... 1206");

      await handleMessageIntegration(
        msg,
        wbot,
        companyId,
        integrations,
        ticket,
        null,
        null,
        null,
        null
      );

      if (msg.key.fromMe) {
        console.log("log... 1211");

        await ticket.update({
          typebotSessionTime: moment().toDate(),
          useIntegration: true,
          integrationId: integrations.id
        });
      } else {
        await ticket.update({
          useIntegration: true,
          integrationId: integrations.id
        });
      }

      // return;
    }

    if (greetingMessage.length > 1 && sendGreetingMessageOneQueues) {
      console.log("log... 1226");
      const body = formatBody(`${greetingMessage}`, ticket);

      if (ticket.whatsapp.greetingMediaAttachment !== null) {
        const filePath = path.resolve(
          "public",
          `company${companyId}`,
          ticket.whatsapp.greetingMediaAttachment
        );

        const fileExists = fs.existsSync(filePath);

        if (fileExists) {
          console.log("log... 1235");
          const messagePath = ticket.whatsapp.greetingMediaAttachment;
          const optionsMsg = await getMessageOptions(
            messagePath,
            filePath,
            String(companyId),
            body
          );
          const debouncedSentgreetingMediaAttachment = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                { ...optionsMsg }
              );

              await verifyMediaMessage(
                sentMessage,
                ticket,
                contact,
                ticketTraking,
                false,
                false,
                wbot
              );
            },
            1000,
            ticket.id
          );
          debouncedSentgreetingMediaAttachment();
        } else {
          console.log("log... 1250");
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: body
            }
          );
        }
      } else {
        console.log("log... 1259");
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );
      }
    }

    if (!isNil(queues[0].fileListId)) {
      console.log("log... 1278");
      try {
        const publicFolder = path.resolve(
          __dirname,
          "..",
          "..",
          "..",
          "public"
        );

        const files = await ShowFileService(
          queues[0].fileListId,
          ticket.companyId
        );

        const folder = path.resolve(
          publicFolder,
          `company${ticket.companyId}`,
          "fileList",
          String(files.id)
        );

        for (const [index, file] of files.options.entries()) {
          const mediaSrc = {
            fieldname: "medias",
            originalname: file.path,
            encoding: "7bit",
            mimetype: file.mediaType,
            filename: file.path,
            path: path.resolve(folder, file.path)
          } as Express.Multer.File;

          await SendWhatsAppMedia({
            media: mediaSrc,
            ticket,
            body: file.name,
            isPrivate: false,
            isForwarded: false
          });
        }
      } catch (error) {
        logger.info(error);
      }
    }

    if (queues[0].closeTicket) {
      console.log("log... 1297");
      await UpdateTicketService({
        ticketData: {
          status: "closed",
          queueId: queues[0].id
          // sendFarewellMessage: false
        },
        ticketId: ticket.id,
        companyId
      });

      return;
    } else {
      console.log("log... 1310");
      await UpdateTicketService({
        ticketData: {
          queueId: queues[0].id,
          status: ticket.status === "lgpd" ? "pending" : ticket.status
        },
        ticketId: ticket.id,
        companyId
      });
    }

    const count = await Ticket.findAndCountAll({
      where: {
        userId: null,
        status: "pending",
        companyId,
        queueId: queues[0].id,
        isGroup: false
      }
    });

    if (enableQueuePosition) {
      console.log("log... 1329");
      // Lógica para enviar posição da fila de atendimento
      const qtd = count.count === 0 ? 1 : count.count;
      const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
      // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
      const bodyFila = formatBody(`${msgFila}`, ticket);
      const debouncedSentMessagePosicao = debounce(
        async () => {
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            {
              text: bodyFila
            }
          );
        },
        3000,
        ticket.id
      );
      debouncedSentMessagePosicao();
    }

    return;
  }

  // REGRA PARA DESABILITAR O BOT PARA ALGUM CONTATO
  if (contact.disableBot) {
    return;
  }

  let selectedOption = "";

  if (ticket.status !== "lgpd") {
    console.log("log... 1367");
    selectedOption =
      msg?.message?.buttonsResponseMessage?.selectedButtonId ||
      msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
      getBodyMessage(msg);
  } else {
    if (!isNil(ticket.lgpdAcceptedAt))
      await ticket.update({
        status: "pending"
      });

    await ticket.reload();
  }

  if (String(selectedOption).toLocaleLowerCase() == "sair") {
    // Encerra atendimento

    console.log("log... 1384");

    const ticketData = {
      isBot: false,
      status: "closed",
      sendFarewellMessage: true,
      maxUseBotQueues: 0
    };

    await UpdateTicketService({ ticketData, ticketId: ticket.id, companyId });
    // await ticket.update({ queueOptionId: null, chatbot: false, queueId: null, userId: null, status: "closed"});
    //await verifyQueue(wbot, msg, ticket, ticket.contact);

    // const complationMessage = ticket.whatsapp?.complationMessage;

    // console.log(complationMessage)
    // const textMessage = {
    //   text: formatBody(`\u200e${complationMessage}`, ticket),
    // };

    // if (!isNil(complationMessage)) {
    //   const sendMsg = await wbot.sendMessage(
    //     `${ticket?.contact?.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    //     textMessage
    //   );

    //   await verifyMessage(sendMsg, ticket, ticket.contact);
    // }

    return;
  }

  let choosenQueue =
    chatbot && queues.length === 1
      ? queues[+selectedOption]
      : queues[+selectedOption - 1];

  console.log("log... 1419");

  const typeBot = settings?.chatBotType || "text";

  // Serviço p/ escolher consultor aleatório para o ticket, ao selecionar fila.
  let randomUserId;

  if (choosenQueue) {
    console.log("log... 1427");
    try {
      const userQueue = await ListUserQueueServices(choosenQueue.id);

      if (userQueue.userId > -1) {
        randomUserId = userQueue.userId;
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Ativar ou desativar opção de escolher consultor aleatório.
  /*   let settings = await CompaniesSettings.findOne({
      where: {
        companyId: companyId
      }
    }); */

  const botText = async () => {
    console.log("log... 1449");

    if (choosenQueue || (queues.length === 1 && chatbot)) {
      console.log("log... 1452");
      // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
      if (queues.length === 1) choosenQueue = queues[0];
      const queue = await Queue.findByPk(choosenQueue.id);

      console.log("log... 1457");

      if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
        console.log("log... 1460");
        await ticketTraking.update({
          chatbotAt: null
        });
        await ticket.update({
          amountUsedBotQueues: 0
        });
      }

      let currentSchedule;

      if (settings?.scheduleType === "queue") {
        console.log("log... 1472");
        currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
      }

      if (
        settings?.scheduleType === "queue" &&
        ticket.status !== "open" &&
        !isNil(currentSchedule) &&
        (ticket.amountUsedBotQueues < maxUseBotQueues ||
          maxUseBotQueues === 0) &&
        (!currentSchedule || currentSchedule.inActivity === false) &&
        (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
      ) {
        if (timeUseBotQueues !== "0") {
          console.log("log... 1483");
          //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
          //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
          let dataLimite = new Date();
          let Agora = new Date();

          if (ticketTraking.chatbotAt !== null) {
            console.log("log... 1491");
            dataLimite.setMinutes(
              ticketTraking.chatbotAt.getMinutes() + Number(timeUseBotQueues)
            );

            if (
              ticketTraking.chatbotAt !== null &&
              Agora < dataLimite &&
              timeUseBotQueues !== "0" &&
              ticket.amountUsedBotQueues !== 0
            ) {
              return;
            }
          }
          await ticketTraking.update({
            chatbotAt: null
          });
        }

        const outOfHoursMessage = queue.outOfHoursMessage;

        if (outOfHoursMessage !== "") {
          // console.log("entrei3");
          const body = formatBody(`${outOfHoursMessage}`, ticket);

          console.log("log... 1509");

          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            1000,
            ticket.id
          );
          debouncedSentMessage();

          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          // await ticket.update({
          //   queueId: queue.id,
          //   isOutOfHour: true,
          //   amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          // });

          // return;
        }
        //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
        await ticket.update({
          queueId: queue.id,
          isOutOfHour: true,
          amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });
        return;
      }

      await UpdateTicketService({
        ticketData: {
          // amountUsedBotQueues: 0,
          queueId: choosenQueue.id
        },
        // ticketData: { queueId: queues.length ===1 ? null : choosenQueue.id },
        ticketId: ticket.id,
        companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
        console.log("log... 1554");
        let options = "";
        choosenQueue.chatbots.forEach((chatbot, index) => {
          options += `*[ ${index + 1} ]* - ${chatbot.name}\n`;
        });

        const body = formatBody(
          `\u200e ${choosenQueue.greetingMessage}\n\n${options}\n*[ # ]* Voltar para o menu principal\n*[ Sair ]* Encerrar atendimento`,
          ticket
        );

        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,

          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);

        if (settings?.settingsUserRandom === "enabled") {
          console.log("log... 1576");
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId
          });
        }
      }

      if (
        !choosenQueue.chatbots.length &&
        choosenQueue.greetingMessage.length !== 0
      ) {
        console.log("log... 1586");
        console.log(choosenQueue.greetingMessage);
        const body = formatBody(
          `\u200e${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);
      }

      if (!isNil(choosenQueue.fileListId)) {
        try {
          const publicFolder = path.resolve(
            __dirname,
            "..",
            "..",
            "..",
            "public"
          );

          const files = await ShowFileService(
            choosenQueue.fileListId,
            ticket.companyId
          );

          const folder = path.resolve(
            publicFolder,
            `company${ticket.companyId}`,
            "fileList",
            String(files.id)
          );

          for (const [index, file] of files.options.entries()) {
            const mediaSrc = {
              fieldname: "medias",
              originalname: file.path,
              encoding: "7bit",
              mimetype: file.mediaType,
              filename: file.path,
              path: path.resolve(folder, file.path)
            } as Express.Multer.File;

            // const debouncedSentMessagePosicao = debounce(
            //   async () => {
            const sentMessage = await SendWhatsAppMedia({
              media: mediaSrc,
              ticket,
              body: `\u200e ${file.name}`,
              isPrivate: false,
              isForwarded: false
            });

            await verifyMediaMessage(
              sentMessage,
              ticket,
              ticket.contact,
              ticketTraking,
              false,
              false,
              wbot
            );
            //   },
            //   2000,
            //   ticket.id
            // );
            // debouncedSentMessagePosicao();
          }
        } catch (error) {
          logger.info(error);
        }
      }

      await delay(4000);

      //se fila está parametrizada para encerrar ticket automaticamente
      if (choosenQueue.closeTicket) {
        try {
          await UpdateTicketService({
            ticketData: {
              status: "closed",
              queueId: choosenQueue.id
              // sendFarewellMessage: false,
            },
            ticketId: ticket.id,
            companyId
          });
        } catch (error) {
          logger.info(error);
        }

        return;
      }

      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId,
          queueId: choosenQueue.id,
          whatsappId: wbot.id,
          isGroup: false
        }
      });

      console.log("======== choose queue ========");
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: choosenQueue.id
      });

      if (enableQueuePosition && !choosenQueue.chatbots.length) {
        // Lógica para enviar posição da fila de atendimento
        const qtd = count.count === 0 ? 1 : count.count;
        const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
        // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: bodyFila
              }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }
    } else {
      if (ticket.isGroup) return;

      if (
        maxUseBotQueues &&
        maxUseBotQueues !== 0 &&
        ticket.amountUsedBotQueues >= maxUseBotQueues
      ) {
        // await UpdateTicketService({
        //   ticketData: { queueId: queues[0].id },
        //   ticketId: ticket.id
        // });

        return;
      }

      if (timeUseBotQueues !== "0") {
        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
        //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
        let dataLimite = new Date();
        let Agora = new Date();

        console.log("log... 1749");

        if (ticketTraking.chatbotAt !== null) {
          dataLimite.setMinutes(
            ticketTraking.chatbotAt.getMinutes() + Number(timeUseBotQueues)
          );

          console.log("log... 1754");

          if (
            ticketTraking.chatbotAt !== null &&
            Agora < dataLimite &&
            timeUseBotQueues !== "0" &&
            ticket.amountUsedBotQueues !== 0
          ) {
            return;
          }
        }
        await ticketTraking.update({
          chatbotAt: null
        });
      }

      // if (wbot.waitForSocketOpen()) {
      //   console.log("AGUARDANDO")
      //   console.log(wbot.waitForSocketOpen())
      // }

      wbot.presenceSubscribe(contact.remoteJid);

      let options = "";

      wbot.sendPresenceUpdate("composing", contact.remoteJid);

      console.log("============= queue menu =============");
      queues.forEach((queue, index) => {
        options += `*[ ${index + 1} ]* - ${queue.name}\n`;
      });
      options += `\n*[ Sair ]* - Encerrar atendimento`;

      const body = formatBody(`\u200e${greetingMessage}\n\n${options}`, ticket);

      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "chatBot"
      });

      await delay(1000);

      await wbot.sendPresenceUpdate("paused", contact.remoteJid);

      if (ticket.whatsapp.greetingMediaAttachment !== null) {
        console.log("log... 1799");

        const filePath = path.resolve(
          "public",
          `company${companyId}`,
          ticket.whatsapp.greetingMediaAttachment
        );

        const fileExists = fs.existsSync(filePath);
        // console.log(fileExists);
        if (fileExists) {
          const messagePath = ticket.whatsapp.greetingMediaAttachment;
          const optionsMsg = await getMessageOptions(
            messagePath,
            filePath,
            String(companyId),
            body
          );

          console.log("log... 1809");

          const debouncedSentgreetingMediaAttachment = debounce(
            async () => {
              let sentMessage = await wbot.sendMessage(
                `${ticket.contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                { ...optionsMsg }
              );

              await verifyMediaMessage(
                sentMessage,
                ticket,
                contact,
                ticketTraking,
                false,
                false,
                wbot
              );
            },
            1000,
            ticket.id
          );
          debouncedSentgreetingMediaAttachment();
        } else {
          console.log("log... 1824");
          const debouncedSentMessage = debounce(
            async () => {
              const sentMessage = await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );

              await verifyMessage(sentMessage, ticket, contact, ticketTraking);
            },
            1000,
            ticket.id
          );
          debouncedSentMessage();
        }

        console.log("log... 1843");

        await UpdateTicketService({
          ticketData: {
            // amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          },
          ticketId: ticket.id,
          companyId
        });

        return;
      } else {
        console.log("log... 1854");

        const debouncedSentMessage = debounce(
          async () => {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: body
              }
            );

            await verifyMessage(sentMessage, ticket, contact, ticketTraking);
          },
          1000,
          ticket.id
        );

        await UpdateTicketService({
          ticketData: {},
          ticketId: ticket.id,
          companyId
        });

        debouncedSentMessage();
      }
    }
  };

  const botList = async () => {

    console.log("log... 1449")

    if (choosenQueue || (queues.length === 1 && chatbot)) {
      console.log("log... 1452")
      // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
      if (queues.length === 1) choosenQueue = queues[0]
      const queue = await Queue.findByPk(choosenQueue.id);

      console.log("log... 1457")

      if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
        console.log("log... 1460")
        await ticketTraking.update({
          chatbotAt: null
        });
        await ticket.update({
          amountUsedBotQueues: 0
        });
      }

      let currentSchedule;

      if (settings?.scheduleType === "queue") {
        console.log("log... 1472")
        currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
      }

      if (
        settings?.scheduleType === "queue" && ticket.status !== "open" &&
        !isNil(currentSchedule) && (ticket.amountUsedBotQueues < maxUseBotQueues || maxUseBotQueues === 0)
        && (!currentSchedule || currentSchedule.inActivity === false)
        && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
      ) {
        if (timeUseBotQueues !== "0") {
          console.log("log... 1483")
          //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
          //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
          let dataLimite = new Date();
          let Agora = new Date();


          if (ticketTraking.chatbotAt !== null) {
            console.log("log... 1491")
            dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

            if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
              return
            }
          }
          await ticketTraking.update({
            chatbotAt: null
          })
        }

        const outOfHoursMessage = queue.outOfHoursMessage;

        if (outOfHoursMessage !== "") {
          // console.log("entrei3");
          const body = formatBody(`${outOfHoursMessage}`, ticket);

          console.log("log... 1509")

          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            1000,
            ticket.id
          );
          debouncedSentMessage();

          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          // await ticket.update({
          //   queueId: queue.id,
          //   isOutOfHour: true,
          //   amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          // });

          // return;

        }
        //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
        await ticket.update({
          queueId: queue.id,
          isOutOfHour: true,
          amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });
        return;
      }

      await UpdateTicketService({
        ticketData: {
          // amountUsedBotQueues: 0, 
          queueId: choosenQueue.id
        },
        // ticketData: { queueId: queues.length ===1 ? null : choosenQueue.id },
        ticketId: ticket.id,
        companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
        console.log("log... 1554")

        const sectionsRows = [];

        choosenQueue.chatbots.forEach((chatbot, index) => {
          sectionsRows.push({
            title: chatbot.name,
            rowId: `${index + 1}`
          });
        });
        sectionsRows.push({
          title: "Voltar Menu Inicial",
          rowId: "#"
        });
        const sections = [
          {
            title: 'Lista de Botões',
            rows: sectionsRows
          }
        ];

        const listMessage = {
          text: formatBody(`\u200e${queue.greetingMessage}\n`),
          title: "Lista\n",
          buttonText: "Clique aqui",
          //footer: ".",
          //listType: 2,
          sections
        };
        const sendMsg = await wbot.sendMessage(
          `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );

        await verifyMessage(sendMsg, ticket, contact, ticketTraking);



        if (settings?.settingsUserRandom === "enabled") {
          console.log("log... 1576")
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId
          });
        }
      }

      if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {
        console.log("log... 1586")
        console.log(choosenQueue.greetingMessage)
        const body = formatBody(
          `\u200e${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);

      }


      if (!isNil(choosenQueue.fileListId)) {
        try {

          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

          const files = await ShowFileService(choosenQueue.fileListId, ticket.companyId)

          const folder = path.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id))

          for (const [index, file] of files.options.entries()) {
            const mediaSrc = {
              fieldname: 'medias',
              originalname: file.path,
              encoding: '7bit',
              mimetype: file.mediaType,
              filename: file.path,
              path: path.resolve(folder, file.path),
            } as Express.Multer.File

            // const debouncedSentMessagePosicao = debounce(
            //   async () => {
            const sentMessage = await SendWhatsAppMedia({ media: mediaSrc, ticket, body: `\u200e ${file.name}`, isPrivate: false, isForwarded: false });

            await verifyMediaMessage(sentMessage, ticket, ticket.contact, ticketTraking, false, false, wbot);
            //   },
            //   2000,
            //   ticket.id
            // );
            // debouncedSentMessagePosicao();
          };


        } catch (error) {
          logger.info(error);
        }
      }

      await delay(4000)


      //se fila está parametrizada para encerrar ticket automaticamente
      if (choosenQueue.closeTicket) {
        try {

          await UpdateTicketService({
            ticketData: {
              status: "closed",
              queueId: choosenQueue.id,
              // sendFarewellMessage: false,
            },
            ticketId: ticket.id,
            companyId,
          });
        } catch (error) {
          logger.info(error);
        }

        return;
      }

      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId,
          queueId: choosenQueue.id,
          whatsappId: wbot.id,
          isGroup: false
        }
      });

      console.log("======== choose queue ========")
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: choosenQueue.id
      });

      if (enableQueuePosition && !choosenQueue.chatbots.length) {
        // Lógica para enviar posição da fila de atendimento
        const qtd = count.count === 0 ? 1 : count.count
        const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
        // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: bodyFila
              }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }


    } else {

      if (ticket.isGroup) return;

      if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
        // await UpdateTicketService({
        //   ticketData: { queueId: queues[0].id },
        //   ticketId: ticket.id
        // });

        return;
      }

      if (timeUseBotQueues !== "0") {
        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
        //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
        let dataLimite = new Date();
        let Agora = new Date();

        console.log("log... 1749")

        if (ticketTraking.chatbotAt !== null) {
          dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

          console.log("log... 1754")

          if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
            return
          }
        }
        await ticketTraking.update({
          chatbotAt: null
        })
      }

      // if (wbot.waitForSocketOpen()) {
      //   console.log("AGUARDANDO")
      //   console.log(wbot.waitForSocketOpen())
      // }

      wbot.presenceSubscribe(contact.remoteJid);


      let options = "";

      wbot.sendPresenceUpdate("composing", contact.remoteJid);

      console.log("============= queue menu =============")
      const sectionsRows = [];

      queues.forEach((queue, index) => {
        sectionsRows.push({
          title: `${queue.name}`,//queue.name,
          description: `_`,
          rowId: `${index + 1}`
        });
      });

     sectionsRows.push({
          title: "Voltar Menu Inicial",
          rowId: "#"
        });
        
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "chatBot"
      });

      await delay(1000);
      const body = formatBody(
        `\u200e${greetingMessage}\n\n${options}`,
        ticket
      );

      await wbot.sendPresenceUpdate('paused', contact.remoteJid)

      if (ticket.whatsapp.greetingMediaAttachment !== null) {

        console.log("log... 1799")

        const filePath = path.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);

        const fileExists = fs.existsSync(filePath);
        // console.log(fileExists);
        if (fileExists) {
          const messagePath = ticket.whatsapp.greetingMediaAttachment
          const optionsMsg = await getMessageOptions(messagePath, filePath, String(companyId), body);

          console.log("log... 1809")

          const debouncedSentgreetingMediaAttachment = debounce(
            async () => {

              let sentMessage = await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, { ...optionsMsg });

              await verifyMediaMessage(sentMessage, ticket, contact, ticketTraking, false, false, wbot);

            },
            1000,
            ticket.id
          );
          debouncedSentgreetingMediaAttachment();
        } else {
          console.log("log... 1824")
          const debouncedSentMessage = debounce(
            async () => {
              const sections = [
                {
                  title: 'Lista de Botões',
                  rows: sectionsRows
                }
              ];

              const listMessage = {
                title: "Lista\n",
                text: formatBody(`\u200e${greetingMessage}\n`),
                buttonText: "Clique aqui",
                //footer: "_",
                sections
              };

              const sendMsg = await wbot.sendMessage(
                `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
                listMessage
              );

              await verifyMessage(sendMsg, ticket, contact, ticketTraking);

            },
            1000,
            ticket.id
          );
          debouncedSentMessage();
        }

        console.log("log... 1843")

        await UpdateTicketService({
          ticketData: {
            // amountUsedBotQueues: ticket.amountUsedBotQueues + 1 
          },
          ticketId: ticket.id,
          companyId
        });

        return
      } else {

        console.log("log... 1854 - Lista")

        const debouncedSentMessage = debounce(
          async () => {
            const sections = [
              {
                title: 'Lista de Botões',
                rows: sectionsRows
              }
            ];

            const listMessage = {
              title: "Lista\n",
              text: formatBody(`\u200e${greetingMessage}\n`),
              buttonText: "Clique aqui",
              //footer: "_",
              sections
            };

            const sendMsg = await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              listMessage
            );

            await verifyMessage(sendMsg, ticket, contact, ticketTraking);
          },
          1000,
          ticket.id
        );

        await UpdateTicketService({
          ticketData: {

          },
          ticketId: ticket.id,
          companyId
        });

        debouncedSentMessage();
      }
    }
  };

  const botButton = async () => {

    console.log("log... 1449")

    if (choosenQueue || (queues.length === 1 && chatbot)) {
      console.log("log... 1452")
      // console.log("entrou no choose", ticket.isOutOfHour, ticketTraking.chatbotAt)
      if (queues.length === 1) choosenQueue = queues[0]
      const queue = await Queue.findByPk(choosenQueue.id);

      console.log("log... 1457")

      if (ticket.isOutOfHour === false && ticketTraking.chatbotAt !== null) {
        console.log("log... 1460")
        await ticketTraking.update({
          chatbotAt: null
        });
        await ticket.update({
          amountUsedBotQueues: 0
        });
      }

      let currentSchedule;

      if (settings?.scheduleType === "queue") {
        console.log("log... 1472")
        currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
      }

      if (
        settings?.scheduleType === "queue" && ticket.status !== "open" &&
        !isNil(currentSchedule) && (ticket.amountUsedBotQueues < maxUseBotQueues || maxUseBotQueues === 0)
        && (!currentSchedule || currentSchedule.inActivity === false)
        && (!ticket.isGroup || ticket.whatsapp?.groupAsTicket === "enabled")
      ) {
        if (timeUseBotQueues !== "0") {
          console.log("log... 1483")
          //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
          //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
          let dataLimite = new Date();
          let Agora = new Date();


          if (ticketTraking.chatbotAt !== null) {
            console.log("log... 1491")
            dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

            if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
              return
            }
          }
          await ticketTraking.update({
            chatbotAt: null
          })
        }

        const outOfHoursMessage = queue.outOfHoursMessage;

        if (outOfHoursMessage !== "") {
          // console.log("entrei3");
          const body = formatBody(`${outOfHoursMessage}`, ticket);

          console.log("log... 1509")

          const debouncedSentMessage = debounce(
            async () => {
              await wbot.sendMessage(
                `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  text: body
                }
              );
            },
            1000,
            ticket.id
          );
          debouncedSentMessage();

        }

        await ticket.update({
          queueId: queue.id,
          isOutOfHour: true,
          amountUsedBotQueues: ticket.amountUsedBotQueues + 1
        });
        return;
      }

      await UpdateTicketService({
        ticketData: {
          queueId: choosenQueue.id
        },
        ticketId: ticket.id,
        companyId
      });
      // }

      if (choosenQueue.chatbots.length > 0 && !ticket.isGroup) {
        console.log("log... 1554")
        const debouncedSentMessage = debounce(
          async () => {
            try {
              console.log("log... enviando as opcoes das filas");
              // Busca o número do WhatsApp associado ao ticket
              const whatsapp = await Whatsapp.findOne({ where: { id: ticket.whatsappId } });
              if (!whatsapp || !whatsapp.number) {
                console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                throw new Error('Número de WhatsApp não encontrado');
              }
              const botNumber = whatsapp.number;

              const buttons = [];

              // Adiciona os chatbots como botões
              choosenQueue.chatbots.forEach((chatbot, index) => {
                buttons.push({
                  name: 'quick_reply',  // Substitua por 'quick_reply' se necessário, dependendo do contexto
                  buttonParamsJson: JSON.stringify({
                    display_text: chatbot.name,
                    id: `${index + 1}`
                  })
                });
              });

              buttons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: "Voltar Menu Inicial",
                  id: "#"
                })
              });
              const interactiveMsg = {
                viewOnceMessage: {
                  message: {
                    interactiveMessage: {
                      body: {
                        text: `\u200e${choosenQueue.greetingMessage}`,
                      },
                      nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: JSON.stringify({
                          from: 'apiv2',
                          templateId: '4194019344155670',
                        }),
                      },
                    },
                  },
                },
              };
              const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
              const newMsg = generateWAMessageFromContent(jid, interactiveMsg, { userJid: botNumber, });
              await wbot.relayMessage(jid, newMsg.message!, { messageId: newMsg.key.id }
              );
              if (newMsg) {
                await wbot.upsertMessage(newMsg, 'notify');
              }
            } catch (error) {
              console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
            }
          },
          1000,
          ticket.id
        );
        debouncedSentMessage();

     if (settings?.settingsUserRandom === "enabled") {
          console.log("log... 1576")
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId
          });
        }
      }

      if (!choosenQueue.chatbots.length && choosenQueue.greetingMessage.length !== 0) {
        console.log("log... 1586")
        console.log(choosenQueue.greetingMessage)
        const body = formatBody(
          `\u200e${choosenQueue.greetingMessage}`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: body
          }
        );

        await verifyMessage(sentMessage, ticket, contact, ticketTraking);

      }


      if (!isNil(choosenQueue.fileListId)) {
        try {

          const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

          const files = await ShowFileService(choosenQueue.fileListId, ticket.companyId)

          const folder = path.resolve(publicFolder, `company${ticket.companyId}`, "fileList", String(files.id))

          for (const [index, file] of files.options.entries()) {
            const mediaSrc = {
              fieldname: 'medias',
              originalname: file.path,
              encoding: '7bit',
              mimetype: file.mediaType,
              filename: file.path,
              path: path.resolve(folder, file.path),
            } as Express.Multer.File

            // const debouncedSentMessagePosicao = debounce(
            //   async () => {
            const sentMessage = await SendWhatsAppMedia({ media: mediaSrc, ticket, body: `\u200e ${file.name}`, isPrivate: false, isForwarded: false });

            await verifyMediaMessage(sentMessage, ticket, ticket.contact, ticketTraking, false, false, wbot);
            //   },
            //   2000,
            //   ticket.id
            // );
            // debouncedSentMessagePosicao();
          };


        } catch (error) {
          logger.info(error);
        }
      }

      await delay(4000)


      //se fila está parametrizada para encerrar ticket automaticamente
      if (choosenQueue.closeTicket) {
        try {

          await UpdateTicketService({
            ticketData: {
              status: "closed",
              queueId: choosenQueue.id,
              // sendFarewellMessage: false,
            },
            ticketId: ticket.id,
            companyId,
          });
        } catch (error) {
          logger.info(error);
        }

        return;
      }

      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId,
          queueId: choosenQueue.id,
          whatsappId: wbot.id,
          isGroup: false
        }
      });

      console.log("======== choose queue ========")
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: choosenQueue.id
      });

      if (enableQueuePosition && !choosenQueue.chatbots.length) {
        // Lógica para enviar posição da fila de atendimento
        const qtd = count.count === 0 ? 1 : count.count
        const msgFila = `${settings.sendQueuePositionMessage} *${qtd}*`;
        // const msgFila = `*Assistente Virtual:*\n{{ms}} *{{name}}*, sua posição na fila de atendimento é: *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"
              }`,
              {
                text: bodyFila
              }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }


    } else {

      if (ticket.isGroup) return;

      if (maxUseBotQueues && maxUseBotQueues !== 0 && ticket.amountUsedBotQueues >= maxUseBotQueues) {
        // await UpdateTicketService({
        //   ticketData: { queueId: queues[0].id },
        //   ticketId: ticket.id
        // });

        return;
      }

      if (timeUseBotQueues !== "0") {
        //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
        //const ticketTraking = await FindOrCreateATicketTrakingService({ ticketId: ticket.id, companyId });
        let dataLimite = new Date();
        let Agora = new Date();

        console.log("log... 1749")

        if (ticketTraking.chatbotAt !== null) {
          dataLimite.setMinutes(ticketTraking.chatbotAt.getMinutes() + (Number(timeUseBotQueues)));

          console.log("log... 1754")

          if (ticketTraking.chatbotAt !== null && Agora < dataLimite && timeUseBotQueues !== "0" && ticket.amountUsedBotQueues !== 0) {
            return
          }
        }
        await ticketTraking.update({
          chatbotAt: null
        })
      }

      wbot.presenceSubscribe(contact.remoteJid);


      let options = "";

      wbot.sendPresenceUpdate("composing", contact.remoteJid);

      console.log("============= queue menu =============")

      const body = formatBody(
        `\u200e${greetingMessage}\n\n${options}`,
        ticket
      );

      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "chatBot"
      });

      await delay(1000);

      await wbot.sendPresenceUpdate('paused', contact.remoteJid)

      if (ticket.whatsapp.greetingMediaAttachment !== null) {

        console.log("log... 1799")

        const filePath = path.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);

        const fileExists = fs.existsSync(filePath);
        // console.log(fileExists);
        if (fileExists) {
          console.log("log... botao com midia")
          const debouncedSentgreetingMediaAttachment = debounce(
            async () => {
              try {
                const whatsapp = await Whatsapp.findOne({ where: { id: ticket.whatsappId } });
                if (!whatsapp || !whatsapp.number) {
                  console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                  throw new Error('Número de WhatsApp não encontrado');
                }
                const botNumber = whatsapp.number;

                const buttons = [];

                queues.forEach((queue, index) => {
                  buttons.push({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: queue.name,
                      id: `${index + 1}`
                    }),
                  });
                });

                buttons.push({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: "Encerrar atendimento",
                    id: "Sair"
                  }),
                });

                // Verifica se há uma mídia para enviar
                if (ticket.whatsapp.greetingMediaAttachment) {
                  const filePath = path.resolve("public", `company${companyId}`, ticket.whatsapp.greetingMediaAttachment);
                  const fileExists = fs.existsSync(filePath);

                  if (fileExists) {
                    // Carrega a imagem local
                    const imageMessageContent = await generateWAMessageContent(
                      { image: { url: filePath } }, // Caminho da imagem local
                      { upload: wbot.waUploadToServer! }
                    );
                    const imageMessage = imageMessageContent.imageMessage;

                    // Mensagem interativa com mídia
                    const interactiveMsg = {
                      viewOnceMessage: {
                        message: {
                          interactiveMessage: {
                            body: {
                              text: `\u200e${greetingMessage}`,
                            },
                            header: {
                              imageMessage,  // Anexa a imagem
                              hasMediaAttachment: true
                            },
                            nativeFlowMessage: {
                              buttons: buttons,
                              messageParamsJson: JSON.stringify({
                                from: 'apiv2',
                                templateId: '4194019344155670',
                              }),
                            },
                          },
                        },
                      },
                    };

                    const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                    const newMsg = generateWAMessageFromContent(jid, interactiveMsg, { userJid: botNumber });
                    await wbot.relayMessage(jid, newMsg.message!, { messageId: newMsg.key.id });

                    if (newMsg) {
                      await wbot.upsertMessage(newMsg, 'notify');
                    }
                  }
                }
              } catch (error) {
                console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
              }
            },
            1000,
            ticket.id
          );
          debouncedSentgreetingMediaAttachment();
        } else {
          console.log("log... Botao sem midia")
          const debouncedSentButton = debounce(
            async () => {
              try {
                const whatsapp = await Whatsapp.findOne({ where: { id: ticket.whatsappId } });
                if (!whatsapp || !whatsapp.number) {
                  console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                  throw new Error('Número de WhatsApp não encontrado');
                }
                const botNumber = whatsapp.number;

                const buttons = [];

                queues.forEach((queue, index) => {
                  buttons.push({
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: queue.name,
                      id: `${index + 1}`
                    }),
                  });
                });

                buttons.push({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: "Encerrar atendimento",
                    id: "Sair"
                  }),
                });

                const interactiveMsg = {
                  viewOnceMessage: {
                    message: {
                      interactiveMessage: {
                        body: {
                          text: `\u200e${greetingMessage}`,
                        },
                        nativeFlowMessage: {
                          buttons: buttons,
                          messageParamsJson: JSON.stringify({
                            from: 'apiv2',
                            templateId: '4194019344155670',
                          }),
                        },
                      },
                    },
                  },
                };

                const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
                const newMsg = generateWAMessageFromContent(jid, interactiveMsg, { userJid: botNumber });
                await wbot.relayMessage(jid, newMsg.message!, { messageId: newMsg.key.id });

                if (newMsg) {
                  await wbot.upsertMessage(newMsg, 'notify');
                }
              } catch (error) {
                console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
              }
            },
            1000,
            ticket.id
          );

          debouncedSentButton();
        }

        console.log("log... 1843")

        await UpdateTicketService({
          ticketData: {
          },
          ticketId: ticket.id,
          companyId
        });

        return
      } else {

        console.log("log... 1854 - botao")

        const debouncedSentButton = debounce(
          async () => {
            try {
              const whatsapp = await Whatsapp.findOne({ where: { id: ticket.whatsappId } });
              if (!whatsapp || !whatsapp.number) {
                console.error('Número de WhatsApp não encontrado para o ticket:', ticket.whatsappId);
                throw new Error('Número de WhatsApp não encontrado');
              }
              const botNumber = whatsapp.number;

              const buttons = [];

              queues.forEach((queue, index) => {
                buttons.push({
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: queue.name,
                    id: `${index + 1}`
                  }),
                });
              });

              buttons.push({
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                  display_text: "Encerrar atendimento",
                  id: "Sair"
                }),
              });

              const interactiveMsg = {
                viewOnceMessage: {
                  message: {
                    interactiveMessage: {
                      body: {
                        text: `\u200e${greetingMessage}`,
                      },
                      nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: JSON.stringify({
                          from: 'apiv2',
                          templateId: '4194019344155670',
                        }),
                      },
                    },
                  },
                },
              };

              const jid = `${contact.number}@${ticket.isGroup ? 'g.us' : 's.whatsapp.net'}`;
              const newMsg = generateWAMessageFromContent(jid, interactiveMsg, { userJid: botNumber });
              await wbot.relayMessage(jid, newMsg.message!, { messageId: newMsg.key.id });

              if (newMsg) {
                await wbot.upsertMessage(newMsg, 'notify');
              }
            } catch (error) {
              console.error('Erro ao enviar ou fazer upsert da mensagem:', error);
            }
          },
          1000,
          ticket.id
        );



        await UpdateTicketService({
          ticketData: {

          },
          ticketId: ticket.id,
          companyId
        });
        debouncedSentButton();
      }
    }
  };

  if (typeBot === "text") {
    return botText();
  }
  
   if (typeBot === "list") {
    return botList();
  }

  if (typeBot === "button") {
    return botButton();
  }

  if (typeBot === "button" && queues.length > 3) {
    return botText();
  }
};

export const verifyRating = (ticketTraking: TicketTraking) => {
  console.log("2029", { verifyRating })
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.closedAt !== null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt === null
  ) {
    return true;
  }
  return false;
};

export const handleRating = async (
  rate: number,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  const companyId = ticket.companyId;

  console.log("2050", { handleRating })

  // console.log("GETTING WHATSAPP HANDLE RATING", ticket.whatsappId, ticket.id)
  const { complationMessage } = await ShowWhatsAppService(
    ticket.whatsappId,

    companyId
  );

  let finalRate = rate;

  if (rate < 0) {
    finalRate = 0;
  }
  if (rate > 10) {
    finalRate = 10;
  }

  await UserRating.create({
    ticketId: ticketTraking.ticketId,
    companyId: ticketTraking.companyId,
    userId: ticketTraking.userId,
    rate: finalRate
  });

  if (
    !isNil(complationMessage) &&
    complationMessage !== "" &&
    !ticket.isGroup
  ) {
    const body = formatBody(`\u200e${complationMessage}`, ticket);
    if (ticket.channel === "whatsapp") {
      const msg = await SendWhatsAppMessage({ body, ticket });

      await verifyMessage(msg, ticket, ticket.contact, ticketTraking);
    }

    if (["facebook", "instagram"].includes(ticket.channel)) {
      await sendFaceMessage({ body, ticket });
    }
  }

  await ticket.update({
    isBot: false,
    status: "closed",
    amountUsedBotQueuesNPS: 0
  });

  //loga fim de atendimento
  await CreateLogTicketService({
    userId: ticket.userId,
    queueId: ticket.queueId,
    ticketId: ticket.id,
    type: "closed"
  });

  io.of(`/workspace-${companyId}`)
    // .to("open")
    .emit(`company-${companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

  io.of(`/workspace-${companyId}`)
    // .to(ticket.status)
    // .to(ticket.id.toString())
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
};

const sanitizeName = (name: string): string => {
  let sanitized = name.split(" ")[0];
  sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
  return sanitized.substring(0, 60);
};

const deleteFileSync = (path: string): void => {
  try {
    fs.unlinkSync(path);
  } catch (error) {
    console.error("Erro ao deletar o arquivo:", error);
  }
};

export const convertTextToSpeechAndSaveToFile = (
  text: string,
  filename: string,
  subscriptionKey: string,
  serviceRegion: string,
  voice: string = "pt-BR-FabioNeural",
  audioToFormat: string = "mp3"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const speechConfig = SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );
    speechConfig.speechSynthesisVoiceName = voice;
    const audioConfig = AudioConfig.fromAudioFileOutput(`${filename}.wav`);
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result) {
          convertWavToAnotherFormat(
            `${filename}.wav`,
            `${filename}.${audioToFormat}`,
            audioToFormat
          )
            .then(output => {
              resolve();
            })
            .catch(error => {
              console.error(error);
              reject(error);
            });
        } else {
          reject(new Error("No result from synthesizer"));
        }
        synthesizer.close();
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.close();
        reject(error);
      }
    );
  });
};

const convertWavToAnotherFormat = (
  inputPath: string,
  outputPath: string,
  toFormat: string
) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .toFormat(toFormat)
      .on("end", () => resolve(outputPath))
      .on("error", (err: { message: any }) =>
        reject(new Error(`Error converting file: ${err.message}`))
      )
      .save(outputPath);
  });
};

// Transfere o ticket para uma fila.
// chama a transferência e abre o ticket na fila escolhida
export const transferQueue = async (
  targetQueueId: number | null,
  ticket: Ticket,
  contact: Contact,
  msgTransfer?: string
) => {
  if (!targetQueueId || targetQueueId <= 0) return;

  await UpdateTicketService({
    ticketId: ticket.id,
    companyId: ticket.companyId,
    ticketData: {
      isTransfered: true,        // <- aciona a lógica de transferência
      queueId: targetQueueId,    // <- fila de destino
      status: "open",            // <- abre como 'open'
      msgTransfer: msgTransfer ?? 
        `Transferindo você para um de nossos atendentes humanos.`
    }
  });
};

const flowbuilderIntegration = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  queueIntegration: QueueIntegrations,
  ticket: Ticket,
  contact: Contact,
  isFirstMsg?: Ticket,
  isTranfered?: boolean
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);

  /*
  const messageData = {
    wid: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: Number(String(msg.status).replace('PENDING', '2').replace('NaN', '1')) || 2,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg),
    createdAt: new Date(
      Math.floor(getTimestampMessage(msg.messageTimestamp) * 1000)
    ).toISOString(),
    ticketImported: ticket.imported,
  };


  await CreateMessageService({ messageData, companyId: ticket.companyId });

  */

const fromMe = !!msg?.key?.fromMe;

// lê o campo `chatbot` com segurança (funciona para instance do Sequelize ou plain object)
const chatbotEnabled =
  (ticket as any)?.chatbot === true ||
  (typeof (ticket as any)?.getDataValue === "function" &&
    !!(ticket as any).getDataValue("chatbot"));

// opcional: só no primeiro contato (status pending) — remova se não usar essa regra
const isFirstContact = (ticket as any)?.status === "pending";

if (!fromMe && ticket && chatbotEnabled /* && isFirstContact */) {
  // evita estourar o menu quando chegam várias mensagens quase juntas
  const gotLock = await acquireTicketWelcomeLock(ticket.id);
  if (!gotLock) {
    // já tem um menu sendo enviado há poucos segundos; ignore duplicata
    return;
  }

  // ======== SEU DISPARO ATUAL DO MENU/FLUXO FICA AQUI ========
  // Exemplo (mantenha o que você já usa hoje):
  // await ActionsWebhookService({ ticket, message: msg, companyId: ticket.companyId });
  // ou
  // await FlowBuilderService.start(ticket, msg);
  // ============================================================
}

  if (!msg.key.fromMe && ticket.status === "closed") {
    console.log("===== CHANGE =====");
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });
    await UpdateTicketService({
      ticketData: { status: "pending", integrationId: ticket.integrationId },
      ticketId: ticket.id,
      companyId
    });

    // ✅ CORREÇÃO: Usar namespace /workspace-{companyId}
    io.of(`/workspace-${companyId}`).emit(`company-${companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });

    io.to(ticket.status).emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
  }

  if (msg.key.fromMe) {
    return;
  }

  const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

  const listPhrase = await FlowCampaignModel.findAll({
    where: {
      whatsappId: whatsapp.id
    }
  });

  if (
    !isFirstMsg &&
    listPhrase.filter(item => matchPhrase(item.phrase, body, item.matchType || 'exact')).length === 0
  ) {
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: whatsapp.flowIdWelcome
      }
    });
    if (flow) {
      const nodes: INodes[] = flow.flow["nodes"];
      const connections: IConnections[] = flow.flow["connections"];

      const mountDataContact = {
        number: contact.number,
        name: contact.name,
        email: contact.email
      };

      // Variáveis dummy apenas para evitar erros de tipagem residuais em builds antigos
      // (o bloco inválido que usava profilePicUrl/lid/jid já foi removido)
      const profilePicUrl = ""; // noop
      const lid: string | null = null; // noop
      const jid: string | null = null; // noop

    // (Worker removido / comentado)
    // Mantido apenas chamada direta ao ActionsWebhookService.

      const nextStageWelcome = flow.flow["nodes"][0].id;
      await ActionsWebhookService(
        whatsapp.id,
        whatsapp.flowIdWelcome,
        ticket.companyId,
        nodes,
        connections,
        nextStageWelcome,
        null,
        {},
        "",
        undefined,
        ticket.id,
        mountDataContact,
        msg
      );
    }
  }

  const dateTicket = new Date(
    isFirstMsg?.updatedAt ? isFirstMsg.updatedAt : ""
  );
  const dateNow = new Date();
  const diferencaEmMilissegundos = Math.abs(
    differenceInMilliseconds(dateTicket, dateNow)
  );
  const seisHorasEmMilissegundos = 1000;

  if (
    listPhrase.filter(item => matchPhrase(item.phrase, body, item.matchType || 'exact')).length === 0 &&
    diferencaEmMilissegundos >= seisHorasEmMilissegundos &&
    isFirstMsg
  ) {
    console.log("2427", "handleMessageIntegration");

    const flow = await FlowBuilderModel.findOne({
      where: {
        id: whatsapp.flowIdNotPhrase
      }
    });

    if (flow) {
      const nodes: INodes[] = flow.flow["nodes"];
      const connections: IConnections[] = flow.flow["connections"];

      const mountDataContact = {
        number: contact.number,
        name: contact.name,
        email: contact.email
      };

      await ActionsWebhookService(
        whatsapp.id,
        whatsapp.flowIdNotPhrase,
        ticket.companyId,
        nodes,
        connections,
        flow.flow["nodes"][0].id,
        null,
        "",
        "",
        null,
        ticket.id,
        mountDataContact,
        msg
      );
    }
  }

  // Campaign fluxo
  if (listPhrase.filter(item => matchPhrase(item.phrase, body, item.matchType || 'exact')).length !== 0) {
    const flowDispar = listPhrase.filter(item => matchPhrase(item.phrase, body, item.matchType || 'exact'))[0];
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: flowDispar.flowId
      }
    });
    const nodes: INodes[] = flow.flow["nodes"];
    const connections: IConnections[] = flow.flow["connections"];

    const mountDataContact = {
      number: contact.number,
      name: contact.name,
      email: contact.email
    };

    // ========================================================================
    // ✅ CORREÇÃO BUG 4: Resetar ticket ao disparar nova campanha por frase
    // Garante que o fluxo comece limpo, sem dados de execução anterior
    // ========================================================================
    await ticket.update({
      lastFlowId: null,
      flowWebhook: false,
      flowStopped: flowDispar.flowId.toString(),
      dataWebhook: { variables: {} },
      hashFlowId: null
    });

    console.log(`[FLOW CAMPAIGN] Nova campanha disparada por frase "${body}":`, {
      ticketId: ticket.id,
      flowId: flowDispar.flowId,
      flowName: flow.name,
      startNodeId: flow.flow["nodes"][0].id
    });

    //const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");

    //console.log('DISPARO3')
    // Enviar as variáveis como parte da mensagem para o Worker
    // const data = {
    //   idFlowDb: flowDispar.flowId,
    //   companyId: ticketUpdate.companyId,
    //   nodes: nodes,
    //   connects: connections,
    //   nextStage: flow.flow["nodes"][0].id,
    //   dataWebhook: null,
    //   details: "",
    //   hashWebhookId: "",
    //   pressKey: null,
    //   idTicket: ticketUpdate.id,
    //   numberPhrase: mountDataContact
    // };
    // worker.postMessage(data);

    // worker.on("message", message => {
    //   console.log(`Mensagem do worker: ${message}`);
    // });

    await ActionsWebhookService(
      whatsapp.id,
      flowDispar.flowId,
      ticket.companyId,
      nodes,
      connections,
      flow.flow["nodes"][0].id,
      null,
      "",
      "",
      null,
      ticket.id,
      mountDataContact
    );
    return;
  }

  if (ticket.flowWebhook) {
    const webhook = await WebhookModel.findOne({
      where: {
        company_id: ticket.companyId,
        hash_id: ticket.hashFlowId
      }
    });

    if (webhook && webhook.config["details"]) {
      const flow = await FlowBuilderModel.findOne({
        where: {
          id: webhook.config["details"].idFlow
        }
      });
      const nodes: INodes[] = flow.flow["nodes"];
      const connections: IConnections[] = flow.flow["connections"];

      // const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");

      // console.log('DISPARO4')
      // // Enviar as variáveis como parte da mensagem para o Worker
      // const data = {
      //   idFlowDb: webhook.config["details"].idFlow,
      //   companyId: ticketUpdate.companyId,
      //   nodes: nodes,
      //   connects: connections,
      //   nextStage: ticketUpdate.lastFlowId,
      //   dataWebhook: ticketUpdate.dataWebhook,
      //   details: webhook.config["details"],
      //   hashWebhookId: ticketUpdate.hashFlowId,
      //   pressKey: body,
      //   idTicket: ticketUpdate.id,
      //   numberPhrase: ""
      // };
      // worker.postMessage(data);

      // worker.on("message", message => {
      //   console.log(`Mensagem do worker: ${message}`);
      // });

      await ActionsWebhookService(
        whatsapp.id,
        webhook.config["details"].idFlow,
        ticket.companyId,
        nodes,
        connections,
        ticket.lastFlowId,
        ticket.dataWebhook,
        webhook.config["details"],
        ticket.hashFlowId,
        body,
        ticket.id
      );
    } else {
      const flow = await FlowBuilderModel.findOne({
        where: {
          id: ticket.flowStopped
        }
      });

      const nodes: INodes[] = flow.flow["nodes"];
      const connections: IConnections[] = flow.flow["connections"];

      if (!ticket.lastFlowId) {
        return;
      }

      const mountDataContact = {
        number: contact.number,
        name: contact.name,
        email: contact.email
      };

      // const worker = new Worker("./src/services/WebhookService/WorkerAction.ts");

      // console.log('DISPARO5')
      // // Enviar as variáveis como parte da mensagem para o Worker
      // const data = {
      //   idFlowDb: parseInt(ticketUpdate.flowStopped),
      //   companyId: ticketUpdate.companyId,
      //   nodes: nodes,
      //   connects: connections,
      //   nextStage: ticketUpdate.lastFlowId,
      //   dataWebhook: null,
      //   details: "",
      //   hashWebhookId: "",
      //   pressKey: body,
      //   idTicket: ticketUpdate.id,
      //   numberPhrase: mountDataContact
      // };
      // worker.postMessage(data);
      // worker.on("message", message => {
      //   console.log(`Mensagem do worker: ${message}`);
      // });

      await ActionsWebhookService(
        whatsapp.id,
        parseInt(ticket.flowStopped),
        ticket.companyId,
        nodes,
        connections,
        ticket.lastFlowId,
        null,
        "",
        "",
        body,
        ticket.id,
        mountDataContact,
        msg
      );
    }
  }
};
export const handleMessageIntegration = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  queueIntegration: QueueIntegrations,
  ticket: Ticket,
  isMenu: boolean,
  whatsapp: Whatsapp,
  contact: Contact,
  isFirstMsg: Ticket | null
): Promise<void> => {
  const msgType = getTypeMessage(msg);

  if (queueIntegration.type === "n8n" || queueIntegration.type === "webhook") {
    if (queueIntegration?.urlN8N) {
      const options = {
        method: "POST",
        url: queueIntegration?.urlN8N,
        headers: {
          "Content-Type": "application/json"
        },
        json: msg
      };
      try {
        request(options, function (error, response) {
          if (error) {
            throw new Error(error);
          } else {
            console.log(response.body);
          }
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  } else if (queueIntegration.type === "dialogflow") {
    let inputAudio: string | undefined;

    if (msgType === "audioMessage") {
      let filename = `${msg.messageTimestamp}.ogg`;
      try {
        inputAudio = await readFile(
          join(
            __dirname,
            "..",
            "..",
            "..",
            "public",
            `company${companyId}`,
            filename
          ),
          "base64"
        );
      } catch (err) {
        logger.error(err);
        inputAudio = undefined;
      }
    } else {
      inputAudio = undefined;
    }

    const debouncedSentMessage = debounce(
      async () => {
        await sendDialogflowAwswer(
          wbot,
          ticket,
          msg,
          ticket.contact,
          inputAudio,
          companyId,
          queueIntegration
        );
      },
      500,
      ticket.id
    );
    debouncedSentMessage();
  } else if (queueIntegration.type === "typebot") {
    // await typebots(ticket, msg, wbot, queueIntegration);
    await typebotListener({ ticket, msg, wbot, typebot: queueIntegration });
  } else if (queueIntegration.type === "flowbuilder") {
    if (!isMenu) {
      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );
      await flowbuilderIntegration(
        msg,
        wbot,
        companyId,
        integrations,
        ticket,
        contact,
        isFirstMsg
      );
    } else {
      if (
        !isNaN(parseInt(ticket.lastMessage)) &&
        ticket.status !== "open" &&
        ticket.status !== "closed"
      ) {
        await flowBuilderQueue(
          ticket,
          msg,
          wbot,
          whatsapp,
          companyId,
          contact,
          isFirstMsg
        );
      }
    }
  }
};

const flowBuilderQueue = async (
  ticket: Ticket,
  msg: proto.IWebMessageInfo,
  wbot: Session,
  whatsapp: Whatsapp,
  companyId: number,
  contact: Contact,
  isFirstMsg: Ticket
) => {
  const body = getBodyMessage(msg);

  const flow = await FlowBuilderModel.findOne({
    where: {
      id: ticket.flowStopped
    }
  });

  const mountDataContact = {
    number: contact.number,
    name: contact.name,
    email: contact.email
  };

  const nodes: INodes[] = flow.flow["nodes"];
  const connections: IConnections[] = flow.flow["connections"];

  if (!ticket.lastFlowId) {
    return;
  }

  if (
    ticket.status === "closed" ||
    ticket.status === "interrupted" ||
    ticket.status === "open"
  ) {
    return;
  }

  await ActionsWebhookService(
    whatsapp.id,
    parseInt(ticket.flowStopped),
    ticket.companyId,
    nodes,
    connections,
    ticket.lastFlowId,
    null,
    "",
    "",
    body,
    ticket.id,
    mountDataContact,
    msg
  );

  //const integrations = await ShowQueueIntegrationService(whatsapp.integrationId, companyId);
  //await handleMessageIntegration(msg, wbot, companyId, integrations, ticket, contact, isFirstMsg)
};

const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number,
  isImported: boolean = false
): Promise<void> => {
  console.log("log... 2874");

  // ✅ ULTRA DEBUG: Log detalhado da mensagem recebida
  console.log("🔥🔥🔥 [handleMessage] MENSAGEM RECEBIDA DO WHATSAPP:", {
    messageId: msg.key.id,
    fromNumber: msg.key.remoteJid,
    isGroup: msg.key.remoteJid?.includes("@g.us"),
    hasMessage: !!msg.message,
    messageType: Object.keys(msg.message || {})[0],
    timestamp: msg.messageTimestamp,
    companyId,
    isImported
  });

  if (!isValidMsg(msg)) {
    console.log("log... 2877 - ❌ Mensagem inválida, pulando");
    return;
  }

  console.log("✅ [handleMessage] Mensagem VÁLIDA, processando...");

  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    let queueId: number = null;
    let tagsId: number = null;
    let userId: number = null;

    let bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);

    console.log("log... 2891");

    const hasMedia =
      msg.message?.imageMessage ||
      msg.message?.audioMessage ||
      msg.message?.videoMessage ||
      msg.message?.stickerMessage ||
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
      // msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
      msg.message?.ephemeralMessage?.message?.audioMessage ||
      msg.message?.ephemeralMessage?.message?.documentMessage ||
      msg.message?.ephemeralMessage?.message?.videoMessage ||
      msg.message?.ephemeralMessage?.message?.stickerMessage ||
      msg.message?.ephemeralMessage?.message?.imageMessage ||
      msg.message?.viewOnceMessage?.message?.imageMessage ||
      msg.message?.viewOnceMessage?.message?.videoMessage ||
      msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
        ?.imageMessage ||
      msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
        ?.videoMessage ||
      msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
        ?.audioMessage ||
      msg.message?.ephemeralMessage?.message?.viewOnceMessage?.message
        ?.documentMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
      msg.message?.templateMessage?.hydratedTemplate?.documentMessage ||
      msg.message?.templateMessage?.hydratedTemplate?.videoMessage ||
      msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
      msg.message?.templateMessage?.hydratedFourRowTemplate?.documentMessage ||
      msg.message?.templateMessage?.hydratedFourRowTemplate?.videoMessage ||
      msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
      msg.message?.templateMessage?.fourRowTemplate?.documentMessage ||
      msg.message?.templateMessage?.fourRowTemplate?.videoMessage ||
      msg.message?.interactiveMessage?.header?.imageMessage ||
      msg.message?.interactiveMessage?.header?.documentMessage ||
      msg.message?.interactiveMessage?.header?.videoMessage ||
      msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
        ?.documentMessage ||
      msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
        ?.videoMessage ||
      msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
        ?.imageMessage ||
      msg.message?.highlyStructuredMessage?.hydratedHsm?.hydratedTemplate
        ?.locationMessage;

    if (msg.key.fromMe) {
      if (/\u200e/.test(bodyMessage)) return;

      console.log("log... 2935");

      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "contactMessage" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage" &&
        msgType !== "editedMessage" &&
        msgType !== "hydratedContentText"
      )
        return;
      console.log("log... 2950");
      msgContact = await getContactMessage(msg, wbot);
    } else {
      console.log("log... 2953");
      msgContact = await getContactMessage(msg, wbot);
    }

    const isGroup = msg.key.remoteJid?.endsWith("@g.us");

    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);

    console.log("log... 2961");

    if (!whatsapp.allowGroup && isGroup) return;

    if (isGroup) {
      console.log("log... 2966");
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = {
        id: grupoMeta.id,
        name: grupoMeta.subject
      };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const contact = await verifyContact(msgContact, wbot, companyId);

    let unreadMessages = 0;

    if (msg.key.fromMe) {
      console.log("log... 2980");
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    } else {
      console.log("log... 2983");
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
      unreadMessages = +unreads + 1;
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      );
    }

    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    const enableLGPD = settings.enableLGPD === "enabled";

    const isFirstMsg = await Ticket.findOne({
      where: {
        contactId: groupContact ? groupContact.id : contact.id,
        companyId,
        whatsappId: whatsapp.id
      },
      order: [["id", "DESC"]]
    });

    // BUSCA O ÚLTIMO TICKET DO CONTATO, INDEPENDENTE DO STATUS
    const lastTicket = await Ticket.findOne({
      where: {
        contactId: groupContact ? groupContact.id : contact.id,
        companyId,
        whatsappId: whatsapp.id
      },
      order: [["id", "DESC"]]
    });

    // SE EXISTIR UM TICKET ANTERIOR, TENTA TRATAR A MENSAGEM COMO NPS PRIMEIRO
    if (lastTicket) {
      const plainText = getTextFromBaileysMsg(msg as any);
      const npsHandled = await HandleNpsReplyService({
        ticket: lastTicket,
        companyId: lastTicket.companyId, // <--- CORREÇÃO FINAL
        text: plainText
      });
      // SE A MENSAGEM FOI TRATADA COM SUCESSO COMO NPS, INTERROMPE O FLUXO AQUI
      if (npsHandled) {
        return;
      }
    }

    // SE NÃO FOR UMA RESPOSTA DE NPS, CONTINUA O FLUXO NORMAL DE ABERTURA/REABERTURA DE TICKET
    const mutex = new Mutex();
    const ticket = await mutex.runExclusive(async () => {
      const result = await FindOrCreateTicketService(
        contact,
        whatsapp,
        unreadMessages,
        companyId,
        queueId,
        userId,
        groupContact,
        "whatsapp",
        isImported,
        false,
        settings
      );
      return result;
    });

    let bodyRollbackTag = "";
    let bodyNextTag = "";
    let rollbackTag;
    let nextTag;
    let ticketTag = undefined;
    // console.log(ticket.id)
    if (ticket?.company?.plan?.useKanban) {
      ticketTag = await TicketTag.findOne({
        where: {
          ticketId: ticket.id
        }
      });

      if (ticketTag) {
        const tag = await Tag.findByPk(ticketTag.tagId);
        console.log("log... 3033");
        if (tag.nextLaneId) {
          // ✅ VALIDAÇÃO: Buscar nextTag e validar se pertence à mesma empresa
          nextTag = await Tag.findOne({
            where: {
              id: tag.nextLaneId,
              companyId: ticket.companyId
            }
          });
          console.log("log... 3036");
          if (nextTag) {
            bodyNextTag = nextTag.greetingMessageLane;
          }
        }
        if (tag.rollbackLaneId) {
          // ✅ VALIDAÇÃO: Buscar rollbackTag e validar se pertence à mesma empresa
          rollbackTag = await Tag.findOne({
            where: {
              id: tag.rollbackLaneId,
              companyId: ticket.companyId
            }
          });
          console.log("log... 3041");
          if (rollbackTag) {
            bodyRollbackTag = rollbackTag.greetingMessageLane;
          }
        }
      }
    }

    if (
      ticket.status === "closed" ||
      (unreadMessages === 0 &&
        whatsapp.complationMessage &&
        formatBody(whatsapp.complationMessage, ticket) === bodyMessage)
    ) {
      return;
    }

    // ❌ CÓDIGO ANTIGO DESABILITADO: Conflitava com novo sistema de automação Kanban
    // Este código movia tickets para rollbackTag imediatamente, sem respeitar timers
    // O novo sistema usa StartLaneTimerService/HandleCustomerResponseService em CreateMessageService
    //
    // if (
    //   rollbackTag &&
    //   formatBody(bodyNextTag, ticket) !== bodyMessage &&
    //   formatBody(bodyRollbackTag, ticket) !== bodyMessage
    // ) {
    //   await sequelize.transaction(async (transaction) => {
    //     await TicketTag.destroy({
    //       where: { ticketId: ticket.id, tagId: ticketTag.tagId },
    //       transaction
    //     });
    //     await TicketTag.create({
    //       ticketId: ticket.id,
    //       tagId: rollbackTag.id
    //     }, { transaction });
    //   });
    //
    //   const io = getIO();
    //   io.of(`/workspace-${ticket.companyId}`).emit(`company-${ticket.companyId}-ticket`, {
    //     action: "update",
    //     ticket
    //   });
    // }

    console.log(`🔇 [wbotMessageListener] Lógica antiga de rollbackTag DESABILITADA - usando novo sistema de automação Kanban`);

    if (isImported) {
      console.log("log... 3063");
      await ticket.update({
        queueId: whatsapp.queueIdImportMessages
      });
    }

    // console.log(msg.message?.editedMessage)
    // console.log(ticket)
    if (msgType === "editedMessage" || msgType === "protocolMessage") {
      const msgKeyIdEdited =
        msgType === "editedMessage"
          ? msg.message.editedMessage.message.protocolMessage.key.id
          : msg.message?.protocolMessage.key.id;
      let bodyEdited = findCaption(msg.message);

      console.log("log... 3075");

      // console.log("bodyEdited", bodyEdited)
      const io = getIO();
      try {
        const messageToUpdate = await Message.findOne({
          where: {
            wid: msgKeyIdEdited,
            companyId,
            ticketId: ticket.id
          }
        });

        if (!messageToUpdate) return;

        await messageToUpdate.update({ isEdited: true, body: bodyEdited });

        await ticket.update({ lastMessage: bodyEdited });

        console.log("log... 3094");

        io.of(`/workspace-${companyId}`)
          // .to(String(ticket.id))
          .emit(`company-${companyId}-appMessage`, {
            action: "update",
            message: messageToUpdate
          });

        io.of(`/workspace-${companyId}`)
          // .to(ticket.status)
          // .to("notification")
          // .to(String(ticket.id))
          .emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket
          });
      } catch (err) {
        Sentry.captureException(err);
        logger.error(`Error handling message ack. Err: ${err}`);
      }
      return;
    }

    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      userId,
      whatsappId: whatsapp?.id
    });

    let useLGPD = false;

    try {
      if (!msg.key.fromMe) {
        //MENSAGEM DE FÉRIAS COLETIVAS

        console.log("log... 3131");

        if (!isNil(whatsapp.collectiveVacationMessage && !isGroup)) {
          const currentDate = moment();

          console.log("log... 3136");

          if (
            currentDate.isBetween(
              moment(whatsapp.collectiveVacationStart),
              moment(whatsapp.collectiveVacationEnd)
            )
          ) {
            console.log("log... 3140");

            if (hasMedia) {
              console.log("log... 3144");

              await verifyMediaMessage(
                msg,
                ticket,
                contact,
                ticketTraking,
                false,
                false,
                wbot
              );
            } else {
              console.log("log... 3148");
              await verifyMessage(msg, ticket, contact, ticketTraking);
            }

            console.log("log... 3152");
            wbot.sendMessage(contact.remoteJid, {
              text: whatsapp.collectiveVacationMessage
            });

            return;
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    const isMsgForwarded =
      msg.message?.extendedTextMessage?.contextInfo?.isForwarded ||
      msg.message?.imageMessage?.contextInfo?.isForwarded ||
      msg.message?.audioMessage?.contextInfo?.isForwarded ||
      msg.message?.videoMessage?.contextInfo?.isForwarded ||
      msg.message?.documentMessage?.contextInfo?.isForwarded;

    let mediaSent: Message | undefined;

    if (!useLGPD) {
      console.log("log... 3391");
      if (hasMedia) {
        console.log("log... 3393");
        mediaSent = await verifyMediaMessage(
          msg,
          ticket,
          contact,
          ticketTraking,
          isMsgForwarded,
          false,
          wbot
        );
      } else {
        console.log("log... 3396");
        // console.log("antes do verifyMessage")
        await verifyMessage(
          msg,
          ticket,
          contact,
          ticketTraking,
          false,
          isMsgForwarded
        );
      }
    }

    try {
      if (!msg.key.fromMe) {
        console.log("log... 3226");
        console.log("log... 3227", { ticketTraking});
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(parseFloat(bodyMessage), ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }
    
    // Atualiza o ticket se a ultima mensagem foi enviada por mim, para que possa ser finalizado.
    try {
      console.log("log... 3258");
      await ticket.update({
        fromMe: msg.key.fromMe
      });
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    let currentSchedule;

    if (settings.scheduleType === "company") {
      console.log("log... 3270");
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, 0);
    } else if (settings.scheduleType === "connection") {
      console.log("log... 3273");
      currentSchedule = await VerifyCurrentSchedule(companyId, 0, whatsapp.id);
    }

    try {
      if (
        !msg.key.fromMe &&
        settings.scheduleType &&
        (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
        !["open", "group"].includes(ticket.status)
      ) {
        /**
         * Tratamento para envio de mensagem quando a empresa está fora do expediente
         */
        console.log("log... 3280");
        if (
          (settings.scheduleType === "company" ||
            settings.scheduleType === "connection") &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false)
        ) {
          console.log("log... 3289");
          if (
            whatsapp.maxUseBotQueues &&
            whatsapp.maxUseBotQueues !== 0 &&
            ticket.amountUsedBotQueues >= whatsapp.maxUseBotQueues
          ) {
            // await UpdateTicketService({
            //   ticketData: { queueId: queues[0].id },
            //   ticketId: ticket.id
            // });

            return;
          }

          if (whatsapp.timeUseBotQueues !== "0") {
            console.log("log... 3300");
            if (
              ticket.isOutOfHour === false &&
              ticketTraking.chatbotAt !== null
            ) {
              console.log("log... 3302");
              await ticketTraking.update({
                chatbotAt: null
              });
              await ticket.update({
                amountUsedBotQueues: 0
              });
            }

            //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
            let dataLimite = new Date();
            let Agora = new Date();

            if (ticketTraking.chatbotAt !== null) {
              dataLimite.setMinutes(
                ticketTraking.chatbotAt.getMinutes() +
                  Number(whatsapp.timeUseBotQueues)
              );
              console.log("log... 3318");
              if (
                ticketTraking.chatbotAt !== null &&
                Agora < dataLimite &&
                whatsapp.timeUseBotQueues !== "0" &&
                ticket.amountUsedBotQueues !== 0
              ) {
                return;
              }
            }

            await ticketTraking.update({
              chatbotAt: null
            });
          }

          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          await ticket.update({
            isOutOfHour: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });

          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

   

    const flow = await FlowBuilderModel.findOne({
      where: {
        id: ticket.flowStopped
      }
    });

    let isMenu = false;
    let isOpenai = false;
    let isQuestion = false;

    if (flow) {
      isMenu =
        flow.flow["nodes"].find((node: any) => node.id === ticket.lastFlowId)
          ?.type === "menu";
      isOpenai =
        flow.flow["nodes"].find((node: any) => node.id === ticket.lastFlowId)
          ?.type === "openai";
      isQuestion =
        flow.flow["nodes"].find((node: any) => node.id === ticket.lastFlowId)
          ?.type === "question";
    }

    if (!isNil(flow) && isQuestion && !msg.key.fromMe) {
      const body = getBodyMessage(msg);

      // ========================================================================
      // ✅ CORREÇÃO: Quando está em contexto de pergunta (isQuestion = true),
      // SEMPRE processar como resposta, NUNCA como palavra-chave de campanha
      // ========================================================================
      console.log(
        "|============= QUESTION =============|",
        JSON.stringify(flow, null, 4)
      );

      if (body) {
        const nodes: INodes[] = flow.flow["nodes"];
        const nodeSelected = flow.flow["nodes"].find(
          (node: any) => node.id === ticket.lastFlowId
        );

        const connections: IConnections[] = flow.flow["connections"];

        const { message, answerKey } = nodeSelected.data.typebotIntegration;
        const oldDataWebhook = ticket.dataWebhook || {};
        const oldVariables = (oldDataWebhook as any).variables || {};

        // ========================================================================
        // ✅ CORREÇÃO BUG 1: Navegação por connections (não por índice do array)
        // ========================================================================
        const nextConnection = connections.find(
          conn => conn.source === nodeSelected.id
        );

        if (!nextConnection) {
          // Flow terminado, nenhum próximo node
          await ticket.update({
            status: "closed",
            dataWebhook: {
              ...oldDataWebhook,
              flowCompleted: true,
              variables: {
                ...oldVariables,
                [answerKey]: body // Última resposta
              }
            }
          });

          console.log(`[FLOW] Flow completed for ticket ${ticket.id}`, {
            finalVariables: { ...oldVariables, [answerKey]: body }
          });

          await ticket.save();
          return;
        }

        const lastFlowId = nextConnection.target; // ✅ Node correto via connection

        // ========================================================================
        // ✅ CORREÇÃO BUG 2: Merge de variáveis (preserva valores anteriores)
        // ========================================================================
        // ========================================================================
        // ✅ CORREÇÃO BUG 3: flowWebhook false para múltiplas perguntas
        // Garante que próxima mensagem seja processada como pergunta, não menu
        // ========================================================================
        await ticket.update({
          lastFlowId: lastFlowId,
          flowWebhook: false,                     // ✅ CRITICAL: Permite múltiplas perguntas
          dataWebhook: {
            ...oldDataWebhook,                    // ✅ Preserva dados anteriores
            flowWebhook: nodeSelected.data?.id,
            variables: {
              ...oldVariables,                     // ✅ Preserva variáveis anteriores
              [answerKey]: body                    // ✅ Adiciona nova variável
            }
          }
        });

        console.log(`[FLOW] Variables saved for ticket ${ticket.id}:`, {
          variables: { ...oldVariables, [answerKey]: body },
          nextNodeId: lastFlowId
        });

        await ticket.save();

        const mountDataContact = {
          number: contact.number,
          name: contact.name,
          email: contact.email
        };

        await ActionsWebhookService(
          whatsapp.id,
          parseInt(ticket.flowStopped),
          ticket.companyId,
          nodes,
          connections,
          lastFlowId,
          null,
          "",
          "",
          "",
          ticket.id,
          mountDataContact,
          msg
        );
      }

      // ✅ Sempre retornar após processar pergunta (nunca cair no bloco de Campaign)
      return;
    }

    
    if (isOpenai && !isNil(flow) && !ticket.queue) {
      const nodeSelected = flow.flow["nodes"].find(
        (node: any) => node.id === ticket.lastFlowId
      );
    
      if (!nodeSelected?.data?.typebotIntegration) {
        console.error("typebotIntegration not found in nodeSelected");
        return;
      }
    
      const {
        name,
        prompt,
        voice,
        voiceKey,
        voiceRegion,
        maxTokens,
        temperature,
        apiKey,
        queueId,
        maxMessages,
        model // <- Aqui está o campo ausente
      } = nodeSelected.data.typebotIntegration as IOpenAi;
    
      const openAiSettings = {
        name,
        prompt,
        voice,
        voiceKey,
        voiceRegion,
        maxTokens: Number(maxTokens) || 0,
        temperature: Number(temperature) || 0,
        apiKey,
        queueId: Number(queueId) || 0,
        maxMessages: Number(maxMessages) || 0,
        model
      };
    
      await handleOpenAi(
        openAiSettings,
        msg,
        wbot,
        ticket,
        contact,
        mediaSent,
        ticketTraking
      );
    
      return;
    }
    



    //openai na conexao
    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      !isNil(whatsapp.promptId)
    ) {
      const { prompt } = whatsapp;
      await handleOpenAi(
        prompt,
        msg,
        wbot,
        ticket,
        contact,
        mediaSent,
        ticketTraking
      );
    }

    //integraçao na conexao
    if (
      !ticket.imported &&
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.queue &&
      !ticket.user &&
      ticket.isBot &&
      !isNil(whatsapp.integrationId) &&
      !ticket.useIntegration
    ) {
      console.log("3245");
      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );

      await handleMessageIntegration(
        msg,
        wbot,
        companyId,
        integrations,
        ticket,
        isMenu,
        whatsapp,
        contact,
        isFirstMsg
      );
      return;
    }

    // integração flowbuilder
    if (
      !ticket.imported &&
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.queue &&
      !ticket.user &&
      !isNil(whatsapp.integrationId) &&
      !ticket.useIntegration
    ) {

      const integrations = await ShowQueueIntegrationService(
        whatsapp.integrationId,
        companyId
      );
      await handleMessageIntegration(
        msg,
        wbot,
        companyId,
        integrations,
        ticket,
        isMenu,
        whatsapp,
        contact,
        isFirstMsg
      );
    }

    if (
      !isNil(ticket.typebotSessionId) &&
      ticket.typebotStatus &&
      !msg.key.fromMe &&
      !isNil(ticket.typebotSessionTime) &&
      ticket.useIntegration
    ) {
      console.log("|================== CONTINUE TYPEBO ==============|");
      const flow = await FlowBuilderModel.findOne({
        where: {
          id: ticket.flowStopped
        }
      });
      const nodes: INodes[] = flow.flow["nodes"];
      const lastFlow = nodes.find(f => f.id === ticket.lastFlowId);
      const typebot = lastFlow.data.typebotIntegration;

      await typebotListener({
        wbot: wbot,
        msg,
        ticket,
        typebot: lastFlow.data.typebotIntegration
      });
      return;
    }

    if (
      !ticket.imported &&
      !msg.key.fromMe &&
      !ticket.isGroup &&
      !ticket.userId &&
      ticket.integrationId &&
      ticket.useIntegration
    ) {
      const integrations = await ShowQueueIntegrationService(
        ticket.integrationId,
        companyId
      );

      console.log("3264");
      console.log("3257", { ticket });
      await handleMessageIntegration(
        msg,
        wbot,
        companyId,
        integrations,
        ticket,
        null,
        null,
        contact,
        null
      );

      if (msg.key.fromMe) {
        await ticket.update({
          typebotSessionTime: moment().toDate()
        });
      }
    }

    if (
      !ticket.imported &&
      !ticket.queue &&
      (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1 &&
      !ticket.useIntegration
    ) {
      // console.log("antes do verifyqueue")
      await verifyQueue(wbot, msg, ticket, contact, settings, ticketTraking);

      if (ticketTraking.chatbotAt === null) {
        await ticketTraking.update({
          chatbotAt: moment().toDate()
        });
      }
    }

    if (ticket.queueId > 0) {
      await ticketTraking.update({
        queueId: ticket.queueId
      });
    }

    // Verificação se aceita audio do contato
    if (
      getTypeMessage(msg) === "audioMessage" &&
      !msg.key.fromMe &&
      (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
      (!contact?.acceptAudioMessage ||
        settings?.acceptAudioMessageContact === "disabled")
    ) {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        {
          text: `\u200e*Assistente Virtual*:\nInfelizmente não conseguimos escutar nem enviar áudios por este canal de atendimento, por favor, envie uma mensagem de *texto*.`
        },
        {
          quoted: {
            key: msg.key,
            message: {
              extendedTextMessage: msg.message.extendedTextMessage
            }
          }
        }
      );
      await verifyMessage(sentMessage, ticket, contact, ticketTraking);
    }

    try {
      if (
        !msg.key.fromMe &&
        settings?.scheduleType &&
        ticket.queueId !== null &&
        (!ticket.isGroup || whatsapp.groupAsTicket === "enabled") &&
        ticket.status !== "open"
      ) {
        /**
         * Tratamento para envio de mensagem quando a empresa/fila está fora do expediente
         */
        const queue = await Queue.findByPk(ticket.queueId);

        if (settings?.scheduleType === "queue") {
          currentSchedule = await VerifyCurrentSchedule(companyId, queue.id, 0);
        }

        if (
          settings?.scheduleType === "queue" &&
          !isNil(currentSchedule) &&
          ticket.amountUsedBotQueues < whatsapp.maxUseBotQueues &&
          (!currentSchedule || currentSchedule.inActivity === false) &&
          !ticket.imported
        ) {
          if (Number(whatsapp.timeUseBotQueues) > 0) {
            if (
              ticket.isOutOfHour === false &&
              ticketTraking.chatbotAt !== null
            ) {
              await ticketTraking.update({
                chatbotAt: null
              });
              await ticket.update({
                amountUsedBotQueues: 0
              });
            }

            //Regra para desabilitar o chatbot por x minutos/horas após o primeiro envio
            let dataLimite = new Date();
            let Agora = new Date();

            if (ticketTraking.chatbotAt !== null) {
              dataLimite.setMinutes(
                ticketTraking.chatbotAt.getMinutes() +
                  Number(whatsapp.timeUseBotQueues)
              );

              if (
                ticketTraking.chatbotAt !== null &&
                Agora < dataLimite &&
                whatsapp.timeUseBotQueues !== "0" &&
                ticket.amountUsedBotQueues !== 0
              ) {
                return;
              }
            }

            await ticketTraking.update({
              chatbotAt: null
            });
          }

          const outOfHoursMessage = queue.outOfHoursMessage;

          if (outOfHoursMessage !== "") {
            // console.log("entrei2");
            const body = formatBody(`${outOfHoursMessage}`, ticket);

            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${
                    ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  {
                    text: body
                  }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();
          }
          //atualiza o contador de vezes que enviou o bot e que foi enviado fora de hora
          await ticket.update({
            isOutOfHour: true,
            amountUsedBotQueues: ticket.amountUsedBotQueues + 1
          });
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }

    if (ticket.queue && ticket.queueId && !msg.key.fromMe) {
      if (!ticket.user || ticket.queue?.chatbots?.length > 0) {
        await sayChatbot(
          ticket.queueId,
          wbot,
          ticket,
          contact,
          msg,
          ticketTraking
        );
      }

      //atualiza mensagem para indicar que houve atividade e aí contar o tempo novamente para enviar mensagem de inatividade
      await ticket.update({
        sendInactiveMessage: false
      });
    }

    await ticket.reload();
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};
const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise(r => setTimeout(r, 500));
  const io = getIO();

  try {
    const messageToUpdate = await Message.findOne({
      where: {
        wid: msg.key.id
      },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          include: [
            {
              model: Contact,
              attributes: [
                "id",
                "name",
                "number",
                "email",
                "profilePicUrl",
                "acceptAudioMessage",
                "active",
                "urlPicture",
                "companyId"
              ],
              include: ["extraInfo", "tags"]
            },
            {
              model: Queue,
              attributes: ["id", "name", "color"]
            },
            {
              model: Whatsapp,
              attributes: ["id", "name", "groupAsTicket"]
            },
            {
              model: User,
              attributes: ["id", "name"]
            },
            {
              model: Tag,
              as: "tags",
              attributes: ["id", "name", "color"]
            }
          ]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });
    if (!messageToUpdate || messageToUpdate.ack > chat) return;

    await messageToUpdate.update({ ack: chat });
    io.of(`/workspace-${messageToUpdate.companyId}`)
      // .to(messageToUpdate.ticketId.toString())
      .emit(`company-${messageToUpdate.companyId}-appMessage`, {
        action: "update",
        message: messageToUpdate
      });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};

const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
    });
    if (campaigns) {
      const ids = campaigns.map(c => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: {
          campaignId: { [Op.in]: ids },
          number,
          confirmation: null,
          deliveredAt: { [Op.ne]: null }
        }
      });

      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId
          },
          {
            delay: parseToMilliseconds(randomValue(0, 10))
          }
        );
      }
    }
  }
};

const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number,
  wbot: Session
) => {
  if (!isValidMsg(message)) {
    return;
  }

  const io = getIO();
  const body = await getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);

  if (message.key.fromMe && isCampaign) {
    let msgContact: IMe;
    msgContact = await getContactMessage(message, wbot);
    const contact = await verifyContact(msgContact, wbot, companyId);

    const messageRecord = await Message.findOne({
      where: {
        [Op.or]: [{ wid: message.key.id! }, { contactId: contact.id }],
        companyId
      }
    });

    if (
      !isNull(messageRecord) ||
      !isNil(messageRecord) ||
      messageRecord !== null
    ) {
      const ticket = await Ticket.findByPk(messageRecord.ticketId);
      await ticket.update({ status: "closed", amountUsedBotQueues: 0 });

      io.of(`/workspace-${companyId}`)
        // .to("open")
        .emit(`company-${companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });

      io.of(`/workspace-${companyId}`)
        // .to(ticket.status)
        // .to(ticket.id.toString())
        .emit(`company-${companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id
        });
    }
  }
};

const filterMessages = (msg: WAMessage): boolean => {
  msgDB.save(msg);

  if (msg.message?.protocolMessage?.editedMessage) return true;
  if (msg.message?.protocolMessage) return false;

  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as number) // Ou use diretamente os valores como WAMessageStubType.GROUP_PARTICIPANT_ADD, etc
  )
    return false;

  return true;
};

const wbotMessageListener = (wbot: Session, companyId: number): void => {
const wbotUserJid = wbot?.user?.id;
  wbot.ev.on("messages.upsert", async (messageUpsert: ImessageUpsert) => {
    // ✅ ULTRA DEBUG: Log ANTES de qualquer filtro
    console.log("🚨🚨🚨 [messages.upsert] EVENTO RECEBIDO DO WHATSAPP:", {
      companyId,
      totalMessages: messageUpsert.messages.length,
      type: messageUpsert.type,
      messages: messageUpsert.messages.map(m => ({
        id: m.key.id,
        remoteJid: m.key.remoteJid,
        fromMe: m.key.fromMe,
        hasMessage: !!m.message,
        messageType: Object.keys(m.message || {})[0]
      }))
    });

    const messages = messageUpsert.messages
      .filter(filterMessages)
      .map(msg => msg);

    // ✅ ULTRA DEBUG: Log DEPOIS do filtro
    console.log("🔍 [messages.upsert] DEPOIS DO FILTRO:", {
      totalBeforeFilter: messageUpsert.messages.length,
      totalAfterFilter: messages?.length || 0,
      filtered: messages?.length === 0 ? "❌ TODAS AS MENSAGENS FORAM FILTRADAS!" : "✅ Algumas mensagens passaram"
    });

    if (!messages) return;

    // console.log("CIAAAAAAA WBOT " , companyId)
    messages.forEach(async (message: proto.IWebMessageInfo) => {
      if (
        message?.messageStubParameters?.length &&
        message.messageStubParameters[0].includes("absent")
      ) {
        const msg = {
          companyId: companyId,
          whatsappId: wbot.id,
          message: message
        };
        logger.warn("MENSAGEM PERDIDA", JSON.stringify(msg));
      }
      const messageExists = await Message.count({
        where: { wid: message.key.id!, companyId }
      });

      if (!messageExists) {
        let isCampaign = false;
        let body = await getBodyMessage(message);
        const fromMe = message?.key?.fromMe;
        if (fromMe) {
          isCampaign = /\u200c/.test(body);
        } else {
          if (/\u200c/.test(body)) body = body.replace(/\u200c/, "");
          logger.debug(
            "Validação de mensagem de campanha enviada por terceiros: " + body
          );
        }

        if (!isCampaign) {
          if (REDIS_URI_MSG_CONN !== "") {
            //} && (!message.key.fromMe || (message.key.fromMe && !message.key.id.startsWith('BAE')))) {
            try {
              await BullQueues.add(
                `${process.env.DB_NAME}-handleMessage`,
                { message, wbot: wbot.id, companyId },
                {
                  priority: 1,
                  jobId: `${wbot.id}-handleMessage-${message.key.id}`
                }
              );
            } catch (e) {
              Sentry.captureException(e);
            }
          } else {
            console.log("log... 3970");
            await handleMessage(message, wbot, companyId);
          }
        }

        await verifyRecentCampaign(message, companyId);
        await verifyCampaignMessageAndCloseTicket(message, companyId, wbot);
      }

      if (message.key.remoteJid?.endsWith("@g.us")) {
        if (REDIS_URI_MSG_CONN !== "") {
          BullQueues.add(
            `${process.env.DB_NAME}-handleMessageAck`,
            { msg: message, chat: 2 },
            {
              priority: 1,
              jobId: `${wbot.id}-handleMessageAck-${message.key.id}`
            }
          );
        } else {
          handleMsgAck(message, 2);
        }
      }
    });

    // messages.forEach(async (message: proto.IWebMessageInfo) => {
    //   const messageExists = await Message.count({
    //     where: { id: message.key.id!, companyId }
    //   });

    //   if (!messageExists) {
    //     await handleMessage(message, wbot, companyId);
    //     await verifyRecentCampaign(message, companyId);
    //     await verifyCampaignMessageAndCloseTicket(message, companyId);
    //   }
    // });
  });

  // === ACK UTILS (defina UMA vez, acima dos handlers) ===
// agora retorna boolean para sabermos se atualizou
async function updateAckSafe(where: any, nextAck: number | undefined): Promise<boolean> {
  if (nextAck == null) return false;

  // 1) pega só o básico pra calcular avanço de ACK
  const msg = await Message.findOne({
    where,
    attributes: ["id", "messageId", "wid", "ack", "ticketId", "companyId"]
  });
  if (!msg) return false;

  const current = Number(msg.get("ack") ?? 0);
  const target  = Math.max(current, Number(nextAck));
  if (target === current) return false;

  await msg.update({ ack: target });

  const companyIdNum = Number(msg.get("companyId"));
  const ticketIdNum  = Number(msg.get("ticketId"));

  // 2) recarrega a MENSAGEM COMPLETA com o mesmo include do CreateMessageService
  const fullMessage = await Message.findByPk(msg.get("id") as any, {
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        include: [
          {
            model: Contact,
            attributes: ["id","name","number","email","profilePicUrl","acceptAudioMessage","active","urlPicture","companyId"],
            include: ["extraInfo","tags"]
          },
          { model: Queue,    attributes: ["id","name","color"] },
          { model: Whatsapp, attributes: ["id","name","groupAsTicket"] },
          { model: User,     attributes: ["id","name"] },
          { model: Tag,      as: "tags", attributes: ["id","name","color"] }
        ]
      },
      { model: Message, as: "quotedMsg", include: ["contact"] }
    ]
  });

  // 3) emite exatamente o SHAPE que o front já usa no "create"
  emitAppMessage(companyIdNum, ticketIdNum, {
    action: "update",
    message: fullMessage,
    ticket: fullMessage?.ticket,
    contact: fullMessage?.ticket?.contact
  });

  // (opcional) alguns fronts re-renderizam listas com esse evento também
  emitAppMessage(companyIdNum, ticketIdNum, {
    action: "ticket:update",
    ticketId: ticketIdNum
  });

  return true;
}



async function persistAck(companyId: number, msgId: string, ack: number) {
  const tries: any[] = [];
  // messageId (string) - prefer first when available
  if (HAS_MESSAGE_ID) {
    tries.push({ companyId, messageId: msgId });
  }
  // wid (string)
  tries.push({ companyId, wid: msgId });

  // Only attempt primary key (id) lookup if msgId looks like a decimal integer
  if (/^\d+$/.test(msgId)) {
    // convert to number to match integer column; avoid passing string to PG int field
    tries.push({ companyId, id: Number(msgId) });
  }

  for (const where of tries) {
    try {
      const ok = await updateAckSafe(where, ack);
      if (ok) break;
    } catch (err) {
      // Log once per where clause; continue attempting other strategies
      console.warn("persistAck lookup failed", where, (err as any)?.message);
    }
  }
}

// Tipagem leve compatível com Baileys 6.7.x (declare UMA vez)
type ReceiptLike = {
  // se você não importa Long, deixe só number|string|null
  deliveredTimestamp?: number | string | null;
  readTimestamp?: number | string | null;
  playedTimestamp?: number | string | null;
};

type MessageUserReceiptUpdateLike = {
  key?: { id?: string | null } | null;
  receipt?: ReceiptLike | null;
};

// === messages.update ===
wbot.ev.on("messages.update", async (updates: WAMessageUpdate[]) => {
  if (!updates?.length) return;

  const first = updates[0] as any;
  if (
    first?.update?.messageStubType === 1 &&
    first?.key?.remoteJid !== "status@broadcast"
  ) {
    MarkDeleteWhatsAppMessage(
      first?.key?.remoteJid,
      null,
      first?.key?.id,
      companyId
    );
  }

  for (const u of updates) {
    try {
      if (!u?.key?.fromMe) {
        (wbot as WASocket).readMessages([u.key]);
      }

      const raw = u?.update?.status;
      const ack = typeof raw === "number" ? Math.max(0, Math.min(4, raw)) : undefined;

      const msgIdUpdate = u?.key?.id as string | undefined;
      if (!msgIdUpdate) continue;

      if (ack != null) {
        await persistAck(companyId, msgIdUpdate, ack);
      }
    } catch (err) {
      console.error("messages.update ack error:", err);
    }
  }
}); // <-- fecha o 'on' de messages.update

// === message-receipt.update ===
wbot.ev.on("message-receipt.update", async (updates: MessageUserReceiptUpdate[]) => {
  if (!Array.isArray(updates) || updates.length === 0) return;

  for (const rec of updates) {
    try {
      const msgId = rec?.key?.id as string | undefined;
      if (!msgId) continue;

      const r: any = rec?.receipt ?? {};

      let ack: number | undefined;
      if (r?.playedTimestamp)        ack = 4; // reproduzida
      else if (r?.readTimestamp)     ack = 3; // lida
      else if (r?.deliveredTimestamp) ack = 2; // entregue

      if (ack != null) {
        await persistAck(companyId, msgId, ack);
      }
    } catch (err) {
      console.error("message-receipt.update error:", err);
    }
  }
}); // <-- fecha o 'on' de message-receipt.update


  // wbot.ev.on('message-receipt.update', (events: any) => {
  //   events.forEach(async (msg: any) => {
  //     const ack = msg?.receipt?.receiptTimestamp ? 3 : msg?.receipt?.readTimestamp ? 4 : 0;
  //     if (!ack) return;
  //     await handleMsgAck(msg, ack);
  //   });
  // })
  // wbot.ev.on("presence.update", (events: any) => {
  //   console.log(events)
  // })

    wbot.ev.on("contacts.update", (contacts: any) => {
    contacts.forEach(async (contact: any) => {
      if (!contact?.id) return;

      if (typeof contact.imgUrl !== "undefined") {
        const newUrl =
          contact.imgUrl === ""
            ? ""
            : await wbot!.profilePictureUrl(contact.id!).catch(() => null);

        // [LID/JID] extrai ids a partir do contact.id
        const { lid, jid } = parseLidJid(contact.id);

        const contactData = {
          name: contact.id.replace(/\D/g, ""),
          number: contact.id.replace(/\D/g, ""),
          isGroup: contact.id.includes("@g.us") ? true : false,
          companyId: companyId,
          remoteJid: contact.id,
          profilePicUrl: newUrl,
          whatsappId: wbot.id,
          wbot: wbot,
          // [LID/JID] novos campos
          lid,
          jid
        };

        await CreateOrUpdateContactService(contactData);
      }
    });
  });

    wbot.ev.on("groups.update", (groupUpdate: GroupMetadata[]) => {
    if (!groupUpdate[0]?.id) return;
    if (groupUpdate.length === 0) return;
    groupUpdate.forEach(async (group: GroupMetadata) => {
      const number = group.id.replace(/\D/g, "");
      const nameGroup = group.subject || number;

      let profilePicUrl: string = "";
       try {
         profilePicUrl = await wbot.profilePictureUrl(group.id, "image");
       } catch (e) {
         Sentry.captureException(e);
         profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
       }

      // [LID/JID] extrai ids a partir do group.id
      const { lid, jid } = parseLidJid(group.id);

      const contactData = {
        name: nameGroup,
        number: number,
        isGroup: true,
        companyId: companyId,
        remoteJid: group.id,
        profilePicUrl,
        whatsappId: wbot.id,
        wbot: wbot,
        // [LID/JID] novos campos
        lid,
        jid
      };

      const contact = await CreateOrUpdateContactService(contactData);
    });
  });
};

export {
  wbotMessageListener,
  handleMessage,
  isValidMsg,
  getTypeMessage,
  handleMsgAck
};

export default wbotMessageListener;