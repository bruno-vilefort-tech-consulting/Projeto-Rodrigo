import { useState, useContext, useCallback } from "react";
import moment from "moment-timezone";
import api from "../services/api";
import { AuthContext } from "../context/Auth/AuthContext";
import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";

const useTimezone = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Get available timezones
  const getAvailableTimezones = useCallback(async () => {
    try {
      const { data } = await api.get("/settings/timezones");
      return data;
    } catch (error) {
      console.error("Error fetching available timezones:", error);
      toast.error(i18n.t("settings.timezone.errors.fetchAvailableTimezones"));
      return { availableTimezones: [], defaultTimezone: "America/Sao_Paulo" };
    }
  }, []);

  // Get company's effective timezone
  const getCompanyTimezone = useCallback(async (companyId = user.companyId) => {
    try {
      // First try to get company-specific timezone
      const { data: companyData } = await api.get(`/companies/${companyId}`);

      if (companyData.timezone) {
        return {
          timezone: companyData.timezone,
          source: "company",
          isCustom: true
        };
      }

      // Fallback to default timezone
      const { data: defaultData } = await api.get("/settings/timezones");
      return {
        timezone: defaultData.defaultTimezone || "America/Sao_Paulo",
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
  }, [user.companyId]);

  // Format date in company's timezone
  const formatDateInTimezone = useCallback(async (date, format = "YYYY-MM-DD HH:mm:ss z", companyId = user.companyId) => {
    try {
      const { timezone } = await getCompanyTimezone(companyId);
      return moment(date).tz(timezone).format(format);
    } catch (error) {
      console.error("Error formatting date with timezone:", error);
      return moment(date).format(format);
    }
  }, [user.companyId, getCompanyTimezone]);

  // Get current time in company's timezone
  const getCurrentTimeInTimezone = useCallback(async (format = "YYYY-MM-DD HH:mm:ss z", companyId = user.companyId) => {
    try {
      const { timezone } = await getCompanyTimezone(companyId);
      return moment().tz(timezone).format(format);
    } catch (error) {
      console.error("Error getting current time with timezone:", error);
      return moment().format(format);
    }
  }, [user.companyId, getCompanyTimezone]);

  // Update default timezone (super admin only)
  const updateDefaultTimezone = useCallback(async (timezone) => {
    setLoading(true);
    try {
      const { data } = await api.put("/settings/default-timezone", { timezone });
      toast.success(i18n.t("settings.timezone.success.defaultTimezoneUpdated"));
      return data;
    } catch (error) {
      console.error("Error updating default timezone:", error);
      const errorMessage = error.response?.data?.error || i18n.t("settings.timezone.errors.updateDefaultTimezone");
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update company timezone
  const updateCompanyTimezone = useCallback(async (timezone, companyId = user.companyId) => {
    setLoading(true);
    try {
      const { data } = await api.put("/settings/company-timezone", { timezone });
      toast.success(i18n.t("settings.timezone.success.companyTimezoneUpdated"));
      return data;
    } catch (error) {
      console.error("Error updating company timezone:", error);
      const errorMessage = error.response?.data?.error || i18n.t("settings.timezone.errors.updateCompanyTimezone");
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user.companyId]);

  // Get timezone info (name, offset, etc.)
  const getTimezoneInfo = useCallback((timezone) => {
    try {
      const momentTz = moment.tz(timezone);
      const offset = momentTz.format("Z");
      const abbr = momentTz.format("z");

      return {
        timezone,
        offset,
        abbreviation: abbr,
        displayName: `${timezone} (${offset})`,
        currentTime: momentTz.format("HH:mm:ss")
      };
    } catch (error) {
      console.error("Error getting timezone info:", error);
      return {
        timezone: "America/Sao_Paulo",
        offset: "-03:00",
        abbreviation: "BRT",
        displayName: "America/Sao_Paulo (-03:00)",
        currentTime: moment().format("HH:mm:ss")
      };
    }
  }, []);

  // Preview time in different timezone
  const previewTimeInTimezone = useCallback((timezone) => {
    try {
      return moment().tz(timezone).format("dddd, DD/MM/YYYY HH:mm:ss z");
    } catch (error) {
      console.error("Error previewing time in timezone:", error);
      return moment().format("dddd, DD/MM/YYYY HH:mm:ss");
    }
  }, []);

  return {
    loading,
    getAvailableTimezones,
    getCompanyTimezone,
    formatDateInTimezone,
    getCurrentTimeInTimezone,
    updateDefaultTimezone,
    updateCompanyTimezone,
    getTimezoneInfo,
    previewTimeInTimezone
  };
};

export default useTimezone;