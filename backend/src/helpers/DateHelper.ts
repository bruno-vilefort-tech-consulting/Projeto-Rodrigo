import moment from "moment-timezone";
import TimezoneService from "../services/TimezoneServices/TimezoneService";
import AppError from "../errors/AppError";

class DateHelper {
  /**
   * Format date according to company's timezone
   */
  static async formatDate(date: Date, companyId: number): Promise<string> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment(date).tz(timezone).format("YYYY-MM-DD HH:mm:ss z");
    } catch (error) {
      console.error("Error formatting date with timezone:", error);
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    }
  }

  /**
   * Format date with custom format according to company's timezone
   */
  static async formatDateCustom(date: Date, companyId: number, format: string = "YYYY-MM-DD HH:mm:ss"): Promise<string> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment(date).tz(timezone).format(format);
    } catch (error) {
      console.error("Error formatting date with custom format:", error);
      return moment(date).format(format);
    }
  }

  /**
   * Parse date string considering company's timezone
   */
  static async parseDate(dateString: string, companyId: number): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const momentDate = moment.tz(dateString, timezone);

      if (!momentDate.isValid()) {
        throw new AppError("ERR_INVALID_DATE", 400);
      }

      return momentDate.toDate();
    } catch (error) {
      console.error("Error parsing date with timezone:", error);
      throw new AppError("ERR_INVALID_DATE", 400);
    }
  }

  /**
   * Get current time in company's timezone
   */
  static async getCurrentTime(companyId: number): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment().tz(timezone).toDate();
    } catch (error) {
      console.error("Error getting current time with timezone:", error);
      return new Date();
    }
  }

  /**
   * Get current time formatted in company's timezone
   */
  static async getCurrentTimeFormatted(companyId: number, format: string = "YYYY-MM-DD HH:mm:ss z"): Promise<string> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment().tz(timezone).format(format);
    } catch (error) {
      console.error("Error getting current time formatted:", error);
      return moment().format(format);
    }
  }

  /**
   * Convert date from one timezone to another
   */
  static convertTimezone(date: Date, fromTz: string, toTz: string): Date {
    if (!TimezoneService.isValidTimezone(fromTz) || !TimezoneService.isValidTimezone(toTz)) {
      throw new AppError("ERR_INVALID_TIMEZONE", 400);
    }

    return moment.tz(date, fromTz).tz(toTz).toDate();
  }

  /**
   * Get start of day in company timezone
   */
  static async getStartOfDay(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).startOf('day').toDate();
    } catch (error) {
      console.error("Error getting start of day:", error);
      const targetDate = date || new Date();
      return moment(targetDate).startOf('day').toDate();
    }
  }

  /**
   * Get end of day in company timezone
   */
  static async getEndOfDay(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).endOf('day').toDate();
    } catch (error) {
      console.error("Error getting end of day:", error);
      const targetDate = date || new Date();
      return moment(targetDate).endOf('day').toDate();
    }
  }

  /**
   * Get start of week in company timezone
   */
  static async getStartOfWeek(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).startOf('week').toDate();
    } catch (error) {
      console.error("Error getting start of week:", error);
      const targetDate = date || new Date();
      return moment(targetDate).startOf('week').toDate();
    }
  }

  /**
   * Get end of week in company timezone
   */
  static async getEndOfWeek(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).endOf('week').toDate();
    } catch (error) {
      console.error("Error getting end of week:", error);
      const targetDate = date || new Date();
      return moment(targetDate).endOf('week').toDate();
    }
  }

  /**
   * Get start of month in company timezone
   */
  static async getStartOfMonth(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).startOf('month').toDate();
    } catch (error) {
      console.error("Error getting start of month:", error);
      const targetDate = date || new Date();
      return moment(targetDate).startOf('month').toDate();
    }
  }

  /**
   * Get end of month in company timezone
   */
  static async getEndOfMonth(companyId: number, date?: Date): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      return moment(targetDate).tz(timezone).endOf('month').toDate();
    } catch (error) {
      console.error("Error getting end of month:", error);
      const targetDate = date || new Date();
      return moment(targetDate).endOf('month').toDate();
    }
  }

  /**
   * Check if date is within business hours for company timezone
   */
  static async isBusinessHours(companyId: number, date?: Date, startHour: number = 9, endHour: number = 18): Promise<boolean> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      const targetDate = date || new Date();
      const momentDate = moment(targetDate).tz(timezone);
      const hour = momentDate.hour();
      const dayOfWeek = momentDate.day(); // 0 = Sunday, 6 = Saturday

      // Check if it's a weekday (Monday to Friday)
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isWithinHours = hour >= startHour && hour < endHour;

      return isWeekday && isWithinHours;
    } catch (error) {
      console.error("Error checking business hours:", error);
      return false;
    }
  }

  /**
   * Add time to date considering company timezone
   */
  static async addTime(companyId: number, date: Date, amount: number, unit: moment.unitOfTime.DurationConstructor): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment(date).tz(timezone).add(amount, unit).toDate();
    } catch (error) {
      console.error("Error adding time:", error);
      return moment(date).add(amount, unit).toDate();
    }
  }

  /**
   * Subtract time from date considering company timezone
   */
  static async subtractTime(companyId: number, date: Date, amount: number, unit: moment.unitOfTime.DurationConstructor): Promise<Date> {
    try {
      const timezone = await TimezoneService.getEffectiveTimezone(companyId);
      return moment(date).tz(timezone).subtract(amount, unit).toDate();
    } catch (error) {
      console.error("Error subtracting time:", error);
      return moment(date).subtract(amount, unit).toDate();
    }
  }
}

export default DateHelper;