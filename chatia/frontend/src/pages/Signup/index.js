import React, { useState, useEffect, useContext } from "react";
import qs from "query-string";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { IconButton } from "@mui/material";
import ColorModeContext from "../../layout/themeContext";
import { BACKEND_URL } from "../../config/env";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100vw",
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: theme.mode === "light" ? "#f5f5f5" : "#1a1a1a",
    transition: "background-color 0.3s ease",
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  paper: {
    marginTop: theme.spacing(6),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: theme.palette.background.paper,
    padding: theme.spacing(4),
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  logoImg: {
    display: "block",
    margin: "0 auto 20px",
    maxWidth: "200px",
    height: "auto",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(4, 0, 2),
    fontWeight: "bold",
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
      ? theme.palette.primary.main
      : "#ffffff",
  },
  // Estilos para toggle de tema
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      boxShadow: theme.mode === "light"
        ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
        : "0px 4px 12px rgba(0, 0, 0, 0.4)",
      transform: "scale(1.05)",
    },
  },
  // Estilo para o link de login
  loginLink: {
    color: theme.mode === "light" ? theme.palette.primary.main : "#ffffff !important",
    textDecoration: "none",
    fontWeight: "500",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  // Estilo para o título
  signupTitle: {
    color: theme.mode === "light" ? "inherit" : "#ffffff",
    marginBottom: 8,
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("validation.tooShort"))
    .max(50, i18n.t("validation.tooLong"))
    .required(i18n.t("validation.required")),
  companyName: Yup.string()
    .min(2, i18n.t("validation.tooShort"))
    .max(50, i18n.t("validation.tooLong"))
    .required(i18n.t("validation.required")),
  password: Yup.string().min(5, i18n.t("validation.tooShort")).max(50, i18n.t("validation.tooLong")),
  email: Yup.string().email(i18n.t("validation.invalidEmail")).required(i18n.t("validation.required")),
  phone: Yup.string().required(i18n.t("validation.required")),
});

const SignUp = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const { colorMode } = useContext(ColorModeContext);
  const { getPlanList } = usePlans();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
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

  let companyId = null;
  const params = qs.parse(window.location.search);
  if (params.companyId !== undefined) {
    companyId = params.companyId;
  }

  const initialState = {
    name: "",
    email: "",
    password: "",
    phone: "",
    companyId,
    companyName: "",
    planId: "",
  };

  const [user] = useState(initialState);

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
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user creation status");
        }

        const data = await response.json();
        const isEnabled = data.userCreation === "enabled";
        setUserCreationEnabled(isEnabled);

        if (!isEnabled) {
          toast.info(i18n.t("signup.toasts.userCreationDisabled"));
          history.push("/login");
        }
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false);
        toast.error(i18n.t("signup.toasts.verificationError"));
        history.push("/login");
      }
    };

    fetchUserCreationStatus();
  }, [backendUrl, history]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const planList = await getPlanList({ listPublic: "false" });
      setPlans(planList);
      // Definir automaticamente o primeiro plano como padrão
      if (planList && planList.length > 0) {
        user.planId = planList[0].id;
      }
      setLoading(false);
    };
    fetchData();
  }, [getPlanList]);

  const handleSignUp = async (values) => {
    try {
      await openApi.post("/auth/signup", values);
      toast.success(i18n.t("signup.toasts.success"));
      history.push("/login");
    } catch (err) {
      toastError(err);
    }
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("i18nextLng", languageCode);
    handleLanguageMenuClose();
  };

  if (!userCreationEnabled) {
    return null;
  }

  return (
    <div className={classes.root}>
      <CssBaseline />

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

      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <img src={getLogoPath()} alt="Logo" className={classes.logoImg} />
          <Typography component="h1" variant="h5" className={classes.signupTitle}>
            {i18n.t("signup.title")}
          </Typography>
        <Formik
          initialValues={user}
          enableReinitialize={true}
          validationSchema={UserSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSignUp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form className={classes.form}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="companyName"
                    label={i18n.t("signup.form.company")}
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                    name="companyName"
                    autoComplete="companyName"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    autoComplete="name"
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    fullWidth
                    id="name"
                    label={i18n.t("signup.form.name")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="email"
                    label={i18n.t("signup.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    autoComplete="email"
                    inputProps={{ style: { textTransform: "lowercase" } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    name="password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    label={i18n.t("signup.form.password")}
                    type="password"
                    id="password"
                    autoComplete="current-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="phone"
                    label={i18n.t("signup.form.phone")}
                    name="phone"
                    autoComplete="phone"
                  />
                </Grid>
                {/* Campo de plano removido - usando plano padrão automaticamente */}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {i18n.t("signup.buttons.submit")}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    component={RouterLink}
                    to="/login"
                    className={classes.loginLink}
                  >
                    {i18n.t("signup.buttons.login")}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
        </div>
        <Box mt={5}></Box>
      </Container>
    </div>
  );
};

export default SignUp;
