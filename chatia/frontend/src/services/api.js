import axios from "axios";
import { BACKEND_URL } from "../config/env";

const CancelToken = axios.CancelToken;
let cancelTokenSource = null;

const api = axios.create({
	baseURL: BACKEND_URL,
	withCredentials: true,
});

// Função para criar um novo cancelTokenSource
export const createCancelTokenSource = () => {
	cancelTokenSource = CancelToken.source();
	return cancelTokenSource;
};

// Função para cancelar todas as requisições pendentes
export const cancelAllRequests = (message = "Requisições canceladas") => {
	if (cancelTokenSource) {
		cancelTokenSource.cancel(message);
		cancelTokenSource = null;
	}
};

// Adiciona o cancelToken em todas as requisições
api.interceptors.request.use(
	(config) => {
		// Se não houver um cancelTokenSource, cria um novo
		if (!cancelTokenSource) {
			cancelTokenSource = CancelToken.source();
		}
		// Adiciona o token de cancelamento à configuração
		config.cancelToken = cancelTokenSource.token;
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Interceptor de resposta para tratar requisições canceladas
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Se a requisição foi cancelada, não faz nada
		if (axios.isCancel(error)) {
			console.log('Requisição cancelada:', error.message);
			return Promise.resolve(); // Resolve ao invés de rejeitar
		}
		return Promise.reject(error);
	}
);

export const openApi = axios.create({
	baseURL: BACKEND_URL
});

export default api;
