import * as Sentry from "@sentry/node";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import logger from "../../utils/logger";
import ShowBaileysService from "../BaileysServices/ShowBaileysService";
import CreateContactService from "../ContactServices/CreateContactService";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import { isString, isArray } from "lodash";
import path from "path";
import fs from 'fs';

interface ImportContactsOptions {
  companyId: number;
  whatsappId?: number;
  filterGroups?: boolean;
  onlyAgenda?: boolean;
}

const ImportContactsService = async ({
  companyId,
  whatsappId,
  filterGroups = true,
  onlyAgenda = true
}: ImportContactsOptions): Promise<void> => {
  const defaultWhatsapp = whatsappId
    ? { id: whatsappId }
    : await GetDefaultWhatsApp(undefined, companyId);
  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    const contactsString = await ShowBaileysService(wbot.id);
    phoneContacts = JSON.parse(JSON.stringify(contactsString.contacts));

    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
    const beforeFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_antes.txt');
    fs.writeFile(beforeFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
      if (err) {
        logger.error(`Failed to write contacts to file: ${err}`);
        throw err;
      }
      // console.log('O arquivo contatos_antes.txt foi criado!');
    });

  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const afterFilePath = path.join(publicFolder,`company${companyId}`, 'contatos_depois.txt');
  fs.writeFile(afterFilePath, JSON.stringify(phoneContacts, null, 2), (err) => {
    if (err) {
      logger.error(`Failed to write contacts to file: ${err}`);
      throw err;
    }
    // console.log('O arquivo contatos_depois.txt foi criado!');
  });

  const phoneContactsList = isString(phoneContacts)
    ? JSON.parse(phoneContacts)
    : phoneContacts;

  if (isArray(phoneContactsList)) {
    let imported = 0;
    let skipped = 0;

    for (const { id, name, notify } of phoneContactsList) {
      // Filtrar status broadcasts e grupos (se habilitado)
      if (id === "status@broadcast") {
        skipped++;
        continue;
      }

      if (filterGroups && id.includes("g.us")) {
        skipped++;
        continue;
      }

      const number = id.replace(/\D/g, "");
      const isGroup = id.includes("g.us");

      try {
        // Usar CreateOrUpdateContactService com source e isInAgenda
        await CreateOrUpdateContactService({
          number,
          name: name || notify || number,
          companyId,
          isGroup,
          profilePicUrl: "",
          channel: "whatsapp",
          whatsappId: defaultWhatsapp.id,
          remoteJid: id,
          source: "whatsapp_roster",
          isInAgenda: onlyAgenda ? true : false,
          wbot
        });

        imported++;
      } catch (error) {
        Sentry.captureException(error);
        logger.warn({
          action: 'import_contact_failed',
          contactId: id,
          number,
          companyId,
          error: error.message
        });
        skipped++;
      }
    }

    logger.info({
      action: 'import_contacts_completed',
      companyId,
      whatsappId: defaultWhatsapp.id,
      imported,
      skipped,
      filterGroups,
      onlyAgenda
    });
  }
};

export default ImportContactsService;
