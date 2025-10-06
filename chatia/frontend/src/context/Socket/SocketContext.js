import { createContext } from "react";
import openSocket from "socket.io-client";
import { BACKEND_URL } from "../../config/env";

const socketManager = {
	currentSocket: null,

	GetSocket: function () {
		const publicToken = localStorage.getItem("public-token");

		if (publicToken !== this.currentToken) {
			if (this.currentSocket) {
				this.currentSocket.disconnect();
			}

			this.currentToken = publicToken;
			this.currentSocket = openSocket(BACKEND_URL, {
				transports: ["websocket"],
				pingTimeout: 18000,
				pingInterval: 18000,
				query: publicToken ? { token: publicToken } : {},
				// auth: publicToken ? { token: publicToken } : {},
			});
		}
		return this.currentSocket;
	},

	onConnect: function (callbackConnect) {
		if (this.currentSocket && this.currentSocket.connected) {
			callbackConnect();
		}
		this.currentSocket.on("connect", callbackConnect);
	},
};

const SocketContext = createContext()

export { SocketContext, socketManager };
