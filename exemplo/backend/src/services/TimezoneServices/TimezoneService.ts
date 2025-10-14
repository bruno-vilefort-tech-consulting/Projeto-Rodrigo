import moment from "moment-timezone";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";

class TimezoneService {
  /**
   * Get the default timezone set by super admin
   */
  static async getDefaultTimezone(): Promise<string> {
    const setting = await Setting.findOne({
      where: { key: "defaultTimezone" }
    });

    return setting?.value || "America/Sao_Paulo";
  }

  /**
   * Get company specific timezone
   */
  static async getCompanyTimezone(companyId: number): Promise<string | null> {
    const company = await Company.findByPk(companyId, {
      attributes: ["timezone"]
    });

    if (!company) {
      throw new AppError("ERR_NO_COMPANY_FOUND", 404);
    }

    return company.timezone;
  }

  /**
   * Get the effective timezone for a company (company timezone or default)
   */
  static async getEffectiveTimezone(companyId: number): Promise<string> {
    const companyTimezone = await this.getCompanyTimezone(companyId);

    if (companyTimezone) {
      return companyTimezone;
    }

    return await this.getDefaultTimezone();
  }

  /**
   * List all available timezones
   */
  static listAvailableTimezones(): string[] {
    return moment.tz.names().filter(tz => {
      // Filter to show only major timezones (optional)
      return tz.includes('/') && !tz.startsWith('Etc/');
    }).sort();
  }

  /**
   * Format date with specific timezone
   */
  static formatDateWithTimezone(date: Date, timezone: string): string {
    if (!this.isValidTimezone(timezone)) {
      throw new AppError("ERR_INVALID_TIMEZONE", 400);
    }

    return moment(date).tz(timezone).format("YYYY-MM-DD HH:mm:ss z");
  }

  /**
   * Validate if timezone is valid
   */
  static isValidTimezone(timezone: string): boolean {
    return moment.tz.names().includes(timezone);
  }

  /**
   * Get current time in company timezone
   */
  static async getCurrentTimeInCompanyTimezone(companyId: number): Promise<string> {
    const timezone = await this.getEffectiveTimezone(companyId);
    return moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss z");
  }

  /**
   * Convert date from one timezone to another
   */
  static convertTimezone(date: Date, fromTimezone: string, toTimezone: string): string {
    if (!this.isValidTimezone(fromTimezone) || !this.isValidTimezone(toTimezone)) {
      throw new AppError("ERR_INVALID_TIMEZONE", 400);
    }

    return moment.tz(date, fromTimezone).tz(toTimezone).format("YYYY-MM-DD HH:mm:ss z");
  }
}

export default TimezoneService;