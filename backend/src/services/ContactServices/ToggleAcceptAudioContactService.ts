import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface Request {
    contactId: string;
    companyId: number;
}

const ToggleUseQueuesContactService = async ({
    contactId,
    companyId
}: Request): Promise<Contact> => {
    const contact = await Contact.findOne({
        where: { id: contactId, companyId },
        attributes: ["id", "acceptAudioMessage"]
    });

    if (!contact) {
        throw new AppError("ERR_NO_CONTACT_FOUND", 404);
    }

    const acceptAudioMessage = contact?.acceptAudioMessage ? false : true;

    await contact.update({
        acceptAudioMessage
    });

    await contact.reload({
        attributes: [
            "id",
            "name",
            "number",
            "email",
            "profilePicUrl",
            "companyId",
            "acceptAudioMessage",
            "urlPicture"
        ],
        include: ["extraInfo",
        {
          association: "wallets",
          attributes: ["id", "name"]
        }]
    });

    return contact;
};

export default ToggleUseQueuesContactService;
