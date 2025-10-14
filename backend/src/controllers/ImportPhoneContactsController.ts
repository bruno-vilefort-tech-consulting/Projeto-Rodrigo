import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { whatsappId, filterGroups, onlyAgenda } = req.body;

  await ImportContactsService({
    companyId,
    whatsappId: whatsappId ? Number(whatsappId) : undefined,
    filterGroups: filterGroups !== undefined ? filterGroups === 'true' || filterGroups === true : true,
    onlyAgenda: onlyAgenda !== undefined ? onlyAgenda === 'true' || onlyAgenda === true : true
  });

  return res.status(200).json({ message: "Contacts imported successfully" });
};
