import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import TimezoneService from "../TimezoneServices/TimezoneService";
import { getIO } from "../../libs/socket";
import User from "../../models/User";

interface Request {
  companyId: number;
  timezone: string;
  userId: number;
}

const UpdateCompanyTimezoneService = async ({
  companyId,
  timezone,
  userId
}: Request): Promise<Company> => {
  // Check if user is super admin
  const user = await User.findByPk(userId);
  if (user?.super) {
    throw new AppError("ERR_SUPER_ADMIN_CANNOT_UPDATE_COMPANY_TIMEZONE", 403);
  }

  // Validate timezone
  if (!TimezoneService.isValidTimezone(timezone)) {
    throw new AppError("ERR_INVALID_TIMEZONE", 400);
  }

  // Find company
  const company = await Company.findByPk(companyId);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  // Update company timezone
  await company.update({ timezone });

  // Emit socket event to all company users
  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-timezone-updated`, {
    action: "update",
    timezone,
    updatedBy: userId,
    updatedAt: new Date()
  });

  return company;
};

export default UpdateCompanyTimezoneService;