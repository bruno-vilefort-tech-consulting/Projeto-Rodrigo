import { getIO } from "../../libs/socket";
import CompaniesSettings from "../../models/CompaniesSettings";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";
import fs from "fs";
import path, { join } from "path";
import logger from "../../utils/logger";
import { isNil } from "lodash";
import Whatsapp from "../../models/Whatsapp";
import * as Sentry from "@sentry/node";
import { normalizePhoneNumber } from "../../utils/normalizePhoneNumber";

const axios = require('axios');

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
  remoteJid?: string;
  whatsappId?: number;
  wbot?: any;
  source?: string;
  isInAgenda?: boolean;
}

const downloadProfileImage = async ({
  profilePicUrl,
  companyId,
  contact
}) => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  let filename;


  const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    fs.chmodSync(folder, 0o777);
  }

  try {

    const response = await axios.get(profilePicUrl, {
      responseType: 'arraybuffer'
    });

    filename = `${new Date().getTime()}.jpeg`;
    fs.writeFileSync(join(folder, filename), response.data);

  } catch (error) {
    console.error(error)
  }

  return filename
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = [],
  remoteJid = "",
  whatsappId,
  wbot,
  source = "auto_created",
  isInAgenda = false
}: Request): Promise<Contact> => {
  try {
    let createContact = false;
    const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

    // ✅ CORREÇÃO: Normalizar número ANTES de buscar no banco
    // Se a feature flag está ativa, o banco tem números no formato E.164 (+55...)
    let number: string;
    if (isGroup) {
      number = rawNumber;
    } else if (process.env.FEATURE_CONTACTS_NORMALIZE_E164 === 'true') {
      // Normalizar para E.164 para buscar no banco
      const normalized = normalizePhoneNumber(rawNumber);
      number = normalized || rawNumber.replace(/[^0-9]/g, "");
    } else {
      // Sem feature flag, apenas remove não-dígitos
      number = rawNumber.replace(/[^0-9]/g, "");
    }

    const io = getIO();
    let contact: Contact | null;

    contact = await Contact.findOne({
      where: { number, companyId }
    });

    let updateImage = (!contact || contact?.profilePicUrl !== profilePicUrl && profilePicUrl !== "") && wbot || false;

    console.log(93, "CreateUpdateContactService", { updateImage })

    if (contact) {
      contact.remoteJid = remoteJid;
      contact.profilePicUrl = profilePicUrl || null;
      contact.isGroup = isGroup;
      if (isNil(contact.whatsappId)) {
        const whatsapp = await Whatsapp.findOne({
          where: { id: whatsappId, companyId }
        });

        console.log(104, "CreateUpdateContactService")

        if (whatsapp) {
          contact.whatsappId = whatsappId;
        }
      }
      const folder = path.resolve(publicFolder, `company${companyId}`, "contacts");

      let fileName, oldPath = "";
      if (contact.urlPicture) {
        console.log(114, "CreateUpdateContactService")

        oldPath = path.resolve(contact.urlPicture.replace(/\\/g, '/'));
        fileName = path.join(folder, oldPath.split('\\').pop());
      }
      if (!fs.existsSync(fileName) || contact.profilePicUrl === "") {
        if (wbot && ['whatsapp'].includes(channel)) {
          try {
            console.log(120, "CreateUpdateContactService")
            profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
          } catch (e) {
            Sentry.captureException(e);
            profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
          }
          contact.profilePicUrl = profilePicUrl;
          updateImage = true;
        }
      }

      if (contact.name === number) {
        contact.name = name;
      }

      await contact.save(); // Ensure save() is called to trigger updatedAt
      await contact.reload();

    } else if (wbot && ['whatsapp'].includes(channel)) {
      const settings = await CompaniesSettings.findOne({ where: { companyId } });
      const { acceptAudioMessageContact } = settings;
      let newRemoteJid = remoteJid;

      if (!remoteJid && remoteJid !== "") {
        newRemoteJid = isGroup ? `${rawNumber}@g.us` : `${rawNumber}@s.whatsapp.net`;
      }

      try {
        profilePicUrl = await wbot.profilePictureUrl(remoteJid, "image");
      } catch (e) {
        Sentry.captureException(e);
        profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
      }

      contact = await Contact.create({
        name,
        number,
        email,
        isGroup,
        companyId,
        channel,
        acceptAudioMessage: acceptAudioMessageContact === 'enabled' ? true : false,
        remoteJid: newRemoteJid,
        profilePicUrl,
        urlPicture: "",
        whatsappId,
        source,
        isInAgenda
      });

      createContact = true;
    } else if (['facebook', 'instagram'].includes(channel)) {
      contact = await Contact.create({
        name,
        number,
        email,
        isGroup,
        companyId,
        channel,
        profilePicUrl,
        urlPicture: "",
        whatsappId,
        source,
        isInAgenda
      });
    }



    if (updateImage) {


      let filename;

      filename = await downloadProfileImage({
        profilePicUrl,
        companyId,
        contact
      })


      await contact.update({
        urlPicture: filename,
        pictureUpdated: true
      });

      await contact.reload();
    } else {
      if (['facebook', 'instagram'].includes(channel)) {
        let filename;

        filename = await downloadProfileImage({
          profilePicUrl,
          companyId,
          contact
        })


        await contact.update({
          urlPicture: filename,
          pictureUpdated: true
        });

        await contact.reload();
      }
    }

    if (createContact) {
      logger.info({
        action: 'contact_created',
        resource: 'contact',
        resourceId: contact.id,
        source: contact.source,
        isInAgenda: contact.isInAgenda,
        companyId: contact.companyId,
        normalizedNumber: contact.number,
        featureFlag: process.env.FEATURE_CONTACTS_FIX === 'true'
      });

      // ✅ CORREÇÃO: Usar namespace /workspace-{companyId}
      io.of(`/workspace-${companyId}`)
        .emit(`company-${companyId}-contact`, {
          action: "create",
          contact
        });
    } else {

      // ✅ CORREÇÃO: Usar namespace /workspace-{companyId}
      io.of(`/workspace-${companyId}`)
        .emit(`company-${companyId}-contact`, {
          action: "update",
          contact
        });

    }

    return contact;
  } catch (err) {
    logger.error("Error to find or create a contact:", err);
    throw err;
  }
};

export default CreateOrUpdateContactService;
