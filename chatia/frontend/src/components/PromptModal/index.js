import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import { MenuItem, FormControl, InputLabel, Select } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

// Alinhar a lista de modelos com o backend
const allowedModels = [
  "gpt-3.5-turbo-1106",
  "gpt-4o",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
];

const PromptSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, i18n.t("promptModal.validation.tooShort"))
    .max(100, i18n.t("promptModal.validation.tooLong"))
    .required(i18n.t("promptModal.validation.required")),
  prompt: Yup.string()
    .min(50, i18n.t("promptModal.validation.tooShort"))
    .required(i18n.t("promptModal.validation.promptDescription")),
  model: Yup.string()
    .oneOf(allowedModels, i18n.t("promptModal.validation.invalidModel"))
    .required(i18n.t("promptModal.validation.informModel")),
  maxTokens: Yup.number()
    .min(10, i18n.t("promptModal.validation.minTokens"))
    .max(4096, i18n.t("promptModal.validation.maxTokens"))
    .required(i18n.t("promptModal.validation.informMaxTokens")),
  temperature: Yup.number()
    .min(0, i18n.t("promptModal.validation.minZero"))
    .max(1, i18n.t("promptModal.validation.maxOne"))
    .required(i18n.t("promptModal.validation.informTemperature")),
  apiKey: Yup.string().required(i18n.t("promptModal.validation.informApiKey")),
  queueId: Yup.number().required(i18n.t("promptModal.validation.informQueue")),
  maxMessages: Yup.number()
    .min(1, i18n.t("promptModal.validation.minMessages"))
    .max(50, i18n.t("promptModal.validation.maxMessages"))
    .required(i18n.t("promptModal.validation.informMaxMessages")),
  voice: Yup.string().when("model", {
    is: "gpt-3.5-turbo-1106",
    then: Yup.string().required(i18n.t("promptModal.validation.informVoiceMode")),
    otherwise: Yup.string().notRequired(),
  }),
  voiceKey: Yup.string().notRequired(),
  voiceRegion: Yup.string().notRequired(),
});

const PromptModal = ({ open, onClose, promptId }) => {
  const classes = useStyles();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleToggleApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const initialState = {
    name: "",
    prompt: "",
    model: "gpt-3.5-turbo-1106",
    voice: "texto",
    voiceKey: "",
    voiceRegion: "",
    maxTokens: 100,
    temperature: 1,
    apiKey: "",
    queueId: null,
    maxMessages: 10,
  };

  const [prompt, setPrompt] = useState(initialState);

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) {
        setPrompt(initialState);
        return;
      }
      try {
        const { data } = await api.get(`/prompt/${promptId}`);
        setPrompt({
          ...initialState,
          ...data,
          queueId: data.queueId || null, // Garantir que queueId seja definido
          model: allowedModels.includes(data.model) ? data.model : "gpt-3.5-turbo-1106", // Validação de modelo
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchPrompt();
  }, [promptId, open]);

  const handleClose = () => {
    setPrompt(initialState);
    onClose();
  };

  const handleSavePrompt = async (values, { setSubmitting, setErrors }) => {
    try {
      const promptData = {
        ...values,
        voice: values.model === "gpt-3.5-turbo-1106" ? values.voice : "texto",
      };
      if (promptId) {
        await api.put(`/prompt/${promptId}`, promptData);
      } else {
        await api.post("/prompt", promptData);
      }
      toast.success(i18n.t("promptModal.success"));
      handleClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || i18n.t("promptModal.errors.savePrompt");
      toastError(errorMessage);
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError.errors) {
          const fieldErrors = {};
          parsedError.errors.forEach(error => {
            if (error.includes("NAME")) fieldErrors.name = error;
            if (error.includes("PROMPT")) fieldErrors.prompt = error;
            if (error.includes("MODEL")) fieldErrors.model = error;
            if (error.includes("TOKENS")) fieldErrors.maxTokens = error;
            if (error.includes("TEMPERATURE")) fieldErrors.temperature = error;
            if (error.includes("APIKEY")) fieldErrors.apiKey = error;
            if (error.includes("QUEUEID")) fieldErrors.queueId = error;
            if (error.includes("MESSAGES")) fieldErrors.maxMessages = error;
            if (error.includes("VOICE")) fieldErrors.voice = error;
          });
          setErrors(fieldErrors);
        }
      } catch (jsonError) {
        // Se não for um JSON, apenas exibir o erro genérico
      }
      setSubmitting(false);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" scroll="paper" fullWidth>
        <DialogTitle id="form-dialog-title">
          {promptId ? i18n.t("promptModal.title.edit") : i18n.t("promptModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={prompt}
          enableReinitialize={true}
          validationSchema={PromptSchema}
          onSubmit={handleSavePrompt}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                />
                <FormControl fullWidth margin="dense" variant="outlined">
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.apikey")}
                    name="apiKey"
                    type={showApiKey ? "text" : "password"}
                    error={touched.apiKey && Boolean(errors.apiKey)}
                    helperText={touched.apiKey && errors.apiKey}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleToggleApiKey}>
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                <Field
                  as={TextField}
                  label={i18n.t("promptModal.form.prompt")}
                  name="prompt"
                  error={touched.prompt && Boolean(errors.prompt)}
                  helperText={touched.prompt && errors.prompt}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  required
                  rows={10}
                  multiline
                />
                <Field
                  name="queueId"
                  component={({ field, form }) => (
                    <QueueSelectSingle
                      selectedQueueId={field.value}
                      onChange={value => form.setFieldValue("queueId", value)}
                    />
                  )}
                />
                <div className={classes.multFieldLine}>
                  <FormControl fullWidth margin="dense" variant="outlined" error={touched.model && Boolean(errors.model)}>
                    <InputLabel>{i18n.t("promptModal.form.model")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("promptModal.form.model")}
                      name="model"
                      onChange={e => {
                        setFieldValue("model", e.target.value);
                        if (e.target.value !== "gpt-3.5-turbo-1106") {
                          setFieldValue("voice", "texto");
                        }
                      }}
                    >
                      {allowedModels.map(model => (
                        <MenuItem key={model} value={model}>
                          {model === "gpt-3.5-turbo-1106" && i18n.t("promptModal.models.gpt35")}
                          {model === "gpt-4o" && i18n.t("promptModal.models.gpt4o")}
                          {model === "gemini-1.5-flash" && i18n.t("promptModal.models.gemini15flash")}
                          {model === "gemini-1.5-pro" && i18n.t("promptModal.models.gemini15pro")}
                          {model === "gemini-2.0-flash" && i18n.t("promptModal.models.gemini20flash")}
                          {model === "gemini-2.0-pro" && i18n.t("promptModal.models.gemini20pro")}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.model && errors.model && (
                      <div style={{ color: "red", fontSize: "12px" }}>{errors.model}</div>
                    )}
                  </FormControl>
                  <FormControl
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                    error={touched.voice && Boolean(errors.voice)}
                  >
                    <InputLabel>{i18n.t("promptModal.form.voice")}</InputLabel>
                    <Field
                      as={Select}
                      label={i18n.t("promptModal.form.voice")}
                      name="voice"
                    >
                      <MenuItem value="texto">{i18n.t("promptModal.voices.text")}</MenuItem>
                      <MenuItem value="pt-BR-FranciscaNeural">{i18n.t("promptModal.voices.francisca")}</MenuItem>
                      <MenuItem value="pt-BR-AntonioNeural">{i18n.t("promptModal.voices.antonio")}</MenuItem>
                      <MenuItem value="pt-BR-BrendaNeural">{i18n.t("promptModal.voices.brenda")}</MenuItem>
                      <MenuItem value="pt-BR-DonatoNeural">{i18n.t("promptModal.voices.donato")}</MenuItem>
                      <MenuItem value="pt-BR-ElzaNeural">{i18n.t("promptModal.voices.elza")}</MenuItem>
                      <MenuItem value="pt-BR-FabioNeural">{i18n.t("promptModal.voices.fabio")}</MenuItem>
                      <MenuItem value="pt-BR-GiovannaNeural">{i18n.t("promptModal.voices.giovanna")}</MenuItem>
                      <MenuItem value="pt-BR-HumbertoNeural">{i18n.t("promptModal.voices.humberto")}</MenuItem>
                      <MenuItem value="pt-BR-JulioNeural">{i18n.t("promptModal.voices.julio")}</MenuItem>
                      <MenuItem value="pt-BR-LeilaNeural">{i18n.t("promptModal.voices.leila")}</MenuItem>
                      <MenuItem value="pt-BR-LeticiaNeural">{i18n.t("promptModal.voices.leticia")}</MenuItem>
                      <MenuItem value="pt-BR-ManuelaNeural">{i18n.t("promptModal.voices.manuela")}</MenuItem>
                      <MenuItem value="pt-BR-NicolauNeural">{i18n.t("promptModal.voices.nicolau")}</MenuItem>
                      <MenuItem value="pt-BR-ValerioNeural">{i18n.t("promptModal.voices.valerio")}</MenuItem>
                      <MenuItem value="pt-BR-YaraNeural">{i18n.t("promptModal.voices.yara")}</MenuItem>
                    </Field>
                    {touched.voice && errors.voice && (
                      <div style={{ color: "red", fontSize: "12px" }}>{errors.voice}</div>
                    )}
                  </FormControl>
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceKey")}
                    name="voiceKey"
                    error={touched.voiceKey && Boolean(errors.voiceKey)}
                    helperText={touched.voiceKey && errors.voiceKey}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.voiceRegion")}
                    name="voiceRegion"
                    error={touched.voiceRegion && Boolean(errors.voiceRegion)}
                    helperText={touched.voiceRegion && errors.voiceRegion}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    disabled={values.model !== "gpt-3.5-turbo-1106"}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.temperature")}
                    name="temperature"
                    error={touched.temperature && Boolean(errors.temperature)}
                    helperText={touched.temperature && errors.temperature}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                    inputProps={{
                      step: "0.1",
                      min: "0",
                      max: "1",
                    }}
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_tokens")}
                    name="maxTokens"
                    error={touched.maxTokens && Boolean(errors.maxTokens)}
                    helperText={touched.maxTokens && errors.maxTokens}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("promptModal.form.max_messages")}
                    name="maxMessages"
                    error={touched.maxMessages && Boolean(errors.maxMessages)}
                    helperText={touched.maxMessages && errors.maxMessages}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    type="number"
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("promptModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {promptId ? i18n.t("promptModal.buttons.okEdit") : i18n.t("promptModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default PromptModal;