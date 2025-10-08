import React, { useEffect, useState, useContext } from "react";
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green, blue, grey, orange } from "@material-ui/core/colors";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import PublicIcon from "@material-ui/icons/Public";
import BusinessIcon from "@material-ui/icons/Business";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import useTimezone from "../../hooks/useTimezone";
import OnlyForSuperUser from "../OnlyForSuperUser";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  formControl: {
    marginBottom: theme.spacing(3),
    minWidth: 300,
    width: "100%",
  },
  previewCard: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.type === 'dark' ? grey[800] : grey[50],
  },
  previewContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  currentTimeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? blue[900] : blue[50],
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
  inheritedChip: {
    backgroundColor: orange[100],
    color: orange[800],
  },
  customChip: {
    backgroundColor: green[100],
    color: green[800],
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  buttonContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  saveButton: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  resetButton: {
    backgroundColor: grey[300],
    color: grey[700],
    '&:hover': {
      backgroundColor: grey[400],
    },
  },
}));

const TimezoneTab = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const {
    loading,
    getAvailableTimezones,
    getCompanyTimezone,
    updateDefaultTimezone,
    updateCompanyTimezone,
    previewTimeInTimezone
  } = useTimezone();

  const [availableTimezones, setAvailableTimezones] = useState([]);
  const [defaultTimezone, setDefaultTimezone] = useState("");
  const [currentCompanyTimezone, setCurrentCompanyTimezone] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedDefaultTimezone, setSelectedDefaultTimezone] = useState("");
  const [previewTime, setPreviewTime] = useState("");
  const [previewDefaultTime, setPreviewDefaultTime] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get available timezones
        const timezoneData = await getAvailableTimezones();
        setAvailableTimezones(timezoneData.availableTimezones || []);
        setDefaultTimezone(timezoneData.defaultTimezone || "America/Sao_Paulo");
        setSelectedDefaultTimezone(timezoneData.defaultTimezone || "America/Sao_Paulo");

        // Get company timezone
        const companyTzData = await getCompanyTimezone();
        setCurrentCompanyTimezone(companyTzData);
        setSelectedTimezone(companyTzData.timezone);

        // Initial preview
        if (companyTzData.timezone) {
          setPreviewTime(previewTimeInTimezone(companyTzData.timezone));
        }
        if (timezoneData.defaultTimezone) {
          setPreviewDefaultTime(previewTimeInTimezone(timezoneData.defaultTimezone));
        }
      } catch (error) {
        console.error("Error loading timezone data:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadData();
  }, [getAvailableTimezones, getCompanyTimezone, previewTimeInTimezone]);

  // Update preview when timezone selection changes
  useEffect(() => {
    if (selectedTimezone) {
      const timer = setInterval(() => {
        setPreviewTime(previewTimeInTimezone(selectedTimezone));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedTimezone, previewTimeInTimezone]);

  // Update default timezone preview
  useEffect(() => {
    if (selectedDefaultTimezone) {
      const timer = setInterval(() => {
        setPreviewDefaultTime(previewTimeInTimezone(selectedDefaultTimezone));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [selectedDefaultTimezone, previewTimeInTimezone]);

  const handleCompanyTimezoneChange = (event) => {
    const newTimezone = event.target.value;
    setSelectedTimezone(newTimezone);
    setPreviewTime(previewTimeInTimezone(newTimezone));
  };

  const handleDefaultTimezoneChange = (event) => {
    const newTimezone = event.target.value;
    setSelectedDefaultTimezone(newTimezone);
    setPreviewDefaultTime(previewTimeInTimezone(newTimezone));
  };

  const handleSaveCompanyTimezone = async () => {
    try {
      await updateCompanyTimezone(selectedTimezone);
      // Refresh company timezone data
      const companyTzData = await getCompanyTimezone();
      setCurrentCompanyTimezone(companyTzData);
    } catch (error) {
      console.error("Error saving company timezone:", error);
    }
  };

  const handleSaveDefaultTimezone = async () => {
    try {
      await updateDefaultTimezone(selectedDefaultTimezone);
      setDefaultTimezone(selectedDefaultTimezone);
    } catch (error) {
      console.error("Error saving default timezone:", error);
    }
  };

  const handleResetCompanyTimezone = () => {
    setSelectedTimezone(defaultTimezone);
    setPreviewTime(previewTimeInTimezone(defaultTimezone));
  };

  if (initialLoad) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.container}>
      <Grid container spacing={3}>
        {/* Company Timezone Section - Only for non-super admin users */}
        {!user.super && (
          <Grid item xs={12}>
            <div className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                <BusinessIcon color="primary" />
                {i18n.t("settings.timezone.companyTimezone.title")}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl className={classes.formControl}>
                    <InputLabel>{i18n.t("settings.timezone.companyTimezone.selectLabel")}</InputLabel>
                    <Select
                      value={selectedTimezone}
                      onChange={handleCompanyTimezoneChange}
                      disabled={loading}
                    >
                      {availableTimezones.map((timezone) => (
                        <MenuItem key={timezone} value={timezone}>
                          {timezone}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {currentCompanyTimezone?.isCustom
                        ? i18n.t("settings.timezone.companyTimezone.customHelperText")
                        : i18n.t("settings.timezone.companyTimezone.inheritedHelperText")
                      }
                    </FormHelperText>
                  </FormControl>

                  <div className={classes.buttonContainer}>
                    <Button
                      variant="contained"
                      className={classes.saveButton}
                      onClick={handleSaveCompanyTimezone}
                      disabled={loading || selectedTimezone === currentCompanyTimezone?.timezone}
                    >
                      {loading ? <CircularProgress size={24} /> : i18n.t("settings.timezone.buttons.save")}
                    </Button>
                    <Button
                      variant="contained"
                      className={classes.resetButton}
                      onClick={handleResetCompanyTimezone}
                      disabled={loading || selectedTimezone === defaultTimezone}
                    >
                      {i18n.t("settings.timezone.buttons.useDefault")}
                    </Button>
                  </div>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className={classes.previewCard}>
                    <CardContent>
                      <div className={classes.currentTimeBox}>
                        <AccessTimeIcon color="primary" />
                        <div>
                          <Typography variant="body2" color="textSecondary">
                            {i18n.t("settings.timezone.preview.currentTime")}
                          </Typography>
                          <Typography variant="h6">
                            {previewTime}
                          </Typography>
                        </div>
                        <Chip
                          size="small"
                          label={
                            currentCompanyTimezone?.isCustom
                              ? i18n.t("settings.timezone.status.custom")
                              : i18n.t("settings.timezone.status.inherited")
                          }
                          className={`${classes.statusChip} ${
                            currentCompanyTimezone?.isCustom
                              ? classes.customChip
                              : classes.inheritedChip
                          }`}
                        />
                      </div>
                      <Typography variant="body2" color="textSecondary">
                        {selectedTimezone}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          </Grid>
        )}

        {/* Super Admin Section */}
        <OnlyForSuperUser
          user={user}
          yes={() => (
            <Grid item xs={12}>
              <div className={classes.section}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  <PublicIcon color="secondary" />
                  {i18n.t("settings.timezone.defaultTimezone.title")}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl className={classes.formControl}>
                      <InputLabel>{i18n.t("settings.timezone.defaultTimezone.selectLabel")}</InputLabel>
                      <Select
                        value={selectedDefaultTimezone}
                        onChange={handleDefaultTimezoneChange}
                        disabled={loading}
                      >
                        {availableTimezones.map((timezone) => (
                          <MenuItem key={timezone} value={timezone}>
                            {timezone}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {i18n.t("settings.timezone.defaultTimezone.helperText")}
                      </FormHelperText>
                    </FormControl>

                    <div className={classes.buttonContainer}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSaveDefaultTimezone}
                        disabled={loading || selectedDefaultTimezone === defaultTimezone}
                      >
                        {loading ? <CircularProgress size={24} /> : i18n.t("settings.timezone.buttons.saveDefault")}
                      </Button>
                    </div>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card className={classes.previewCard}>
                      <CardContent>
                        <div className={classes.currentTimeBox}>
                          <PublicIcon color="secondary" />
                          <div>
                            <Typography variant="body2" color="textSecondary">
                              {i18n.t("settings.timezone.preview.defaultTime")}
                            </Typography>
                            <Typography variant="h6">
                              {previewDefaultTime}
                            </Typography>
                          </div>
                        </div>
                        <Typography variant="body2" color="textSecondary">
                          {selectedDefaultTimezone}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          )}
        />
      </Grid>
    </div>
  );
};

export default TimezoneTab;