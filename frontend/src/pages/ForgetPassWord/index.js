import { i18n } from "../../translate/i18n";
import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, TextField, Typography, Menu, MenuItem } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { IconButton } from "@mui/material";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ColorModeContext from "../../layout/themeContext";

// Custom SVG icon for email field
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
  // Top left controls (language + theme)
  topLeftControls: {
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  // Language selector styles
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
    color: theme.mode === "light" ? theme.palette.primary.main : "#ffffff",
  },
  // Theme toggle styles
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
  // Form container
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
    border: theme.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
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
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 600,
    color: theme.mode === "light" ? theme.palette.text.primary : "#ffffff",
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
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
    },
    "&:disabled": {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },
  },
  forgotPassword: {
    marginTop: "15px",
    textAlign: "center",
  },
  forgotPasswordLink: {
    color: theme.mode === "light" ? theme.palette.primary.main : "#ffffff",
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": { textDecoration: "underline" },
  },
  // Input field with icon
  textFieldPrimary: {
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
    "&& .MuiOutlinedInput-input": {
      paddingLeft: "45px",
    },
    "&& .MuiInputLabel-outlined": {
      transform: "translate(45px, 20px) scale(1)",
    },
    "&& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
    },
  },
  // Icon container
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  inputIconLeft: {
    position: "absolute",
    left: "12px",
    top: "35px",
    zIndex: 1,
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const ForgotPassword = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);

  // Existing state
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // New state
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);

  // Language options
  const languageOptions = [
    { code: "pt", flag: "/flags/br.png", name: "Português" },
    { code: "en", flag: "/flags/us.png", name: "English" },
    { code: "es", flag: "/flags/es.png", name: "Español" },
    { code: "tr", flag: "/flags/tr.png", name: "Türkçe" },
    { code: "ar", flag: "/flags/sa.png", name: "العربية" },
  ];

  const currentLanguage = localStorage.getItem("i18nextLng") || "pt";
  const selectedLanguage = languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];

  // Logo selection function
  const getLogoPath = () => {
    const isDark = theme.mode === 'dark';
    return isDark
      ? colorMode.appLogoDark || "/logo-dark.png"
      : colorMode.appLogoLight || "/logo-light.png";
  };

  // Add body class for scoped styles
  useEffect(() => {
    document.body.classList.add("forgot-password-page");
    return () => {
      document.body.classList.remove("forgot-password-page");
    };
  }, []);

  // Language selector handlers
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
      window.location.reload(); // Reload to apply translations
    } catch (err) {
      console.error("Erro ao alterar idioma:", err);
    }
  };

  // Keep existing handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setEnviando(false);
      setEnviado(true);
      toast.success(i18n.t("forgotPassword.toasts.success"));
      setTimeout(() => setEnviado(false), 2000);
    } catch (err) {
      setEnviando(false);
      toastError(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>{i18n.t("forgotPassword.title")}</title>
        <style>{`
          /* Theme-adaptive styles */
          body.forgot-password-page .MuiButton-root,
          body.forgot-password-page .MuiButton-root span,
          body.forgot-password-page button {
            color: #ffffff !important;
          }

          body.forgot-password-page .MuiOutlinedInput-root,
          body.forgot-password-page .MuiOutlinedInput-input {
            background-color: ${theme.mode === "light" ? "#ffffff" : "#3a3a3a"} !important;
            color: ${theme.mode === "light" ? "#000000" : "#ffffff"} !important;
          }

          body.forgot-password-page .MuiInputLabel-root {
            color: ${theme.mode === "light" ? "#666666" : "#cccccc"} !important;
          }

          body.forgot-password-page .MuiInputLabel-root.Mui-focused {
            color: ${theme.palette.primary.main} !important;
          }

          body.forgot-password-page a {
            color: ${theme.mode === "light" ? theme.palette.primary.main : "#ffffff"} !important;
          }

          body.forgot-password-page .MuiOutlinedInput-notchedOutline {
            border-color: ${theme.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)"} !important;
          }

          body.forgot-password-page .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
            border-color: ${theme.mode === "light" ? "rgba(0, 0, 0, 0.87)" : "rgba(255, 255, 255, 0.87)"} !important;
          }
        `}</style>
      </Helmet>

      <div className={classes.root}>
        {/* Top left controls */}
        <div className={classes.topLeftControls}>
          {/* Language selector */}
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

          {/* Theme toggle */}
          <IconButton
            className={classes.themeToggle}
            onClick={colorMode.toggleColorMode}
            title={theme.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme.mode === 'dark' ? (
              <img src="/theme/sol.png" alt="Light mode" style={{ width: '24px', height: '24px' }} />
            ) : (
              <img src="/theme/lua.png" alt="Dark mode" style={{ width: '24px', height: '24px' }} />
            )}
          </IconButton>
        </div>

        {/* Language menu */}
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

        {/* Form */}
        <div className={classes.formSide}>
          <form className={classes.formContainer} onSubmit={handleSubmit}>
            {/* Logo */}
            <img src={getLogoPath()} alt={i18n.t("login.logoAlt")} className={classes.logoImg} />

            {/* Title */}
            <Typography variant="h5" className={classes.title}>
              {i18n.t("forgotPassword.title")}
            </Typography>

            {/* Email field with icon */}
            <div className={classes.inputContainer}>
              <TextField
                className={classes.textFieldPrimary}
                label={i18n.t("forgotPassword.form.emailLabel")}
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={enviando}
                required
              />
              <div className={classes.inputIconLeft}>
                <EmailSvgIcon color={theme.mode === "light" ? "#666666" : "#cccccc"} size={20} />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submitBtn}
              disabled={enviando || enviado}
            >
              {enviando ? i18n.t("forgotPassword.loading.sending") : enviado ? i18n.t("forgotPassword.loading.sent") : i18n.t("forgotPassword.form.submitButton")}
            </Button>

            {/* Back to login link */}
            <div className={classes.forgotPassword}>
              <RouterLink to="/login" className={classes.forgotPasswordLink}>
                {i18n.t("forgotPassword.form.backToLogin")}
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
