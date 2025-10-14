import React, { useContext, useState } from "react";
import { Menu, MenuItem, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  languageSelector: {
    display: "flex",
    alignItems: "center",
    background: theme.mode === "light"
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(64, 64, 64, 0.9)",
    borderRadius: "8px",
    padding: "8px 12px",
    marginRight: "30px",
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
    width: "20px",
    height: "14px",
    marginRight: "6px",
    borderRadius: "2px",
  },
  languageText: {
    fontSize: "13px",
    fontWeight: "500",
    color: theme.mode === "light" ? "#000000" : "#ffffff",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
  },
  menuFlagImage: {
    width: "20px",
    height: "14px",
    marginRight: "10px",
    borderRadius: "2px",
  },
  menuText: {
    fontSize: "14px",
  },
}));

const UserLanguageSelector = () => {
  const classes = useStyles();
  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);

  // Mapeamento de idiomas com bandeiras
  const languageOptions = [
    { code: "pt-BR", shortCode: "pt", flag: "/flags/br.png", name: "Português" },
    { code: "en", shortCode: "en", flag: "/flags/us.png", name: "English" },
    { code: "es", shortCode: "es", flag: "/flags/es.png", name: "Español" },
    { code: "tr", shortCode: "tr", flag: "/flags/tr.png", name: "Türkçe" },
    { code: "ar", shortCode: "ar", flag: "/flags/sa.png", name: "العربية" },
  ];

  const currentLanguage = localStorage.getItem("i18nextLng") || "pt-BR";
  const selectedLanguage = languageOptions.find(
    lang => lang.code === currentLanguage || lang.shortCode === currentLanguage
  ) || languageOptions[0];

  const handleOpenLanguageMenu = (e) => {
    setLanguageMenuAnchorEl(e.currentTarget);
  };

  const handleCloseLanguageMenu = () => {
    setLanguageMenuAnchorEl(null);
  };

  const handleChangeLanguage = async (language) => {
    try {
      await i18n.changeLanguage(language);
      await api.put(`/users/${user.id}`, { language });
    } catch (err) {
      toastError(err);
    }
    handleCloseLanguageMenu();
  };

  return (
    <>
      <div
        className={classes.languageSelector}
        onClick={handleOpenLanguageMenu}
      >
        <img
          src={selectedLanguage.flag}
          alt={selectedLanguage.name}
          className={classes.flagImage}
        />
        <Typography className={classes.languageText}>
          {selectedLanguage.name}
        </Typography>
      </div>

      <Menu
        anchorEl={languageMenuAnchorEl}
        keepMounted
        open={Boolean(languageMenuAnchorEl)}
        onClose={handleCloseLanguageMenu}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {languageOptions.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleChangeLanguage(language.code)}
            selected={language.code === currentLanguage || language.shortCode === currentLanguage}
            className={classes.menuItem}
          >
            <img
              src={language.flag}
              alt={language.name}
              className={classes.menuFlagImage}
            />
            <Typography className={classes.menuText}>
              {language.name}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default UserLanguageSelector;