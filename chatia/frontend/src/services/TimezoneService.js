import api from "./api";
import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";

/**
 * TimezoneService - Centralized service for timezone operations
 * Provides API functions for timezone management
 */
class TimezoneService {
  /**
   * Get list of available timezones and default timezone
   * @returns {Promise<{availableTimezones: string[], defaultTimezone: string}>}
   */
  async getAvailableTimezones() {
    try {
      const { data } = await api.get("/settings/timezones");
      return {
        availableTimezones: data.availableTimezones || [],
        defaultTimezone: data.defaultTimezone || "America/Sao_Paulo"
      };
    } catch (error) {
      console.error("Error fetching available timezones:", error);
      toast.error(i18n.t("settings.timezone.errors.fetchAvailableTimezones"));
      return {
        availableTimezones: [],
        defaultTimezone: "America/Sao_Paulo"
      };
    }
  }

  /**
   * Get the default timezone for the system (super admin only)
   * @returns {Promise<string>}
   */
  async getDefaultTimezone() {
    try {
      const { data } = await api.get("/settings/timezones");
      return data.defaultTimezone || "America/Sao_Paulo";
    } catch (error) {
      console.error("Error fetching default timezone:", error);
      toast.error(i18n.t("settings.timezone.errors.fetchAvailableTimezones"));
      return "America/Sao_Paulo";
    }
  }

  /**
   * Update the system default timezone (super admin only)
   * @param {string} timezone - The timezone to set as default
   * @returns {Promise<any>}
   */
  async updateDefaultTimezone(timezone) {
    try {
      const { data } = await api.put("/settings/default-timezone", { timezone });
      toast.success(i18n.t("settings.timezone.success.defaultTimezoneUpdated"));
      return data;
    } catch (error) {
      console.error("Error updating default timezone:", error);
      const errorMessage = error.response?.data?.error || i18n.t("settings.timezone.errors.updateDefaultTimezone");
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * Update company-specific timezone (admin only)
   * @param {string} timezone - The timezone to set for the company
   * @param {number} companyId - Optional company ID (defaults to current user's company)
   * @returns {Promise<any>}
   */
  async updateCompanyTimezone(timezone, companyId = null) {
    try {
      const payload = { timezone };
      if (companyId) {
        payload.companyId = companyId;
      }

      const { data } = await api.put("/settings/company-timezone", payload);
      toast.success(i18n.t("settings.timezone.success.companyTimezoneUpdated"));
      return data;
    } catch (error) {
      console.error("Error updating company timezone:", error);
      const errorMessage = error.response?.data?.error || i18n.t("settings.timezone.errors.updateCompanyTimezone");
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * Get company's effective timezone
   * @param {number} companyId - Optional company ID
   * @returns {Promise<{timezone: string, source: string, isCustom: boolean}>}
   */
  async getCompanyTimezone(companyId = null) {
    try {
      const url = companyId ? `/companies/${companyId}` : `/companies/current`;
      const { data: companyData } = await api.get(url);

      if (companyData.timezone) {
        return {
          timezone: companyData.timezone,
          source: "company",
          isCustom: true
        };
      }

      // Fallback to default timezone
      const defaultTimezone = await this.getDefaultTimezone();
      return {
        timezone: defaultTimezone,
        source: "default",
        isCustom: false
      };
    } catch (error) {
      console.error("Error fetching company timezone:", error);
      toast.error(i18n.t("settings.timezone.errors.fetchCompanyTimezone"));
      return {
        timezone: "America/Sao_Paulo",
        source: "fallback",
        isCustom: false
      };
    }
  }

  /**
   * Reset company timezone to use default
   * @param {number} companyId - Optional company ID
   * @returns {Promise<any>}
   */
  async resetCompanyTimezone(companyId = null) {
    try {
      const payload = { timezone: null }; // null to indicate reset to default
      if (companyId) {
        payload.companyId = companyId;
      }

      const { data } = await api.put("/settings/company-timezone", payload);
      toast.success(i18n.t("settings.timezone.success.companyTimezoneReset"));
      return data;
    } catch (error) {
      console.error("Error resetting company timezone:", error);
      const errorMessage = error.response?.data?.error || i18n.t("settings.timezone.errors.updateCompanyTimezone");
      toast.error(errorMessage);
      throw error;
    }
  }

  /**
   * Validate timezone string
   * @param {string} timezone - Timezone to validate
   * @returns {boolean}
   */
  validateTimezone(timezone) {
    try {
      // Simple validation using Intl.DateTimeFormat
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export as singleton instance
const timezoneService = new TimezoneService();
export default timezoneService;

// Named exports for specific functions (for convenience)
export const {
  getAvailableTimezones,
  getDefaultTimezone,
  updateDefaultTimezone,
  updateCompanyTimezone,
  getCompanyTimezone,
  resetCompanyTimezone,
  validateTimezone
} = timezoneService;