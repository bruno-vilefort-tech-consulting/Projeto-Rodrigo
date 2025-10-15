import { useState, useEffect, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";

import { toast } from "react-toastify";

import axios from "axios";
import { i18n } from "../../translate/i18n";
import api, { cancelAllRequests } from "../../services/api";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import timezoneService from "../../services/TimezoneService";
// import { useDate } from "../../hooks/useDate";
import moment from "moment";

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [socket, setSocket] = useState({});
  const [timezone, setTimezone] = useState(null);
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  const isLoggingOutRef = useRef(false)

  // Load timezone for the current company
  const loadTimezone = async () => {
    if (!user.companyId) return;

    try {
      setTimezoneLoading(true);
      const timezoneData = await timezoneService.getCompanyTimezone();
      setTimezone(timezoneData);
    } catch (error) {
      console.error("Error loading timezone:", error);
      // Set default timezone as fallback
      setTimezone({
        timezone: "America/Sao_Paulo",
        source: "fallback",
        isCustom: false
      });
    } finally {
      setTimezoneLoading(false);
    }
  };

  // Reload timezone (useful after updates)
  const reloadTimezone = () => {
    if (user.companyId) {
      loadTimezone();
    }
  };


  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Durante logout, silencia todos os erros e resolve a promise
      if (isLoggingOutRef.current) {
        return Promise.resolve({ data: null });
      }

      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { data } = await api.post("/auth/refresh_token");
          if (data) {
            localStorage.setItem("token", data.token);
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Se falhar no refresh, trata como 401
          localStorage.removeItem("token");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
          return Promise.reject(refreshError);
        }
      }

      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          if (!isLoggingOutRef.current) {
            toastError(err);
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(user).length && user.id > 0) {
      // console.log("Entrou useWhatsapp com user", Object.keys(user).length, Object.keys(socket).length ,user, socket)
      let io;
      if (!Object.keys(socket).length) {
        io = socketConnection({ user });
        setSocket(io);

        // ✅ DEBUG: Expor socket globalmente
        window.socket = io;
        console.log("✅ [useAuth] Socket criado e exposto globalmente:", {
          socketId: io.id,
          connected: io.connected,
          companyId: user.companyId
        });
      } else {
        io = socket;
        window.socket = io;
      }

      // User update events
      io.on(`company-${user.companyId}-user`, (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      });

      // Timezone update events
      io.on(`company-${user.companyId}-timezone`, (data) => {
        console.log("Timezone socket event received:", data);
        if (data.action === "update") {
          // Reload timezone when it's updated
          reloadTimezone();
        }
      });

      // Load timezone for this user/company
      loadTimezone();

      return () => {
        // console.log("desconectou o company user ", user.id)
        io.off(`company-${user.companyId}-user`);
        io.off(`company-${user.companyId}-timezone`);
        // io.disconnect();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      const {
        user: { company },
      } = data;

      if (has(company, "companieSettings") && isArray(company.companieSettings[0])) {
        const setting = company.companieSettings[0].find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", null); //regra pra exibir campanhas
        }
      }

      if (has(company, "companieSettings") && isArray(company.companieSettings[0])) {
        const setting = company.companieSettings[0].find(
          (s) => s.key === "sendSignMessage"
        );

        const signEnable = setting.value === "enable";

        if (setting && setting.value === "enabled") {
          localStorage.setItem("sendSignMessage", signEnable); //regra pra exibir campanhas
        }
      }
      localStorage.setItem("profileImage", data.user.profileImage); //regra pra exibir imagem contato

      moment.locale('pt-br');
      let dueDate;
      if (data.user.company.id === 1) {
        dueDate = '2999-12-31T00:00:00.000Z'
      } else {
        dueDate = data.user.company.dueDate;
      }
      const hoje = moment(moment()).format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(dueDate).diff(moment(moment()).format());

      var before = moment(moment().format()).isBefore(dueDate);
      var dias = moment.duration(diff).asDays();

      if (before === true) {
        localStorage.setItem("token", data.token);
        // localStorage.setItem("public-token", JSON.stringify(data.user.token));
        // localStorage.setItem("companyId", companyId);
        // localStorage.setItem("userId", id);
        localStorage.setItem("companyDueDate", vencimento);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
        setIsAuth(true);
        toast.success(i18n.t("auth.toasts.success"));
        if (Math.round(dias) < 5) {
          toast.warn(`Sua assinatura vence em ${Math.round(dias)} ${Math.round(dias) === 1 ? 'dia' : 'dias'} `);
        }

        // // Atraso para garantir que o cache foi limpo
        // setTimeout(() => {
        //   window.location.reload(true); // Recarregar a página
        // }, 1000);

        history.push("/tickets");
        setLoading(false);
      } else {
        // localStorage.setItem("companyId", companyId);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setIsAuth(true);
        toastError(`Opss! Sua assinatura venceu ${vencimento}.
Entre em contato com o Suporte para mais informações! `);
        history.push("/financeiro-aberto");
        setLoading(false);
      }

    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    isLoggingOutRef.current = true; // Sinaliza que estamos fazendo logout

    // Cancela todas as requisições em andamento
    cancelAllRequests("Logout - cancelando requisições pendentes");

    try {
      // Desconecta o socket se existir
      if (socket && socket.disconnect) {
        socket.disconnect();
      }
      await api.delete("/auth/logout");
    } catch (err) {
      // Ignora erros durante logout (incluindo 401 e requisições canceladas)
      if (!axios.isCancel(err)) {
        console.log("Logout error (ignored):", err);
      }
    } finally {
      // Sempre limpa o estado, independente de erro
      setIsAuth(false);
      setUser({});
      setTimezone(null);
      setTimezoneLoading(false);
      localStorage.removeItem("token");
      localStorage.removeItem("cshow");
      localStorage.removeItem("profileImage");
      localStorage.removeItem("companyDueDate");
      localStorage.removeItem("sendSignMessage");
      api.defaults.headers.Authorization = undefined;
      setLoading(false);

      // Pequeno delay para garantir que as requisições em andamento sejam canceladas
      setTimeout(() => {
        isLoggingOutRef.current = false; // Reseta a flag
        history.push("/login");
      }, 100);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      console.log(data)
      return data;
    } catch (_) {
      return null;
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
    socket,
    timezone,
    timezoneLoading,
    loadTimezone,
    reloadTimezone
  };
};

export default useAuth;
