import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";

import { i18n } from "../../translate/i18n";

// 🔌 tenta usar seu serviço de socket (ajuste se o caminho for diferente)
import socket from "../../services/socket";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		// padding: theme.spacing(4),
		padding: theme.padding,
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
	},

	chatPapper: {
		// backgroundColor: "red",
		display: "flex",
		height: "100%",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		// backgroundColor: "#eee",
		background: theme.palette.tabHeaderBackground,
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	logo: {
		logo: theme.logo,
		content:
			"url(" +
			((theme.appLogoLight || theme.appLogoDark)
				? getBackendUrl() +
				  "/public/" +
				  (theme.mode === "light"
						? theme.appLogoLight || theme.appLogoDark
						: theme.appLogoDark || theme.appLogoLight)
				: theme.mode === "light"
				? logo
				: logoDark) +
			")",
	},
}));

// Helper para obter companyId de forma tolerante
function getCompanyIdFallback() {
	try {
		// Padrão de muitos forks: user no localStorage
		const saved = localStorage.getItem("user");
		if (saved) {
			const u = JSON.parse(saved);
			if (u?.companyId) return String(u.companyId);
			if (u?.company?.id) return String(u.company.id);
		}
		// fallback comum
		const cid = localStorage.getItem("companyId");
		if (cid) return String(cid);
	} catch (_) {}
	// último recurso
	return "1";
}

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();
	const [bump, setBump] = useState(0); // força re-render leve quando chega socket

	useEffect(() => {
		// só quando há ticket aberto
		if (!ticketId) return;

		// Obtém instância do socket (alguns projetos exportam função, outros o próprio socket)
		const ioMaybe = (socket && (socket.default || socket)) || null;
		const io =
			ioMaybe && typeof ioMaybe === "function" ? ioMaybe() : ioMaybe || (window && (window as any).socket);

		if (!io || !io.emit || !io.on) return;

		const companyId = getCompanyIdFallback();

		// ✅ CORREÇÃO: Usar apenas ticketId (UUID) sem objeto
		console.log("🔌 [Tickets/index] Conectando ao chat box:", ticketId);
		io.emit("joinChatBox", ticketId);

		// handler único que dá um pequeno "bump" para re-renderizar
		const applyAckUpdate = (payload: any) => {
			// se o update é de outro ticket, ignora
			const pTicketId = payload?.message?.ticketId ?? payload?.ticketId;
			const pTicketUuid = payload?.ticket?.uuid ?? payload?.message?.ticket?.uuid;

			// Comparar com UUID do ticket
			if (pTicketUuid && String(pTicketUuid) !== String(ticketId)) return;

			// re-render suave (não remonta componentes)
			console.log("🔄 [Tickets/index] Atualizando mensagem para ticket:", ticketId);
			setBump(b => (b + 1) % 1000);
		};

		// ✅ CORREÇÃO: Focar no evento principal company-${companyId}-appMessage
		const mainEvent = `company-${companyId}-appMessage`;

		io.on(mainEvent, applyAckUpdate);

		// cleanup
		return () => {
			console.log("🔌 [Tickets/index] Desconectando do chat box:", ticketId);
			io.off(mainEvent, applyAckUpdate);
			io.emit("joinChatBoxLeave", ticketId);
		};
	}, [ticketId]);

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								{/* o "bump" força re-render leve do Ticket ao receber eventos */}
								<Ticket _ackRefreshSignal={bump} />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>
									<center>
										<img className={classes.logo} width="50%" alt="" />
									</center>
									{i18n.t("chat.noTicketMessage")}
								</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
