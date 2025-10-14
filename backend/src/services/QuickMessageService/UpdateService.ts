import AppError from "../../errors/AppError";
import QuickMessage from "../../models/QuickMessage";

interface Data {
  shortcode: string;
  message: string;
  userId: number | string;
  id?: number | string;
  geral: boolean;
  mediaPath?: string | null;
  visao: boolean;
  companyId: number;
}

const UpdateService = async (data: Data): Promise<QuickMessage> => {
  const { id, shortcode, message, userId, geral, mediaPath, visao, companyId } = data;

  const record = await QuickMessage.findOne({
    where: { id, companyId }
  });

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  if (!record.geral && record.visao && record.userId !== userId) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await record.update({
    shortcode,
    message,
    // userId,
    geral,
    mediaPath,
    visao
  });

  return record;
};

export default UpdateService;
