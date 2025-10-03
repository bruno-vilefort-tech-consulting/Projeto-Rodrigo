import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import User from "../../models/User";
import TimezoneService from "../TimezoneServices/TimezoneService";
import { getIO } from "../../libs/socket";

interface Request {
  timezone: string;
  userId: number;
}

const UpdateDefaultTimezoneService = async ({
  timezone,
  userId
}: Request): Promise<Setting> => {
  // Validate that user is super admin
  const user = await User.findByPk(userId, {
    attributes: ["id", "super"]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  if (!user.super) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Validate timezone
  if (!TimezoneService.isValidTimezone(timezone)) {
    throw new AppError("ERR_INVALID_TIMEZONE", 400);
  }

  // Update or create default timezone setting
  const [setting] = await Setting.findOrCreate({
    where: {
      key: "defaultTimezone"
    },
    defaults: {
      key: "defaultTimezone",
      value: timezone,
      companyId: null // Global setting
    }
  });

  // Update the value if setting already exists
  if (setting.value !== timezone) {
    await setting.update({ value: timezone });
  }

  // Emit socket event to all companies (global event)
  const io = getIO();

  // Get all namespaces (companies) to emit the event
  const namespaces = Array.from(io._nsps.keys()).filter(ns => ns !== "/");

  namespaces.forEach(namespace => {
    io.of(namespace).emit("default-timezone-updated", {
      action: "update",
      timezone,
      updatedBy: userId,
      updatedAt: new Date()
    });
  });

  return setting;
};

export default UpdateDefaultTimezoneService;