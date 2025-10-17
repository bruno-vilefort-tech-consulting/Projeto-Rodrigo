import React, { useState, useEffect, useRef, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { head } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { i18n } from "../../translate/i18n";
import moment from "moment";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Typography
} from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import { Autocomplete, Checkbox, Chip, Stack, RadioGroup, FormControlLabel, Radio } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const CampaignModalPhrase = ({ open, onClose, FlowCampaignId, onSave, defaultWhatsappId }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;

  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  const [dataItem, setDataItem] = useState({
    name: "",
    phrase: ""
  });

  const [dataItemError, setDataItemError] = useState({
    name: false,
    flowId: false,
    phrase: false
  });

  const [matchType, setMatchType] = useState("contains");

  const [flowSelected, setFlowSelected] = useState(null);
  const [flowsData, setFlowsData] = useState([]);
  const [flowsDataComplete, setFlowsDataComplete] = useState([]);

  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");

  // ✅ Aplica valor inicial da conexão
  useEffect(() => {
  if (!FlowCampaignId) {
    const stored = localStorage.getItem("selectedWhatsappId");
    if (stored) {
      console.log("Forçando selectedWhatsapp via localStorage:", stored);
      setSelectedWhatsapp(parseInt(stored));
    }
  }
}, [FlowCampaignId]);


  const [whatsAppNames, setWhatsAppNames] = useState([]);
  const [whatsApps, setWhatsApps] = useState([]);
  const [whatsAppSelected, setWhatsAppSelected] = useState({});

  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);

  const getFlows = async () => {
    const flows = await api.get("/flowbuilder");
    setFlowsDataComplete(flows.data.flows);
    setFlowsData(flows.data.flows.map(flow => flow.name));
    return flows.data.flows;
  };

  const detailsPhrase = async flows => {
    setLoading(true);
    await api.get(`/flowcampaign/${FlowCampaignId}`).then(res => {
      console.log("dete", res.data);
      setDataItem({
        name: res.data.details.name,
        phrase: res.data.details.phrase
      });
      setMatchType(res.data.details.matchType || "exact");
      setActive(res.data.details.status)
      const nameFlow = flows.filter(
        itemFlows => itemFlows.id === res.data.details.flowId
      );
      if (nameFlow.length > 0) {
        setFlowSelected(nameFlow[0].name);
        if (res.data.details.whatsappId) {
        console.log("Aplicando whatsappId do banco:", res.data.details.whatsappId);
        setSelectedWhatsapp(res.data.details.whatsappId);
     }

      }
      setLoading(false);
    });
  };

  const handleClose = () => {
    onClose();
  };

  const openModal = async () => {
    const flows = await getFlows();
    if (FlowCampaignId) {
      await detailsPhrase(flows);
    } else {
      clearData();
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true)
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => {
            setWhatsApps(data)
          })
      }
      fetchContacts();
      setLoading(false)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [])


  useEffect(() => {
    setLoading(true)
    if (open === true) {
      openModal();
    }
  }, [open]);

  const clearErrors = () => {
    setDataItemError({
      name: false,
      flowId: false,
      whatsappId: false,
      phrase: false
    });
  };

  const clearData = () => {
    setFlowSelected(null);
    setDataItem({
      name: "",
      phrase: ""
    });
  };

  const applicationSaveAndEdit = async () => {
    let error = 0;
    if (dataItem.name === "" || dataItem.name.length === 0) {
      setDataItemError(old => ({ ...old, name: true }));
      error++;
    }
    if (!flowSelected) {
      setDataItemError(old => ({ ...old, flowId: true }));
      error++;
    }
    if (dataItem.phrase === "" || dataItem.phrase.length === 0) {
      setDataItemError(old => ({ ...old, phrase: true }));
      error++;
    }
    if(!selectedWhatsapp){
      setDataItemError(old => ({ ...old, whatsappId: true }))
    }

    if (error !== 0) {
      return;
    }

    const idFlow = flowsDataComplete.filter(
      item => item.name === flowSelected
    )[0].id;

    const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null

    try {
      if (FlowCampaignId) {
        await api.put("/flowcampaign", {
          id: FlowCampaignId,
          name: dataItem.name,
          flowId: idFlow,
          whatsappId: whatsappId,
          phrase: dataItem.phrase,
          status: active,
          matchType: matchType
        });
        toast.success(i18n.t("campaignsPhrase.phraseUpdated"));
      } else {
        await api.post("/flowcampaign", {
          name: dataItem.name,
          flowId: idFlow,
          whatsappId: whatsappId,
          phrase: dataItem.phrase,
          status: active,
          matchType: matchType
        });
        toast.success(i18n.t("campaignsPhrase.phraseCreated"));
      }

      onClose();
      clearData();
      onSave('ok');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {campaignEditable ? (
            <>
              {FlowCampaignId
                ? i18n.t("campaignsPhrase.modal.editTitle")
                : i18n.t("campaignsPhrase.modal.newTitle")}
            </>
          ) : (
            <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
          )}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input type="file" ref={attachmentFile} />
        </div>
        {!loading && (
          <Stack sx={{ padding: "52px" }}>
            <Stack sx={{ gap: "14px" }}>
              <Stack gap={1}>
                <Typography>{i18n.t("campaignsPhrase.modal.nameLabel")}</Typography>
                <TextField
                  label={""}
                  name="text"
                  variant="outlined"
                  error={dataItemError.name || undefined}
                  defaultValue={dataItem.name}
                  margin="dense"
                  onChange={e => {
                    setDataItem(old => {
                      let newValue = old;
                      newValue.name = e.target.value;
                      return newValue;
                    });
                  }}
                  className={classes.textField}
                  style={{ width: "100%" }}
                />
              </Stack>
              <Stack gap={1}>
                <Typography>{i18n.t("campaignsPhrase.modal.flowLabel")}</Typography>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  value={flowSelected || null}
                  options={flowsData}
                  onChange={(event, newValue) => {
                    setFlowSelected(newValue);
                  }}
                  sx={{ width: "100%" }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      error={dataItemError.flowId || undefined}
                      variant="outlined"
                      style={{ width: "100%" }}
                      placeholder={i18n.t("campaignsPhrase.modal.flowPlaceholder")}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        style={{ borderRadius: "8px" }}
                      />
                    ))
                  }
                />
              </Stack>
              <Stack gap={1}>
                <Select
                  required
                  fullWidth
                  displayEmpty
                  variant="outlined"
                  value={selectedWhatsapp}
                  onChange={(e) => {
                    setSelectedWhatsapp(e.target.value)
                  }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left"
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left"
                    },
                    getContentAnchorEl: null,
                  }}
                  renderValue={() => {
                    if (selectedWhatsapp === "") {
                      return i18n.t("campaignsPhrase.modal.connectionPlaceholder")
                    }
                    const whatsapp = whatsApps.find(w => w.id === selectedWhatsapp)
                    return whatsapp.name
                  }}
                >

                  {whatsApps?.length > 0 &&
                    whatsApps.map((whatsapp, key) => (
                      <MenuItem dense key={key} value={whatsapp.id}>
                        <ListItemText
                          primary={
                            <>
                              <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
                                {whatsapp.name} &nbsp; <p className={(whatsapp.status) === 'CONNECTED' ? classes.online : classes.offline} >({whatsapp.status})</p>
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))
                  }
                </Select>
              </Stack>
              <Stack gap={1}>
                <Typography>{i18n.t("campaignsPhrase.modal.phraseLabel")}</Typography>
                <TextField
                  label={""}
                  name="text"
                  variant="outlined"
                  error={dataItemError.phrase || undefined}
                  defaultValue={dataItem.phrase}
                  margin="dense"
                  onChange={e => {
                    setDataItem(old => {
                      let newValue = old;
                      newValue.phrase = e.target.value;
                      return newValue;
                    });
                  }}
                  className={classes.textField}
                  style={{ width: "100%" }}
                />
              </Stack>
              <Stack gap={1}>
                <Typography>{i18n.t("campaignsPhrase.modal.matchTypeLabel")}</Typography>
                <RadioGroup
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                >
                  <FormControlLabel
                    value="exact"
                    control={<Radio />}
                    label={i18n.t("campaignsPhrase.modal.matchTypeExact")}
                  />
                  <FormControlLabel
                    value="contains"
                    control={<Radio />}
                    label={i18n.t("campaignsPhrase.modal.matchTypeContains")}
                  />
                </RadioGroup>
                <Typography variant="caption" color="textSecondary">
                  {i18n.t("campaignsPhrase.modal.matchTypeTooltip")}
                </Typography>
              </Stack>
              <Stack direction={'row'} gap={2}>
                <Stack justifyContent={'center'}>
                  <Typography>{i18n.t("campaignsPhrase.modal.statusLabel")}</Typography>
                </Stack>
                <Checkbox checked={active} onChange={() => setActive(old => !old)} />
              </Stack>
            </Stack>
            <Stack
              direction={"row"}
              spacing={2}
              alignSelf={"end"}
              marginTop={"16px"}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  onClose();
                  clearErrors();
                }}
              >
                {i18n.t("campaignsPhrase.modal.cancelButton")}
              </Button>
              {FlowCampaignId ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applicationSaveAndEdit()}
                >
                  {i18n.t("campaignsPhrase.modal.saveButton")}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => applicationSaveAndEdit()}
                >
                  {i18n.t("campaignsPhrase.modal.createButton")}
                </Button>
              )}
            </Stack>
          </Stack>
        )}
        {loading && (
          <Stack
            justifyContent={"center"}
            alignItems={"center"}
            minHeight={"10vh"}
            sx={{ padding: "52px" }}
          >
            <CircularProgress />
          </Stack>
        )}
      </Dialog>
    </div>
  );
};

export default CampaignModalPhrase;
