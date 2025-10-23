import { i18n } from "../../translate/i18n";

import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, TextField, Typography, Menu, MenuItem } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";

import { Switch, IconButton } from "@mui/material";
import { Helmet } from "react-helmet";

import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import { BACKEND_URL } from "../../config/env";

// Ícones SVG customizados para evitar problemas de fundo branco
const EmailSvgIcon = ({ color = "#666666", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ backgroundColor: 'transparent' }}
  >
    <path
      d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
      fill={color}
    />
  </svg>
);

const LockSvgIcon = ({ color = "#666666", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ backgroundColor: 'transparent' }}
  >
    <path
      d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9S15.1 4.29 15.1 6V8Z"
      fill={color}
    />
  </svg>
);

const VisibilitySvgIcon = ({ color = "#666666", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ backgroundColor: 'transparent' }}
  >
    <path
      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"
      fill={color}
    />
  </svg>
);

const VisibilityOffSvgIcon = ({ color = "#666666", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ backgroundColor: 'transparent' }}
  >
    <path
      d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8.04 5.21L10.17 7.34C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.09L19.73 22L21 20.73L3.27 3L2 4.27ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8Z"
      fill={color}
    />
  </svg>
);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: theme.mode === "light" ? "#f5f5f5" : "#1a1a1a",
    transition: "background-color 0.3s ease",
  },
  // Container para controles no topo esquerdo
  topLeftControls: {
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  // Estilos para seletor de idioma
  languageSelector: {
    display: "flex",
    alignItems: "center",
    background: theme.mode === "light"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(64, 64, 64, 0.9)",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: theme.mode === "light"
      ? "0px 2px 8px rgba(0, 0, 0, 0.1)"
      : "0px 2px 8px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: theme.mode === "light"
        ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
        : "0px 4px 12px rgba(0, 0, 0, 0.4)",
      transform: "translateY(-1px)",
      background: theme.mode === "light"
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(80, 80, 80, 0.95)",
    },
  },
  flagImage: {
    width: "24px",
    height: "16px",
    marginRight: "8px",
    borderRadius: "2px",
  },
  languageText: {
    fontSize: "14px",
    fontWeight: "500",
    color: theme.mode === "light"
      ? "#000000"
      : "#ffffff",
  },
  // Estilos para toggle de tema (agora ao lado do seletor de idioma)
  themeToggle: {
    background: theme.mode === "light"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(64, 64, 64, 0.9)",
    borderRadius: "50%",
    padding: "10px",
    boxShadow: theme.mode === "light"
      ? "0px 2px 8px rgba(0, 0, 0, 0.1)"
      : "0px 2px 8px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
    minWidth: "44px",
    height: "44px",
    "&:hover": {
      boxShadow: theme.mode === "light"
        ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
        : "0px 4px 12px rgba(0, 0, 0, 0.4)",
      transform: "translateY(-1px)",
      background: theme.mode === "light"
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(80, 80, 80, 0.95)",
    },
  },
  formSide: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    [theme.breakpoints.down("sm")]: { padding: "20px" },
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
    background: theme.mode === "light" ? "#ffffff" : "#2c2c2c",
    borderRadius: "12px",
    boxShadow: theme.mode === "light"
      ? "0px 4px 12px rgba(0, 0, 0, 0.1)"
      : "0px 4px 12px rgba(0, 0, 0, 0.4)",
    padding: "30px",
    animation: "$fadeIn 1s ease-in-out",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    border: theme.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "none",
    [theme.breakpoints.down("sm")]: { maxWidth: "340px", padding: "20px" },
  },
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(20px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
  logoImg: {
    display: "block",
    margin: "0 auto 20px",
    maxWidth: "150px",
    height: "auto",
  },
  submitBtn: {
    marginTop: "20px",
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    borderRadius: "8px",
    padding: "12px",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.5s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
    },
  },
  registerBtn: {
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    borderRadius: "8px",
    padding: "12px",
    fontWeight: "bold",
    width: "100%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
    },
  },
  forgotPassword: { marginTop: "15px", textAlign: "center" },
  forgotPasswordLink: {
    color: theme.mode === "light" ? theme.palette.primary.main : "#ffffff",
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": { textDecoration: "underline" },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    "& .MuiTypography-root": {
      color: theme.palette.primary.main,
      fontWeight: 500,
    },
  },

  /* === NOVO: aplica a cor primária do whitelabel no contorno dos TextFields (v4) === */
  textFieldPrimary: {
    // Cor do label quando focado
    "&& label.Mui-focused": {
      color: theme.palette.primary.main,
    },
    // Borda padrão
    "&& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.main} !important`,
    },
    // Hover
    "&&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.dark} !important`,
    },
    // Foco
    "&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.main} !important`,
      borderWidth: "2px",
    },
    // Padding para dar espaço aos ícones
    "&& .MuiOutlinedInput-input": {
      paddingLeft: "45px", // Espaço para ícone esquerdo
    },
    // Ajustar posição do label para não sobrepor o ícone
    "&& .MuiInputLabel-outlined": {
      transform: "translate(45px, 20px) scale(1)",
    },
    "&& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)", // Quando encolhido, volta à posição padrão
    },
  },

  textFieldWithEndIcon: {
    // Herda do textFieldPrimary
    "&& label.Mui-focused": {
      color: theme.palette.primary.main,
    },
    "&& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.main} !important`,
    },
    "&&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.dark} !important`,
    },
    "&& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: `${theme.palette.primary.main} !important`,
      borderWidth: "2px",
    },
    // Padding para ícones em ambos os lados
    "&& .MuiOutlinedInput-input": {
      paddingLeft: "45px", // Espaço para ícone esquerdo
      paddingRight: "45px", // Espaço para ícone direito
    },
    // Ajustar posição do label para não sobrepor o ícone
    "&& .MuiInputLabel-outlined": {
      transform: "translate(45px, 20px) scale(1)",
    },
    "&& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)", // Quando encolhido, volta à posição padrão
    },
  },

  // Container para posicionamento dos ícones
  inputContainer: {
    position: "relative",
    width: "100%",
  },

  // Ícone posicionado absolutamente no lado esquerdo
  inputIconLeft: {
    position: "absolute",
    left: "12px",
    top: "35px", // Ajustado para alinhar melhor com o texto do label
    zIndex: 1,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Ícone posicionado absolutamente no lado direito
  inputIconRight: {
    position: "absolute",
    right: "12px",
    top: "27px", // Ajustado para alinhar melhor com o texto do label
    zIndex: 1,
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    transition: "opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      opacity: 0.7,
    },
  },


}));

const Login = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { handleLogin } = useContext(AuthContext);
  const { colorMode } = useContext(ColorModeContext);

  const [user, setUser] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

  // Mapeamento de idiomas com bandeiras
  const languageOptions = [
    { code: "pt", flag: "/flags/br.png", name: "Português" },
    { code: "en", flag: "/flags/us.png", name: "English" },
    { code: "es", flag: "/flags/es.png", name: "Español" },
    { code: "tr", flag: "/flags/tr.png", name: "Türkçe" },
    { code: "ar", flag: "/flags/sa.png", name: "العربية" },
  ];

  const currentLanguage = localStorage.getItem("i18nextLng") || "pt";
  const selectedLanguage = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

  const backendUrl =
    BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : BACKEND_URL;

  // Determinar qual logo usar baseado no tema (usando contexto dinâmico)
  const getLogoPath = () => {
    const isDark = theme.mode === 'dark';
    return isDark
      ? colorMode.appLogoDark || "/logo-dark.png"
      : colorMode.appLogoLight || "/logo-light.png";
  };

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch user creation status");
        const data = await response.json();
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false);
      }
    };
    fetchUserCreationStatus();
  }, [backendUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const lang = localStorage.getItem("i18nextLng") || "pt";
    i18n.changeLanguage(lang);
    handleLogin(user);
  };

  // Funções para o seletor de idioma
  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem("i18nextLng", languageCode);
      handleLanguageMenuClose();
      // Recarregar a página para aplicar as traduções
      window.location.reload();
    } catch (err) {
      console.error("Erro ao alterar idioma:", err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{i18n.t("login.title")}</title>
        <style>{`
          /* Cores adaptativas para botões baseadas no tema */
          body.login-page .MuiButton-root,
          body.login-page .MuiButton-root span,
          body.login-page button {
            color: #ffffff !important;
          }

          /* Notificações e alertas */
          .Toastify__toast,
          .MuiSnackbarContent-root,
          .MuiAlert-root {
            color: #ffffff !important;
          }

          /* Campos de input adaptados ao tema */
          body.login-page .MuiOutlinedInput-root,
          body.login-page .MuiOutlinedInput-input {
            background-color: ${theme.mode === "light" ? "#ffffff" : "#3a3a3a"} !important;
            color: ${theme.mode === "light" ? "#000000" : "#ffffff"} !important;
          }

          /* Labels dos campos adaptados ao tema */
          body.login-page .MuiInputLabel-root {
            color: ${theme.mode === "light" ? "#666666" : "#cccccc"} !important;
          }

          /* Labels focados */
          body.login-page .MuiInputLabel-root.Mui-focused {
            color: ${theme.palette.primary.main} !important;
          }


          /* Bordas dos campos de input */
          body.login-page .MuiOutlinedInput-notchedOutline {
            border-color: ${theme.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)"} !important;
          }

          /* Hover das bordas */
          body.login-page .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
            border-color: ${theme.mode === "light" ? "rgba(0, 0, 0, 0.87)" : "rgba(255, 255, 255, 0.87)"} !important;
          }

          /* Texto de erro */
          body.login-page .MuiTypography-colorError {
            color: ${theme.mode === "light" ? "#d32f2f" : "#ff6b6b"} !important;
          }

          /* Links */
          body.login-page a {
            color: ${theme.mode === "light" ? theme.palette.primary.main : "#ffffff"} !important;
          }

          /* Switch "Remember me" */
          body.login-page .MuiTypography-body1 {
            color: ${theme.mode === "light" ? theme.palette.primary.main : "#ffffff"} !important;
          }

          /* Texto do seletor de idioma - sobrescrever regra acima */
          body.login-page .makeStyles-languageText-5,
          body.login-page [class*="makeStyles-languageText"] {
            color: ${theme.mode === "light" ? "#000000" : "#ffffff"} !important;
          }
        `}</style>
      </Helmet>

      <div className={classes.root}>
        {/* Container para controles no topo esquerdo */}
        <div className={classes.topLeftControls}>
          {/* Seletor de idioma */}
          <div className={classes.languageSelector} onClick={handleLanguageMenuOpen}>
            <img
              src={selectedLanguage.flag}
              alt={selectedLanguage.name}
              className={classes.flagImage}
            />
            <Typography className={classes.languageText}>
              {selectedLanguage.name}
            </Typography>
          </div>

          {/* Toggle de tema */}
          <IconButton
            className={classes.themeToggle}
            onClick={colorMode.toggleColorMode}
            title={theme.mode === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
          >
            {theme.mode === 'dark' ? (
              <img
                src="/theme/sol.png"
                alt="Modo claro"
                style={{ width: '24px', height: '24px' }}
              />
            ) : (
              <img
                src="/theme/lua.png"
                alt="Modo escuro"
                style={{ width: '24px', height: '24px' }}
              />
            )}
          </IconButton>
        </div>

        {/* Menu do seletor de idioma */}
        <Menu
          anchorEl={languageMenuAnchor}
          open={Boolean(languageMenuAnchor)}
          onClose={handleLanguageMenuClose}
          getContentAnchorEl={null}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {languageOptions.map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === currentLanguage}
            >
              <img
                src={language.flag}
                alt={language.name}
                className={classes.flagImage}
              />
              <Typography style={{ marginLeft: 8 }}>
                {language.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>

        <div className={classes.formSide}>
          <form className={classes.formContainer} onSubmit={handleSubmit}>
            <img src={getLogoPath()} alt={i18n.t("login.logoAlt")} className={classes.logoImg} />

            <div className={classes.inputContainer}>
              <TextField
                className={classes.textFieldPrimary}
                label={i18n.t("login.emailLabel")}
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
              <div className={classes.inputIconLeft}>
                <EmailSvgIcon color={theme.mode === "light" ? "#666666" : "#cccccc"} size={20} />
              </div>
            </div>

            <div className={classes.inputContainer}>
              <TextField
                className={classes.textFieldWithEndIcon}
                label={i18n.t("login.passwordLabel")}
                variant="outlined"
                fullWidth
                margin="normal"
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
              />
              <div className={classes.inputIconLeft}>
                <LockSvgIcon color={theme.mode === "light" ? "#666666" : "#cccccc"} size={20} />
              </div>
              <div
                className={classes.inputIconRight}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOffSvgIcon color={theme.mode === "light" ? "#374151" : "#cccccc"} size={20} />
                ) : (
                  <VisibilitySvgIcon color={theme.mode === "light" ? "#374151" : "#cccccc"} size={20} />
                )}
              </div>
            </div>

            <div className={classes.rememberMeContainer}>
              <Switch
                checked={user.remember}
                onChange={(e) =>
                  setUser({ ...user, remember: e.target.checked })
                }
                name="remember"
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: user.remember
                      ? theme.palette.primary.main
                      : "#C3C3C3",
                  },
                  "& .Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                  "& .Mui-checked + .MuiSwitch-track": {
                    backgroundColor: theme.palette.primary.main,
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: user.remember
                      ? theme.palette.primary.main
                      : "#C3C3C3",
                  },
                }}
              />
              <Typography>{i18n.t("login.rememberMe")}</Typography>
            </div>

            <div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitBtn}
              >
                {i18n.t("login.loginButton")}
              </Button>

              {userCreationEnabled && (
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  className={classes.registerBtn}
                >
                  {i18n.t("login.signupButton")}
                </Button>
              )}
            </div>

            <div className={classes.forgotPassword}>
              <RouterLink
                to="/forgot-password"
                className={classes.forgotPasswordLink}
              >
                {i18n.t("login.forgotPassword")}
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
