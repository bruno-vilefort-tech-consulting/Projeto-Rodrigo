import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Collapse,
  List,
  Tooltip,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  DashboardOutlined,
  WhatsApp,
  SettingsOutlined,
  PeopleAltOutlined,
  ContactPhoneOutlined,
  AccountTreeOutlined,
  FlashOn,
  HelpOutline,
  CodeRounded,
  Schedule,
  LocalOffer,
  EventAvailable,
  ExpandLess,
  ExpandMore,
  People,
  ListAlt,
  Announcement,
  Forum,
  LocalAtm,
  Business,
  AllInclusiveRounded,
  AttachFileRounded,
  DescriptionRounded,
  DeviceHubRounded,
  GridOnRounded,
  PhonelinkSetupRounded,
  ViewKanban,
  Campaign,
  WebhookRounded,
  ShapeLineRounded,
} from "@mui/icons-material";
import SignalCellularConnectedNoInternet4BarTwoTone from "@mui/icons-material/SignalCellularConnectedNoInternet4BarTwoTone";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import { i18n } from "../translate/i18n";
import useHelps from "../hooks/useHelps";

// ---------------- Icon palette ----------------
const iconStyles = {
  dashboard: { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" },
  tickets: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  messages: { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" },
  kanban: { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)" },
  contacts: { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
  schedules: { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
  tags: { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" },
  chats: { color: "#f97316", gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" },
  helps: { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" },
  campaigns: { color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
  flowbuilder: { color: "#84cc16", gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)" },
  announcements: { color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  api: { color: "#06b6d4", gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" },
  users: { color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" },
  queues: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)" },
  prompts: { color: "#ec4899", gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)" },
  integrations: { color: "#f97316", gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)" },
  connections: { color: "#64748b", gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)" },
  files: { color: "#14b8a6", gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)" },
  financial: { color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)" },
  settings: { color: "#6366f1", gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
  companies: { color: "#3b82f6", gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" },
};

// ---------------- i18n helpers ----------------
const lang = () => (i18n?.language || "pt").split("-")[0].toLowerCase();

/**
 * tLang: tenta i18n.t(key). Se não existir, usa fallback por idioma atual.
 * Ex.: tLang("mainDrawer.listItems.tickets", "Atendimentos", "Services")
 */
const tLang = (key, pt, en) => {
  try {
    const v = i18n.t(key);
    if (v && v !== key) return v;
  } catch (_) {}
  return lang() === "en" ? en : pt;
};

// ---------------- theme helpers ----------------
const getPaletteMode = (theme) => theme?.mode ?? theme?.palette?.mode ?? theme?.palette?.type ?? "light";
const labelColor = (theme, isActive, iconColor) =>
  getPaletteMode(theme) === "dark" ? "#ffffff" : (isActive ? iconColor : "#666");

// ---------------- reducer ----------------
const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];
    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) state[chatIndex] = chat;
        else newChats.push(chat);
      });
    }
    return [...state, ...newChats];
  }
  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);
    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    }
    return [chat, ...state];
  }
  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) state.splice(chatIndex, 1);
    return [...state];
  }
  if (action.type === "RESET") return [];
  if (action.type === "CHANGE_CHAT") {
    return state.map((chat) => (chat.id === action.payload.chat.id ? action.payload.chat : chat));
  }
  return state;
};

// ---------------- Item de link ----------------
function ListItemLink({ icon, primary, to, showBadge, iconKey, small, collapsed }) {
  const theme = useTheme();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;
  const iconStyle = iconStyles[iconKey] || iconStyles.dashboard;

  // Debug: verificar se o tema está sendo lido corretamente
  const isDark = theme.mode === "dark" || theme.palette?.mode === "dark" || theme.palette?.type === "dark";
  const textColor = isDark ? "#ffffff" : (isActive ? iconStyle.color : "#666");

  const renderLink = React.useMemo(
    () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
    [to]
  );

  return (
    <Tooltip title={collapsed ? primary : ""} placement="right">
      <li>
        <ListItem
          button
          component={renderLink}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            minHeight: small ? 40 : 48,
            pl: collapsed ? 2 : small ? 4 : 2,
            pr: collapsed ? 2 : "auto",
            justifyContent: collapsed ? "center" : "flex-start",
            position: "relative",
            overflow: "hidden",
            background: isActive ? alpha(iconStyle.color, 0.15) : "transparent",
            "&:hover": { background: alpha(iconStyle.color, 0.1) },
            "&::before": isActive
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: iconStyle.gradient,
                  borderRadius: "0 4px 4px 0",
                }
              : {},
            "& .MuiListItemText-primary": {
              color: `${textColor} !important`,
            },
          }}
        >
          {icon && (
            <ListItemIcon
              sx={{
                minWidth: collapsed ? "auto" : 40,
                justifyContent: "center",
              }}
            >
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "10px",
                      height: 16,
                      minWidth: 16,
                      padding: "0 4px",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: `${iconStyle.color} !important`,
                      "& svg": { color: `${iconStyle.color} !important` },
                    }}
                  >
                    {icon}
                  </Box>
                </Badge>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: `${iconStyle.color} !important`,
                    "& svg": { color: `${iconStyle.color} !important` },
                  }}
                >
                  {icon}
                </Box>
              )}
            </ListItemIcon>
          )}
          {!collapsed && (
            <ListItemText
              primary={primary}
              primaryTypographyProps={{
                sx: {
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 500 : 400,
                  color: `${textColor} !important`,
                },
              }}
            />
          )}
        </ListItem>
      </li>
    </Tooltip>
  );
}

// ---------------- Main ----------------
const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  // re-render no changeLanguage
  const [, force] = useState(0);
  useEffect(() => {
    const rerender = () => force((n) => n + 1);
    i18n.on("languageChanged", rerender);
    return () => i18n.off("languageChanged", rerender);
  }, []);

  useEffect(() => {
    async function checkHelps() {
      // Não fazer requisição se não houver usuário autenticado
      if (!user || !user.id) {
        setHasHelps(false);
        return;
      }

      try {
        const helps = await list();
        setHasHelps(helps.length > 0);
      } catch (error) {
        // Ignora erros de autenticação durante logout
        if (error?.response?.status !== 401) {
          console.error("Erro ao buscar helps:", error);
        }
        setHasHelps(false);
      }
    }
    checkHelps();
  }, [list, user]);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") ||
    location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    setActiveMenu(location.pathname.startsWith("/tickets") ? "/tickets" : "");
  }, [location, setActiveMenu]);

  useEffect(() => {
    if (collapsed) {
      setOpenCampaignSubmenu(false);
      setOpenFlowSubmenu(false);
      setOpenDashboardSubmenu(false);
    }
  }, [collapsed]);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      if (user.companyId) {
        const companyId = user.companyId;
        const planConfigs = await getPlanCompany(undefined, companyId);
        // Verificar se plan existe antes de acessar propriedades
        if (planConfigs && planConfigs.plan) {
          setShowCampaigns(planConfigs.plan.useCampaigns);
          setShowKanban(planConfigs.plan.useKanban);
          setShowOpenAi(planConfigs.plan.useOpenAi);
          setShowIntegrations(planConfigs.plan.useIntegrations);
          setShowSchedules(planConfigs.plan.useSchedules);
          setShowInternalChat(planConfigs.plan.useInternalChat);
          setShowExternalApi(planConfigs.plan.useExternalApi);
        }
      }
    }
    fetchData();
  }, [user, getPlanCompany]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChat = (data) => {
        if (["new-message", "update"].includes(data.action)) {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };
      socket.on(`company-${companyId}-chat`, onCompanyChat);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChat);
      };
    }
  }, [socket, user.id, user.companyId]);

  useEffect(() => {
    let unreads = 0;
    for (const chat of chats) {
      for (const cu of chat.users) {
        if (cu.userId === user.id) unreads += cu.unreads;
      }
    }
    setInvisible(unreads <= 0);
  }, [chats, user.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      const offline = whatsApps.some((w) =>
        ["qrcode", "PAIRING", "DISCONNECTED", "TIMEOUT", "OPENING"].includes(w.status)
      );
      setConnectionWarning(offline);
    }, 2000);
    return () => clearTimeout(t);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", { params: { searchParam, pageNumber } });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const SectionHeader = ({ children }) =>
    !collapsed && (
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.75rem",
          textTransform: "uppercase",
          padding: "16px 16px 8px",
          lineHeight: 1,
          letterSpacing: "0.5px",
          color: theme.mode === "dark" ? "#ffffff" : "#888",
        }}
      >
        {children}
      </Typography>
    );

  const SubmenuItem = (props) => <ListItemLink small {...props} />;

  const ExpandableMenuItem = ({ icon, primary, iconKey, isActive, isOpen, onToggle, children }) => {
    const iconStyle = iconStyles[iconKey] || iconStyles.dashboard;
    const textColor = theme.mode === "dark" ? "#ffffff" : (isActive ? iconStyle.color : "#666");

    if (collapsed) {
      return (
        <ListItemLink
          to="#"
          primary={primary}
          icon={icon}
          iconKey={iconKey}
          collapsed={collapsed}
        />
      );
    }

    return (
      <>
        <ListItem
          button
          onClick={onToggle}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            minHeight: 48,
            background: isActive ? alpha(iconStyle.color, 0.15) : "transparent",
            "&:hover": { background: alpha(iconStyle.color, 0.1) },
            "& .MuiListItemText-primary": {
              color: `${textColor} !important`,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: iconStyle.color }}>{icon}</ListItemIcon>
          <ListItemText
            primary={primary}
            primaryTypographyProps={{
              sx: {
                fontSize: "0.875rem",
                fontWeight: isActive ? 500 : 400,
                color: `${textColor} !important`,
              },
            }}
          />
          {isOpen ? (
            <ExpandLess sx={{ color: theme.mode === "dark" ? "#ffffff" : "#666" }} />
          ) : (
            <ExpandMore sx={{ color: theme.mode === "dark" ? "#ffffff" : "#666" }} />
          )}
        </ListItem>
        <Collapse
          in={isOpen}
          timeout="auto"
          unmountOnExit
          sx={{
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            mx: 1,
            borderRadius: 2,
          }}
        >
          <List dense component="div" disablePadding>
            {children}
          </List>
        </Collapse>
      </>
    );
  };

  // ---------------- Labels com fallback por idioma ----------------
  const L = {
    // Gerência
    management: tLang("mainDrawer.sections.management", "Gerência", "Management"),
    dashboard: tLang("mainDrawer.listItems.dashboard", "Dashboard", "Dashboard"),
    reports: tLang("mainDrawer.listItems.reports", "Relatórios", "Reports"),
    realtime: tLang("mainDrawer.listItems.chatsTempoReal", "Painel", "Panel"),

    // Principais
    tickets: tLang("mainDrawer.listItems.tickets", "Atendimentos", "Services"),
    quick: tLang("mainDrawer.listItems.quickMessages", "Respostas rápidas", "Quick Responses"),
    kanban: tLang("mainDrawer.listItems.kanban", "Kanban", "Kanban"),
    contacts: tLang("mainDrawer.listItems.contacts", "Contatos", "Contacts"),
    schedules: tLang("mainDrawer.listItems.schedules", "Agendamentos", "Schedules"),
    tags: tLang("mainDrawer.listItems.tags", "Tags", "Tags"),
    internalChat: tLang("mainDrawer.listItems.internalChat", "Chat Interno", "Internal Chat"),
    helps: tLang("mainDrawer.listItems.helps", "Ajuda", "Help"),

    // Administração
    admin: tLang("mainDrawer.listItems.administration", "Administração", "Administration"),
    campaigns: tLang("campaigns.title", "Campanhas", "Campaigns"),
    campaigns_list: tLang("campaigns.subMenus.list", "Listagem", "List"),
    campaigns_contacts: tLang("campaigns.subMenus.listContacts", "Lista de contatos", "Contact List"),
    campaigns_settings: tLang("campaigns.subMenus.settings", "Configurações", "Settings"),

    flowbuilder: tLang("flowbuilder.title", "Flowbuilder", "Flowbuilder"),
    flowbuilder_campaign: tLang("flowbuilder.subMenus.campaign", "Campaign Flow", "Campaign Flow"),
    flowbuilder_conversation: tLang("flowbuilder.subMenus.conversation", "Conversation Flow", "Conversation Flow"),

    announcements: tLang("announcements.title", "Informativos", "Announcements"),
    api: tLang("api.title", "API", "API"),
    users: tLang("users.title", "Usuários", "Users"),
    queues: tLang("queues.title", "Filas & Chatbot", "Queues & Chatbot"),
    prompts: tLang("prompts.title", "Prompts", "Prompts"),
    integrations: tLang("integrations.title", "Integrações", "Integrations"),
    connections: tLang("connections.title", "Conexões", "Connections"),
    allConnections: tLang("connections.manage", "Gerenciar conexões", "Manage connections"),
    files: tLang("mainDrawer.listItems.files", "Arquivos", "File List"),
    financial: tLang("financial.title", "Financeiro", "Financial"),
    settings: tLang("settings.title", "Configurações", "Settings"),
    companies: tLang("companies.title", "Empresas", "Companies"),
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={
          (user.profile === "user" &&
            (user.showDashboard === "enabled" || user.allowRealTime === "enabled"))
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <ExpandableMenuItem
            icon={<DashboardOutlined />}
            primary={L.management}
            iconKey="dashboard"
            isActive={isManagementActive}
            isOpen={openDashboardSubmenu}
            onToggle={() => setOpenDashboardSubmenu((p) => !p)}
          >
            <Can
              role={
                user.profile === "user" && user.showDashboard === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <>
                  <SubmenuItem
                    to="/"
                    primary={L.dashboard}
                    icon={<DashboardOutlined />}
                    iconKey="dashboard"
                  />
                  <SubmenuItem
                    to="/reports"
                    primary={L.reports}
                    icon={<DescriptionRounded />}
                    iconKey="dashboard"
                  />
                </>
              )}
            />
            <Can
              role={
                user.profile === "user" && user.allowRealTime === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <SubmenuItem
                  to="/moments"
                  primary={L.realtime}
                  icon={<GridOnRounded />}
                  iconKey="dashboard"
                />
              )}
            />
          </ExpandableMenuItem>
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={L.tickets}
        icon={<WhatsApp />}
        iconKey="tickets"
        collapsed={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary={L.quick}
        icon={<FlashOn />}
        iconKey="messages"
        collapsed={collapsed}
      />

      {showKanban && (
        <ListItemLink
          to="/kanban"
          primary={L.kanban}
          icon={<ViewKanban />}
          iconKey="kanban"
          collapsed={collapsed}
        />
      )}

      <ListItemLink
        to="/contacts"
        primary={L.contacts}
        icon={<ContactPhoneOutlined />}
        iconKey="contacts"
        collapsed={collapsed}
      />

      {showSchedules && (
        <ListItemLink
          to="/schedules"
          primary={L.schedules}
          icon={<Schedule />}
          iconKey="schedules"
          collapsed={collapsed}
        />
      )}

      <ListItemLink
        to="/tags"
        primary={L.tags}
        icon={<LocalOffer />}
        iconKey="tags"
        collapsed={collapsed}
      />

      {showInternalChat && (
        <ListItemLink
          to="/chats"
          primary={L.internalChat}
          icon={
            <Badge
              color="secondary"
              variant="dot"
              invisible={invisible}
              sx={{ "& .MuiBadge-dot": { backgroundColor: "#ef4444" } }}
            >
              <Forum />
            </Badge>
          }
          iconKey="chats"
          collapsed={collapsed}
        />
      )}

      {hasHelps && (
        <ListItemLink
          to="/helps"
          primary={L.helps}
          icon={<HelpOutline />}
          iconKey="helps"
          collapsed={collapsed}
        />
      )}

      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider sx={{ mx: 2, my: 2, backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }} />
            <SectionHeader>{L.admin}</SectionHeader>

            {showCampaigns && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ExpandableMenuItem
                    icon={<Campaign />}
                    primary={L.campaigns}
                    iconKey="campaigns"
                    isActive={isCampaignRouteActive}
                    isOpen={openCampaignSubmenu}
                    onToggle={() => setOpenCampaignSubmenu((p) => !p)}
                  >
                    <SubmenuItem
                      to="/campaigns"
                      primary={L.campaigns_list}
                      icon={<ListAlt />}
                      iconKey="campaigns"
                    />
                    <SubmenuItem
                      to="/contact-lists"
                      primary={L.campaigns_contacts}
                      icon={<People />}
                      iconKey="campaigns"
                    />
                    <SubmenuItem
                      to="/campaigns-config"
                      primary={L.campaigns_settings}
                      icon={<SettingsOutlined />}
                      iconKey="campaigns"
                    />
                  </ExpandableMenuItem>
                )}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ExpandableMenuItem
                  icon={<WebhookRounded />}
                  primary={L.flowbuilder}
                  iconKey="flowbuilder"
                  isActive={isFlowbuilderRouteActive}
                  isOpen={openFlowSubmenu}
                  onToggle={() => setOpenFlowSubmenu((p) => !p)}
                >
                  <SubmenuItem
                    to="/phrase-lists"
                    primary={L.flowbuilder_campaign}
                    icon={<EventAvailable />}
                    iconKey="flowbuilder"
                  />
                  <SubmenuItem
                    to="/flowbuilders"
                    primary={L.flowbuilder_conversation}
                    icon={<ShapeLineRounded />}
                    iconKey="flowbuilder"
                  />
                </ExpandableMenuItem>
              )}
            />

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={L.announcements}
                icon={<Announcement />}
                iconKey="announcements"
                collapsed={collapsed}
              />
            )}

            {showExternalApi && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/messages-api"
                    primary={L.api}
                    icon={<CodeRounded />}
                    iconKey="api"
                    collapsed={collapsed}
                  />
                )}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/users"
                  primary={L.users}
                  icon={<PeopleAltOutlined />}
                  iconKey="users"
                  collapsed={collapsed}
                />
              )}
            />

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/queues"
                  primary={L.queues}
                  icon={<AccountTreeOutlined />}
                  iconKey="queues"
                  collapsed={collapsed}
                />
              )}
            />

            {showOpenAi && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/prompts"
                    primary={L.prompts}
                    icon={<AllInclusiveRounded />}
                    iconKey="prompts"
                    collapsed={collapsed}
                  />
                )}
              />
            )}

            {showIntegrations && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={L.integrations}
                    icon={<DeviceHubRounded />}
                    iconKey="integrations"
                    collapsed={collapsed}
                  />
                )}
              />
            )}

            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <ListItemLink
                  to="/connections"
                  primary={L.connections}
                  icon={<SignalCellularConnectedNoInternet4BarTwoTone />}
                  iconKey="connections"
                  showBadge={connectionWarning}
                  collapsed={collapsed}
                />
              )}
            />

            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={L.allConnections}
                icon={<PhonelinkSetupRounded />}
                iconKey="connections"
                collapsed={collapsed}
              />
            )}

            {/* REMOVIDO: Lista de arquivos não é mais usado
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/files"
                  primary={L.files}
                  icon={<AttachFileRounded />}
                  iconKey="files"
                  collapsed={collapsed}
                />
              )}
            />
            */}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={L.financial}
                  icon={<LocalAtm />}
                  iconKey="financial"
                  collapsed={collapsed}
                />
              )}
            />

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/settings"
                  primary={L.settings}
                  icon={<SettingsOutlined />}
                  iconKey="settings"
                  collapsed={collapsed}
                />
              )}
            />

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={L.companies}
                icon={<Business />}
                iconKey="companies"
                collapsed={collapsed}
              />
            )}
          </>
        )}
      />

      {!collapsed && (
        <React.Fragment>
          <Divider sx={{ mx: 2, my: 2, backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }} />
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Chip
              label="V4.1.0"
              size="small"
              sx={{
                background: iconStyles.dashboard.gradient,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
