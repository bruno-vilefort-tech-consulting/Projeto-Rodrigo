import React, { useState, useEffect } from "react";
import {
    makeStyles,
    Paper,
    Grid,
    TextField,
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@material-ui/core";
import { Formik, Form, Field } from 'formik';
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import usePlans from "../../hooks/usePlans";
import { i18n } from "../../translate/i18n";
import { useCurrencyContext } from "../../context/Currency/CurrencyContext";
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%'
    },
    mainPaper: {
        width: '100%',
        flex: 1,
        padding: theme.spacing(2)
    },
    fullWidth: {
        width: '100%'
    },
    tableContainer: {
        width: '100%',
        overflowX: "scroll",
        ...theme.scrollbarStyles
    },
    textfield: {
        width: '100%'
    },
    textRight: {
        textAlign: 'right'
    },
    row: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    control: {
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1)
    },
    buttonContainer: {
        textAlign: 'right',
        padding: theme.spacing(1)
    }
}));

export function PlanManagerForm(props) {
    const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
    const classes = useStyles()
    const { currency, updateCurrency, getAvailableCurrencies, loading: currencyLoading } = useCurrencyContext()
    const { user } = useContext(AuthContext)
    const isSuperAdmin = user?.companyId === 1

    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        amount: 0,
        useWhatsapp: true,
        useFacebook: true,
        useInstagram: true,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
        isPublic: true
    });

    useEffect(() => {
        setRecord(initialValue)
    }, [initialValue])

    const handleSubmit = async (data) => {
        onSubmit(data)
    }

    const handleCurrencyChange = async (event) => {
        try {
            await updateCurrency(event.target.value)
            toast.success(i18n.t("settings.success"))
        } catch (err) {
            console.error("Error updating currency:", err)
        }
    }

    return (
        <Formik
            enableReinitialize
            className={classes.fullWidth}
            initialValues={record}
            onSubmit={(values, { resetForm }) =>
                setTimeout(() => {
                    handleSubmit(values)
                    resetForm()
                }, 500)
            }
        >
            {(values) => (
                <Form className={classes.fullWidth}>
                    <Grid spacing={1} justifyContent="flex-start" container>
                        {/* NOME */}
                        <Grid xs={12} sm={6} md={2} xl={2} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.name")}
                                name="name"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                            />
                        </Grid>
                        {/* Campo "Público" ocultado conforme TASK-08 */}
                        {/* <Grid xs={12} sm={6} md={2} xl={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="status-selection">{i18n.t("plans.form.public")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="status-selection"
                                    label={i18n.t("plans.form.public")}
                                    labelId="status-selection-label"
                                    name="isPublic"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("settings.managers.common.yes")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("settings.managers.common.no")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid> */}
                        {/* USUARIOS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.users")}
                                name="users"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* CONEXOES */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("plans.form.connections")}
                                name="connections"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* FILAS */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("settings.managers.plans.queues")}
                                name="queues"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="number"
                            />
                        </Grid>

                        {/* VALOR */}
                        <Grid xs={12} sm={6} md={1} item>
                            <Field
                                as={TextField}
                                label={i18n.t("settings.managers.plans.value")}
                                name="amount"
                                variant="outlined"
                                className={classes.fullWidth}
                                margin="dense"
                                type="text"
                            />
                        </Grid>

                        {/* WHATSAPP */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useWhatsapp-selection">{i18n.t("settings.managers.plans.whatsapp")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useWhatsapp-selection"
                                    label={i18n.t("settings.managers.plans.whatsapp")}
                                    labelId="useWhatsapp-selection-label"
                                    name="useWhatsapp"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* FACEBOOK */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useFacebook-selection">{i18n.t("settings.managers.plans.facebook")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useFacebook-selection"
                                    label={i18n.t("settings.managers.plans.facebook")}
                                    labelId="useFacebook-selection-label"
                                    name="useFacebook"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* INSTAGRAM */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInstagram-selection">{i18n.t("settings.managers.plans.instagram")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInstagram-selection"
                                    label={i18n.t("settings.managers.plans.instagram")}
                                    labelId="useInstagram-selection-label"
                                    name="useInstagram"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CAMPANHAS */}
                        <Grid xs={12} sm={6} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useCampaigns-selection">{i18n.t("plans.form.campaigns")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useCampaigns-selection"
                                    label={i18n.t("plans.form.campaigns")}
                                    labelId="useCampaigns-selection-label"
                                    name="useCampaigns"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* AGENDAMENTOS */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useSchedules-selection">{i18n.t("plans.form.schedules")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useSchedules-selection"
                                    label={i18n.t("plans.form.schedules")}
                                    labelId="useSchedules-selection-label"
                                    name="useSchedules"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* CHAT INTERNO */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useInternalChat-selection">{i18n.t("settings.managers.plans.internalChat")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useInternalChat-selection"
                                    label={i18n.t("settings.managers.plans.internalChat")}
                                    labelId="useInternalChat-selection-label"
                                    name="useInternalChat"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* API Externa */}
                        <Grid xs={12} sm={8} md={4} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useExternalApi-selection">{i18n.t("settings.managers.plans.externalAPI")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useExternalApi-selection"
                                    label={i18n.t("settings.managers.plans.externalAPI")}
                                    labelId="useExternalApi-selection-label"
                                    name="useExternalApi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* KANBAN */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useKanban-selection">{i18n.t("settings.managers.plans.kanban")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useKanban-selection"
                                    label={i18n.t("settings.managers.plans.kanban")}
                                    labelId="useKanban-selection-label"
                                    name="useKanban"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* OPENAI */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useOpenAi-selection">{i18n.t("settings.managers.plans.talkAI")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useOpenAi-selection"
                                    label={i18n.t("settings.managers.plans.talkAI")}
                                    labelId="useOpenAi-selection-label"
                                    name="useOpenAi"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* INTEGRACOES */}
                        <Grid xs={12} sm={8} md={2} item>
                            <FormControl margin="dense" variant="outlined" fullWidth>
                                <InputLabel htmlFor="useIntegrations-selection">{i18n.t("settings.managers.plans.integrations")}</InputLabel>
                                <Field
                                    as={Select}
                                    id="useIntegrations-selection"
                                    label={i18n.t("settings.managers.plans.integrations")}
                                    labelId="useIntegrations-selection-label"
                                    name="useIntegrations"
                                    margin="dense"
                                >
                                    <MenuItem value={true}>{i18n.t("plans.form.enabled")}</MenuItem>
                                    <MenuItem value={false}>{i18n.t("plans.form.disabled")}</MenuItem>
                                </Field>
                            </FormControl>
                        </Grid>

                        {/* MOEDA */}
                        {isSuperAdmin && (
                            <Grid xs={12} sm={8} md={2} item>
                                <FormControl margin="dense" variant="outlined" fullWidth>
                                    <InputLabel>{i18n.t("settings.currency")}</InputLabel>
                                    <Select
                                        value={currency?.code || 'BRL'}
                                        onChange={handleCurrencyChange}
                                        disabled={currencyLoading}
                                        label={i18n.t("settings.currency")}
                                        margin="dense"
                                    >
                                        {getAvailableCurrencies().map((curr) => (
                                            <MenuItem key={curr.code} value={curr.code}>
                                                {curr.symbol} - {curr.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                    <Grid spacing={2} justifyContent="flex-end" container>

                        <Grid sm={3} md={2} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onCancel()} variant="contained">
                                {i18n.t("plans.form.clear")}
                            </ButtonWithSpinner>
                        </Grid>
                        {record.id !== undefined ? (
                            <Grid sm={3} md={2} item>
                                <ButtonWithSpinner className={classes.fullWidth} loading={loading} onClick={() => onDelete(record)} variant="contained" color="secondary">
                                    {i18n.t("plans.form.delete")}
                                </ButtonWithSpinner>
                            </Grid>
                        ) : null}
                        <Grid sm={3} md={2} item>
                            <ButtonWithSpinner className={classes.fullWidth} loading={loading} type="submit" variant="contained" color="primary">
                                {i18n.t("plans.form.save")}
                            </ButtonWithSpinner>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
    )
}

export function PlansManagerGrid(props) {
    const { records, onSelect } = props
    const classes = useStyles()
    const { formatCurrency } = useCurrencyContext()

    const renderWhatsapp = (row) => {
        return row.useWhatsapp === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderFacebook = (row) => {
        return row.useFacebook === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderInstagram = (row) => {
        return row.useInstagram === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderCampaigns = (row) => {
        return row.useCampaigns === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderSchedules = (row) => {
        return row.useSchedules === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderInternalChat = (row) => {
        return row.useInternalChat === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderExternalApi = (row) => {
        return row.useExternalApi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderKanban = (row) => {
        return row.useKanban === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderOpenAi = (row) => {
        return row.useOpenAi === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    const renderIntegrations = (row) => {
        return row.useIntegrations === false ? `${i18n.t("plans.form.no")}` : `${i18n.t("plans.form.yes")}`;
    };

    return (
        <Paper className={classes.tableContainer}>
            <Table
                className={classes.fullWidth}
                // size="small"
                padding="none"
                aria-label="a dense table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell align="center" style={{ width: '1%' }}>#</TableCell>
                        <TableCell align="left">{i18n.t("plans.form.name")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.users")}</TableCell>
                        {/* Coluna "Público" ocultada conforme TASK-08 */}
                        {/* <TableCell align="center">{i18n.t("plans.form.public")}</TableCell> */}
                        <TableCell align="center">{i18n.t("plans.form.connections")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.queues")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.value")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.whatsapp")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.facebook")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.instagram")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.campaigns")}</TableCell>
                        <TableCell align="center">{i18n.t("plans.form.schedules")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.internalChat")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.externalAPI")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.kanban")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.talkAI")}</TableCell>
                        <TableCell align="center">{i18n.t("settings.managers.plans.integrations")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell align="center" style={{ width: '1%' }}>
                                <IconButton onClick={() => onSelect(row)} aria-label="delete">
                                    <EditIcon />
                                </IconButton>
                            </TableCell>
                            <TableCell align="left">{row.name || '-'}</TableCell>
                            <TableCell align="center">{row.users || '-'}</TableCell>
                            {/* Célula "Público" ocultada conforme TASK-08 */}
                            {/* <TableCell align="center">{row.isPublic ? i18n.t("settings.managers.common.yes"): i18n.t("settings.managers.common.no") || '-'}</TableCell> */}
                            <TableCell align="center">{row.connections || '-'}</TableCell>
                            <TableCell align="center">{row.queues || '-'}</TableCell>
                            <TableCell align="center">{formatCurrency(row.amount || 0)}</TableCell>
                            <TableCell align="center">{renderWhatsapp(row)}</TableCell>
                            <TableCell align="center">{renderFacebook(row)}</TableCell>
                            <TableCell align="center">{renderInstagram(row)}</TableCell>
                            <TableCell align="center">{renderCampaigns(row)}</TableCell>
                            <TableCell align="center">{renderSchedules(row)}</TableCell>
                            <TableCell align="center">{renderInternalChat(row)}</TableCell>
                            <TableCell align="center">{renderExternalApi(row)}</TableCell>
                            <TableCell align="center">{renderKanban(row)}</TableCell>
                            <TableCell align="center">{renderOpenAi(row)}</TableCell>
                            <TableCell align="center">{renderIntegrations(row)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    )
}

export default function PlansManager() {
    const classes = useStyles()
    const { list, save, update, remove } = usePlans()

    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [records, setRecords] = useState([])
    const [record, setRecord] = useState({
        name: '',
        users: 0,
        connections: 0,
        queues: 0,
        amount: 0,
        useWhatsapp: true,
        useFacebook: true,
        useInstagram: true,
        useCampaigns: true,
        useSchedules: true,
        useInternalChat: true,
        useExternalApi: true,
        useKanban: true,
        useOpenAi: true,
        useIntegrations: true,
        isPublic: true
    })

    useEffect(() => {
        async function fetchData() {
            await loadPlans()
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record])

    const loadPlans = async () => {
        setLoading(true)
        try {
            const planList = await list()
            setRecords(planList)
        } catch (e) {
            toast.error(i18n.t('settings.toasts.recordsLoadError'))
        }
        setLoading(false)
    }

    const handleSubmit = async (data) => {
        setLoading(true)
        console.log(data)
        try {
            if (data.id !== undefined) {
                await update(data)
            } else {
                await save(data)
            }
            await loadPlans()
            handleCancel()
            toast.success(i18n.t('settings.toasts.operationSuccess'))
        } catch (e) {
            toast.error(i18n.t('settings.toasts.planOperationError'))
        }
        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await remove(record.id)
            await loadPlans()
            handleCancel()
            toast.success(i18n.t('settings.toasts.operationSuccess'))
        } catch (e) {
            toast.error(i18n.t('settings.toasts.operationDeleteError'))
        }
        setLoading(false)
    }

    const handleOpenDeleteDialog = () => {
        setShowConfirmDialog(true)
    }

    const handleCancel = () => {
        setRecord({
            id: undefined,
            name: '',
            users: 0,
            connections: 0,
            queues: 0,
            amount: 0,
            useWhatsapp: true,
            useFacebook: true,
            useInstagram: true,
            useCampaigns: true,
            useSchedules: true,
            useInternalChat: true,
            useExternalApi: true,
            useKanban: true,
            useOpenAi: true,
            useIntegrations: true,
            isPublic: true
        })
    }

    const handleSelect = (data) => {

        let useWhatsapp = data.useWhatsapp === false ? false : true
        let useFacebook = data.useFacebook === false ? false : true
        let useInstagram = data.useInstagram === false ? false : true
        let useCampaigns = data.useCampaigns === false ? false : true
        let useSchedules = data.useSchedules === false ? false : true
        let useInternalChat = data.useInternalChat === false ? false : true
        let useExternalApi = data.useExternalApi === false ? false : true
        let useKanban = data.useKanban === false ? false : true
        let useOpenAi = data.useOpenAi === false ? false : true
        let useIntegrations = data.useIntegrations === false ? false : true

        setRecord({
            id: data.id,
            name: data.name || '',
            users: data.users || 0,
            connections: data.connections || 0,
            queues: data.queues || 0,
            amount: parseFloat(data.amount) || 0,
            useWhatsapp,
            useFacebook,
            useInstagram,
            useCampaigns,
            useSchedules,
            useInternalChat,
            useExternalApi,
            useKanban,
            useOpenAi,
            useIntegrations,
            isPublic: data.isPublic
        })
    }

    return (
        <Paper className={classes.mainPaper} elevation={0}>
            <Grid spacing={2} container>
                <Grid xs={12} item>
                    <PlanManagerForm
                        initialValue={record}
                        onDelete={handleOpenDeleteDialog}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </Grid>
                <Grid xs={12} item>
                    <PlansManagerGrid
                        records={records}
                        onSelect={handleSelect}
                    />
                </Grid>
            </Grid>
            <ConfirmationModal
                title={i18n.t("settings.modals.deleteTitle")}
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => handleDelete()}
            >
                {i18n.t("settings.modals.deleteConfirmation")}
            </ConfirmationModal>
        </Paper>
    )
}