import React, { useState, useEffect, useRef } from "react";
import { parseISO, format } from "date-fns";
import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Switch from "@material-ui/core/Switch";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { TagsContainer } from "../TagsContainer";
// import AsyncSelect from "../AsyncSelect";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
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

	phoneInput: {
		flex: 1,
		marginLeft: theme.spacing(1),
		marginBottom: theme.spacing(2),
		display: "flex",
		flexDirection: "column",
		"& .react-tel-input .form-control": {
			width: "100%",
			height: "40px",
			fontSize: "16px",
			borderRadius: "4px",
			border: "1px solid rgba(0, 0, 0, 0.23)",
			"&:hover": {
				borderColor: "rgba(0, 0, 0, 0.87)",
			},
			"&:focus": {
				borderColor: theme.palette.primary.main,
				borderWidth: "2px",
			},
		},
	},

	fieldRow: {
		display: "flex",
		alignItems: "center",
		gap: theme.spacing(1),
		marginTop: theme.spacing(1),
	},

	phoneLabel: {
		fontSize: "0.75rem",
		marginBottom: theme.spacing(0.5),
		display: "block",
	},
}));

const ContactSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, i18n.t("validation.tooShort"))
		.max(250, i18n.t("validation.tooLong"))
		.required(i18n.t("validation.required")),
	number: Yup.string()
		.nullable()
		.transform((value, originalValue) => {
			// Converte string vazia em null para permitir campo opcional
			return originalValue === "" ? null : value;
		})
		.test(
			"is-valid-number",
			"Formato de número inválido (use apenas dígitos, ex: +5511999999999 ou 5511999999999)",
			function(value) {
				// Se for null ou vazio, é válido (campo opcional)
				if (!value) return true;
				// Se tiver valor, valida o formato
				if (value.length < 10) {
					return this.createError({ message: "Número muito curto (mínimo 10 dígitos)" });
				}
				if (value.length > 15) {
					return this.createError({ message: "Número muito longo (máximo 15 dígitos)" });
				}
				if (!/^\+?\d{10,15}$/.test(value)) {
					return this.createError({ message: "Formato de número inválido (use apenas dígitos)" });
				}
				return true;
			}
		),
	email: Yup.string().email(i18n.t("validation.invalidEmail")),
});

const ContactModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const classes = useStyles();
	const isMounted = useRef(true);

	const initialState = {
		name: "",
		number: "",
		email: "",
		disableBot: false,
		lgpdAcceptedAt: ""
	};

	const [contact, setContact] = useState(initialState);
	const [disableBot, setDisableBot] = useState(false);
	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	useEffect(() => {
		const fetchContact = async () => {
			if (initialValues) {
				setContact(prevState => {
					return { ...prevState, ...initialValues };
				});
			}

			if (!contactId) return;

			try {
				const { data } = await api.get(`/contacts/${contactId}`);
				if (isMounted.current) {
					setContact(data);
					setDisableBot(data.disableBot)
				}
			} catch (err) {
				toastError(err);
			}
		};

		fetchContact();
	}, [contactId, open, initialValues]);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const handleSaveContact = async values => {
		try {
			if (contactId) {
				// Edição: não enviar source (mantém o original)
				await api.put(`/contacts/${contactId}`, { ...values, disableBot: disableBot });
				handleClose();
			} else {
				// Criação: adicionar source='manual'
				const { data } = await api.post("/contacts", {
					...values,
					disableBot: disableBot,
					source: 'manual' // NOVO: Marca como contato criado manualmente
				});
				if (onSave) {
					onSave(data);
				}
				handleClose();
			}
			toast.success(i18n.t("contactModal.success"));
		} catch (err) {
			toastError(err);
		}
	};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					{contactId
						? `${i18n.t("contactModal.title.edit")}`
						: `${i18n.t("contactModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					validationSchema={ContactSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveContact(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<Typography variant="subtitle1" gutterBottom>
									{i18n.t("contactModal.form.mainInfo")}
								</Typography>
								<div className={classes.fieldRow}>
									<div style={{ flex: 1 }}>
										<Field
											as={TextField}
											label={i18n.t("contactModal.form.name")}
											name="name"
											autoFocus
											error={touched.name && Boolean(errors.name)}
											helperText={touched.name && errors.name}
											variant="outlined"
											margin="dense"
											fullWidth
										/>
									</div>
									<div className={classes.phoneInput}>
										<label className={classes.phoneLabel}>
											{i18n.t("contactModal.form.number")} <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>(opcional)</span>
										</label>
										<PhoneInput
											country={'br'}
											value={values.number}
											onChange={phone => setFieldValue('number', phone)}
											placeholder={i18n.t("validation.phonePlaceholder")}
											inputProps={{
												name: 'number',
												required: false,
											}}
											enableSearch={true}
											searchPlaceholder="Buscar país"
											countryCodeEditable={false}
											specialLabel=""
										/>
										{touched.number && errors.number && (
											<Typography variant="caption" color="error" style={{ marginTop: 4 }}>
												{errors.number}
											</Typography>
										)}
									</div>
								</div>
								<div>
									<Field
										as={TextField}
										label={i18n.t("contactModal.form.email")}
										name="email"
										error={touched.email && Boolean(errors.email)}
										helperText={touched.email && errors.email}
										placeholder={i18n.t("validation.emailPlaceholder")}
										fullWidth
										margin="dense"
										variant="outlined"
									/>
								</div>
								<div>
									<TagsContainer contact={contact} className={classes.textField} />
								</div>
								<Typography
									style={{ marginBottom: 8, marginTop: 12 }}
									variant="subtitle1"
								>
									<Switch
										size="small"
										checked={disableBot}
										onChange={() =>
											setDisableBot(!disableBot)
										}
										name="disableBot"
									/>
									{i18n.t("contactModal.form.chatBotContact")}
								</Typography>
								<Typography
									style={{ marginBottom: 8, marginTop: 12 }}
									variant="subtitle1"
								>
									{i18n.t("contactModal.form.whatsapp")} {contact?.whatsapp ? contact?.whatsapp.name : ""}
								</Typography>
								<Typography
									style={{ marginBottom: 8, marginTop: 12 }}
									variant="subtitle1"
								>
									{i18n.t("contactModal.form.termsLGDP")} {contact?.lgpdAcceptedAt ? format(new Date(contact?.lgpdAcceptedAt), "dd/MM/yyyy 'às' HH:mm") : ""}
								</Typography>

								{/* <Typography variant="subtitle1" gutterBottom>{i18n.t("contactModal.form.customer_portfolio")}</Typography> */}
								{/* <div style={{ marginTop: 10 }}>
									<AsyncSelect url="/users" dictKey={"users"}
										initialValue={values.user} width="100%" label={i18n.t("contactModal.form.attendant")}
										onChange={(event, value) => setFieldValue("userId", value ? value.id : null)} />
								</div>
								<div style={{ marginTop: 10 }}>
									<AsyncSelect url="/queue" dictKey={null}
										initialValue={values.queue} width="100%" label={i18n.t("contactModal.form.queue")}
										onChange={(event, value) => setFieldValue("queueId", value ? value.id : null)} />
								</div> */}
								<Typography
									style={{ marginBottom: 8, marginTop: 12 }}
									variant="subtitle1"
								>
									{i18n.t("contactModal.form.extraInfo")}
								</Typography>

								<FieldArray name="extraInfo">
									{({ push, remove }) => (
										<>
											{values.extraInfo &&
												values.extraInfo.length > 0 &&
												values.extraInfo.map((info, index) => (
													<div
														className={classes.extraAttr}
														key={`${index}-info`}
													>
														<Field
															as={TextField}
															label={i18n.t("contactModal.form.extraName")}
															name={`extraInfo[${index}].name`}
															variant="outlined"
															margin="dense"
															className={classes.textField}
														/>
														<Field
															as={TextField}
															label={i18n.t("contactModal.form.extraValue")}
															name={`extraInfo[${index}].value`}
															variant="outlined"
															margin="dense"
															className={classes.textField}
														/>
														<IconButton
															size="small"
															onClick={() => remove(index)}
														>
															<DeleteOutlineIcon />
														</IconButton>
													</div>
												))}
											<div className={classes.extraAttr}>
												<Button
													style={{ flex: 1, marginTop: 8 }}
													variant="outlined"
													color="primary"
													onClick={() => push({ name: "", value: "" })}
												>
													{`+ ${i18n.t("contactModal.buttons.addExtraInfo")}`}
												</Button>
											</div>
										</>
									)}
								</FieldArray>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("contactModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{contactId
										? `${i18n.t("contactModal.buttons.okEdit")}`
										: `${i18n.t("contactModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
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

export default ContactModal;
