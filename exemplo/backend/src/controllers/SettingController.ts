import { Request, Response } from "express";

import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";

import UpdateSettingService from "../services/SettingServices/UpdateSettingService";
import ListSettingsService from "../services/SettingServices/ListSettingsService";
import ListSettingsServiceOne from "../services/SettingServices/ListSettingsServiceOne";
import GetSettingService from "../services/SettingServices/GetSettingService";
import UpdateOneSettingService from "../services/SettingServices/UpdateOneSettingService";
import GetPublicSettingService from "../services/SettingServices/GetPublicSettingService";

type LogoRequest = {
  mode: string;
};

type PrivateFileRequest = {
  settingKey: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const settings = await ListSettingsService({ companyId });

  return res.status(200).json(settings);
};

export const showOne = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { settingKey: key } = req.params;

  console.log("|======== GetPublicSettingService ========|")
  console.log("key", key)
  console.log("|=========================================|")

  
  const settingsTransfTicket = await ListSettingsServiceOne({ companyId: companyId, key: key });

  return res.status(200).json(settingsTransfTicket);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { settingKey: key } = req.params;
  const { value } = req.body;
  const { companyId } = req.user;

  const setting = await UpdateSettingService({
    key,
    value,
    companyId
  });

  const io = getIO();
  io.of(String(companyId))
  .emit(`company-${companyId}-settings`, {
    action: "update",
    setting
  });

  return res.status(200).json(setting);
};

export const getSetting = async (
  req: Request,
  res: Response): Promise<Response> => {

  const { settingKey: key } = req.params;

  const setting = await GetSettingService({ key });

  return res.status(200).json(setting);

}

export const updateOne = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { settingKey: key } = req.params;
  const { value } = req.body;

  const setting = await UpdateOneSettingService({
    key,
    value
  });

  return res.status(200).json(setting); 
};

export const publicShow = async (req: Request, res: Response): Promise<Response> => {
  console.log("|=============== publicShow  ==============|")
  
  const { settingKey: key } = req.params;
  
  const settingValue = await GetPublicSettingService({ key });


  return res.status(200).json(settingValue);
};

export const storeLogo = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { mode }: LogoRequest = req.body;
  const { companyId } = req.user;
  const validModes = [ "Light", "Dark", "Favicon" ];

  console.log("|=============== storeLogo  ==============|", storeLogo)

  if ( validModes.indexOf(mode) === -1 ) {
    return res.status(406);
  }

  if (file && file.mimetype.startsWith("image/")) {
    
    const setting = await UpdateSettingService({
      key: `appLogo${mode}`,
      value: file.filename,
      companyId
    });
    
    return res.status(200).json(setting.value);
  }
  
  return res.status(406);
}

export const storePrivateFile = async (req: Request, res: Response): Promise<Response> => {
  const file = req.file as Express.Multer.File;
  const { settingKey }: PrivateFileRequest = req.body;
  const { companyId } = req.user;


  console.log("|=============== storePrivateFile  ==============|", storeLogo)

  const setting = await UpdateSettingService({
    key: `_${settingKey}`,
    value: file.filename,
    companyId
  });
  
  return res.status(200).json(setting.value);
}

export const getCurrency = async (req: Request, res: Response): Promise<Response> => {
  const { getCurrency, getSupportedCurrencies } = await import("../services/CurrencyService");

  try {
    const currency = await getCurrency();
    const supportedCurrencies = getSupportedCurrencies();

    return res.status(200).json({
      current: currency,
      supported: supportedCurrencies
    });
  } catch (error) {
    console.error('Error getting currency:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCurrency = async (req: Request, res: Response): Promise<Response> => {
  const { updateCurrency } = await import("../services/CurrencyService");

  try {
    const { systemCurrency, currencyCode } = req.body;

    // Aceitar tanto o formato novo quanto o antigo
    const code = systemCurrency?.code || currencyCode;

    if (!code) {
      return res.status(400).json({ error: 'Currency code is required' });
    }

    const setting = await updateCurrency({
      currencyData: { code, symbol: '', locale: '' }, // Os dados completos serão obtidos pelo service
      userId: req.user.id
    });

    return res.status(200).json({
      message: 'Currency updated successfully',
      setting
    });
  } catch (error: any) {
    console.error('Error updating currency:', error);

    if (error.message === "ERR_NO_PERMISSION_CURRENCY") {
      return res.status(403).json({ error: 'Only super-admin can update system currency' });
    }

    if (error.message === "ERR_UNSUPPORTED_CURRENCY") {
      return res.status(400).json({ error: 'Unsupported currency code' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Timezone management endpoints

export const getAvailableTimezones = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { default: TimezoneService } = await import("../services/TimezoneServices/TimezoneService");

    const timezones = TimezoneService.listAvailableTimezones();
    const defaultTimezone = await TimezoneService.getDefaultTimezone();

    return res.status(200).json({
      availableTimezones: timezones,
      defaultTimezone
    });
  } catch (error: any) {
    console.error('Error getting available timezones:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDefaultTimezone = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { default: UpdateDefaultTimezoneService } = await import("../services/SettingServices/UpdateDefaultTimezoneService");

    const { timezone } = req.body;
    const userId = parseInt(req.user.id);

    if (!timezone) {
      return res.status(400).json({ error: 'Timezone is required' });
    }

    const setting = await UpdateDefaultTimezoneService({
      timezone,
      userId
    });

    return res.status(200).json({
      message: 'Default timezone updated successfully',
      setting
    });
  } catch (error: any) {
    console.error('Error updating default timezone:', error);

    if (error.message === "ERR_NO_PERMISSION") {
      return res.status(403).json({ error: 'Only super-admin can update default timezone' });
    }

    if (error.message === "ERR_INVALID_TIMEZONE") {
      return res.status(400).json({ error: 'Invalid timezone provided' });
    }

    if (error.message === "ERR_NO_USER_FOUND") {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCompanyTimezone = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { default: UpdateCompanyTimezoneService } = await import("../services/CompanyServices/UpdateCompanyTimezoneService");

    const { timezone } = req.body;
    const { companyId } = req.user;
    const userId = parseInt(req.user.id);

    if (!timezone) {
      return res.status(400).json({ error: 'Timezone is required' });
    }

    const company = await UpdateCompanyTimezoneService({
      companyId,
      timezone,
      userId
    });

    return res.status(200).json({
      message: 'Company timezone updated successfully',
      company: {
        id: company.id,
        name: company.name,
        timezone: company.timezone
      }
    });
  } catch (error: any) {
    console.error('Error updating company timezone:', error);

    if (error.message === "ERR_SUPER_ADMIN_CANNOT_UPDATE_COMPANY_TIMEZONE") {
      return res.status(403).json({ error: 'Super admin cannot update company timezone' });
    }

    if (error.message === "ERR_INVALID_TIMEZONE") {
      return res.status(400).json({ error: 'Invalid timezone provided' });
    }

    if (error.message === "ERR_NO_COMPANY_FOUND") {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
