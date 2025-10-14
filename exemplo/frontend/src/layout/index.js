import React, { useState, useContext, useEffect, useMemo } from "react";
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  withStyles,
  Chip,
} from "@material-ui/core";

import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CachedIcon from "@material-ui/icons/Cached";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "./themeContext";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import VersionControl from "../components/VersionControl";

// logos (fallbacks)
const logo = "/logo-light.png";
const logoDark = "/logo-dark.png";

const backendUrl = getBackendUrl();
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
    backgroundColor: theme.palette.fancyBackground,
    "& .MuiButton-outlinedPrimary": {
      color: theme.palette.primary,
      border:
        theme.mode === "light"
          ? "1px solid rgba(0 124 102)"
          : "1px solid rgba(255, 255, 255, 0.5)",
    },
    "& .MuiTab-textColorPrimary.Mui-selected": {
      color: theme.palette.primary,
    },
  },

  chip: { background: "red", color: "white" },
  avatar: { width: "100%" },

  toolbar: {
    paddingRight: 24,
    color: theme.palette.dark.main,
    background: theme.palette.barraSuperior,
    gap: theme.spacing(1),
    overflow: "visible", // não corta o scroller
    [theme.breakpoints.down("sm")]: {
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      minHeight: 48,
      gap: theme.spacing(0.5),
      display: "flex",
      alignItems: "center",
      flexWrap: "nowrap",
    },
  },

  // SCROLLER HORIZONTAL (ícones)
  topbarScroller: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    flex: "1 1 0%",
    minWidth: 0,
    maxWidth: "100%",
    flexWrap: "nowrap",

    // DESKTOP: alinhar à direita
    justifyContent: "flex-end",
    overflowX: "visible",

    // cada filho não encolhe => gera overflow quando somar mais que a largura
    "& > *": { flex: "0 0 auto" },

    // MOBILE: alinhar à esquerda + scroll horizontal invisível
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-start",
      overflowX: "auto",
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch",
      touchAction: "pan-x",
      overscrollBehaviorX: "contain",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
    },
  },

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    padding: "0 8px",
    minHeight: "48px",
    [theme.breakpoints.down("sm")]: { height: "48px" },
  },

  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    // no mobile, não desloca a barra ao abrir o drawer temporário
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  },

  menuButtonHidden: { display: "none" },

  title: {
    flexGrow: 0,
    fontSize: 14,
    color: "white",
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down("sm")]: { display: "none" },
  },

  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
    overflowY: "hidden",
  },
  drawerPaperClose: {
    overflowX: "hidden",
    overflowY: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: { width: theme.spacing(9) },
  },

  appBarSpacer: { minHeight: 48 },

  content: { flex: 1, overflow: "visible", position: "relative" },

  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },

  containerWithScroll: {
    flex: 1,
    overflowY: "scroll",
    overflowX: "hidden",
    ...theme.scrollbarStyles,
    borderRadius: "8px",
    border: "2px solid transparent",
    "&::-webkit-scrollbar": { display: "none" },
    "-ms-overflow-style": "none",
    "scrollbar-width": "none",
  },

  logoImg: {
    width: "100%",
    height: 45,
    maxWidth: 180,
    objectFit: "contain",
  },
  hideLogo: { display: "none" },

  avatar2: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    cursor: "pointer",
    borderRadius: "50%",
    border: "2px solid #ccc",
  },

  compressIconButton: {
    [theme.breakpoints.down("sm")]: { padding: 6 },
  },
}));

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "$ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}))(Badge);

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userToken, setUserToken] = useState("disabled");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user, socket } = useContext(AuthContext);

  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  useEffect(() => {
    const getSetting = async () => {
      const response = await settings.get("wtV");
      setUserToken("disabled");
    };
    getSetting();
  });

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      if (user.defaultMenu === "closed") setDrawerOpen(false);
      else setDrawerOpen(true);
    }
    if (user.defaultTheme === "dark" && theme.mode === "light") {
      colorMode.toggleColorMode();
    }
  }, [user.defaultMenu, document.body.offsetWidth]);

  useEffect(() => {
    if (document.body.offsetWidth < 600) setDrawerVariant("temporary");
    else setDrawerVariant("permanent");
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = user.companyId;
    const userId = user.id;
    if (companyId) {
      const ImageUrl = user.profileImage;
      if (ImageUrl !== undefined && ImageUrl !== null)
        setProfileUrl(`${backendUrl}/public/avatar/${ImageUrl}`);
      else setProfileUrl(`${process.env.FRONTEND_URL}/nopicture.png`);

      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toastError("Sua conta foi acessada em outro computador.");
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1000);
        }
      };

      socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);

      socket.emit("userStatus");
      const interval = setInterval(() => {
        socket.emit("userStatus");
      }, 1000 * 60 * 5);

      return () => {
        socket.off(`company-${companyId}-auth`, onCompanyAuthLayout);
        clearInterval(interval);
      };
    }
  }, [socket]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };
  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };
  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };
  const drawerClose = () => {
    if (document.body.offsetWidth < 600 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };
  const handleRefreshPage = () => window.location.reload(false);

  if (loading) return <BackdropLoading />;

  // src da logo com fallback ao tema
  const logoSrc =
    theme.mode === "light"
      ? (typeof theme.calculatedLogoLight === "function"
          ? theme.calculatedLogoLight()
          : logo)
      : (typeof theme.calculatedLogoDark === "function"
          ? theme.calculatedLogoDark()
          : logoDark);

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(classes.drawerPaper, !drawerOpen && classes.drawerPaperClose),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          {/* Logo visível no Drawer */}
          <img
            src={logoSrc}
            alt="logo"
            className={drawerOpen ? classes.logoImg : classes.hideLogo}
            style={{ display: "block", margin: "0 auto" }}
          />
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <List className={classes.containerWithScroll}>
          <MainListItems collapsed={!drawerOpen} />
        </List>
        <Divider />
      </Drawer>

      <AppBar
        position="fixed"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar}>
          {/* Esquerda: botão do menu */}
          <IconButton
            edge="start"
            aria-label="open drawer"
            style={{ color: "white", flexShrink: 0 }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(drawerOpen && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>

          {/* Título (desktop apenas) */}
          <Typography component="h2" variant="h6" color="inherit" noWrap className={classes.title}>
            {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>! (
                {i18n.t("mainDrawer.appBar.user.active")} {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
                {i18n.t("mainDrawer.appBar.user.messageEnd")} <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>

          {/* Direita: Ícones no scroller */}
          <div className={classes.topbarScroller}>
            {userToken === "enabled" && user?.companyId === 1 && (
              <Chip className={classes.chip} label={i18n.t("mainDrawer.appBar.user.token")} />
            )}

            <VersionControl />
            <UserLanguageSelector />

            <IconButton
              edge="start"
              onClick={colorMode.toggleColorMode}
              style={{ padding: 8 }}
            >
              {theme.mode === "dark" ? (
                <img
                  src="/theme/sol.png"
                  alt="Modo claro"
                  style={{ width: '24px', height: '24px' }}
                />
              ) : (
                <img
                  src="/theme/lua-clara.png"
                  alt="Modo escuro"
                  style={{ width: '24px', height: '24px' }}
                />
              )}
            </IconButton>

            <NotificationsVolume setVolume={setVolume} volume={volume} />

            <IconButton
              onClick={handleRefreshPage}
              aria-label={i18n.t("mainDrawer.appBar.refresh")}
              color="inherit"
            >
              <CachedIcon style={{ color: "white" }} />
            </IconButton>

            {user.id && <NotificationsPopOver volume={volume} />}

            <AnnouncementsPopover />
            <ChatPopover />

            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
              onClick={handleMenu}
            >
              <Avatar alt="Multi100" className={classes.avatar2} src={profileUrl} />
            </StyledBadge>

            {/* Menu do usuário */}
            <UserModal
              open={userModalOpen}
              onClose={() => setUserModalOpen(false)}
              onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
              userId={user?.id}
            />
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>{i18n.t("mainDrawer.appBar.user.profile")}</MenuItem>
              <MenuItem onClick={handleClickLogout}>{i18n.t("mainDrawer.appBar.user.logout")}</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;
