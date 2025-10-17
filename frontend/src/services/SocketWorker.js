import io from "socket.io-client";
import { BACKEND_URL } from "../config/env";

class SocketWorker {
  constructor(companyId , userId) {
    // ✅ CORREÇÃO CRÍTICA: Validar ANTES de criar/retornar instância
    if (!companyId || !userId) {
      console.error("❌ [SocketWorker] Não é possível criar socket sem companyId e userId:", {
        companyId,
        userId
      });
      throw new Error("SocketWorker requires companyId and userId");
    }

    // Se já existe instância com os MESMOS dados, reutilizar
    if (SocketWorker.instance &&
        SocketWorker.instance.companyId === companyId &&
        SocketWorker.instance.userId === userId) {
      console.log("♻️ [SocketWorker] Reutilizando instância existente");
      return SocketWorker.instance;
    }

    // Se existe instância mas com dados DIFERENTES, desconectar e recriar
    if (SocketWorker.instance) {
      console.log("🔄 [SocketWorker] Dados mudaram, recriando socket:", {
        old: { companyId: SocketWorker.instance.companyId, userId: SocketWorker.instance.userId },
        new: { companyId, userId }
      });
      SocketWorker.instance.disconnect();
    }

    // Criar nova instância
    this.companyId = companyId;
    this.userId = userId;
    this.socket = null;
    this.eventListeners = {}; // Armazena os ouvintes de eventos registrados

    // Configurar socket imediatamente
    this.configureSocket();

    // Salvar instância
    SocketWorker.instance = this;

    console.log("✅ [SocketWorker] Nova instância criada com sucesso:", {
      companyId: this.companyId,
      userId: this.userId
    });

    return this;
  }

  configureSocket() {
    // ✅ CORREÇÃO: Usar namespace /workspace-{companyId} para compatibilidade com backend
    // ✅ CORREÇÃO CRÍTICA: Adicionar token JWT no handshake
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ [SocketWorker] Token não encontrado, não é possível conectar ao Socket.IO");
      return;
    }

    if (!this.companyId || !this.userId) {
      console.error("❌ [SocketWorker] companyId ou userId ausentes:", {
        companyId: this.companyId,
        userId: this.userId
      });
      return;
    }

    // ✅ CORREÇÃO: Converter userId para string para compatibilidade com backend
    const userIdString = String(this.userId);

    console.log("🔄 [SocketWorker] Configurando socket com:", {
      namespace: `/workspace-${this.companyId}`,
      userId: userIdString,
      userIdType: typeof userIdString,
      originalUserId: this.userId,
      originalType: typeof this.userId,
      hasToken: !!token
    });

    this.socket = io(`${BACKEND_URL}/workspace-${this?.companyId}` , {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      query: {
        userId: userIdString,  // ✅ Enviar como string
        token: token  // ✅ Adicionar token para autenticação
      }
    });

    this.socket.on("connect", () => {
      console.log("✅ [SocketWorker] Conectado ao servidor Socket.IO:", {
        socketId: this.socket.id,
        companyId: this.companyId,
        userId: this.userId,
        namespace: `/workspace-${this.companyId}`,
        url: `${BACKEND_URL}/workspace-${this.companyId}`,
        connected: this.socket.connected,
        auth: this.socket.auth
      });

      // ✅ DEBUG: Expor socket real globalmente
      window.socketReal = this.socket;

      // ✅ DEBUG: Log dos callbacks registrados
      console.log("📋 [SocketWorker] Callbacks registrados:", Object.keys(this.socket._callbacks || {}));
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ [SocketWorker] Erro de conexão:", {
        message: error.message,
        type: error.type,
        data: error.data,
        stack: error.stack
      });

      // ✅ DEBUG: Tentar reconectar em caso de erro de autenticação
      if (error.message === "Token inválido" || error.message === "Token ausente") {
        console.log("🔄 [SocketWorker] Tentando obter novo token...");
        const newToken = localStorage.getItem("token");
        if (newToken && newToken !== token) {
          console.log("🔄 [SocketWorker] Novo token encontrado, reconfigurando socket...");
          this.configureSocket();
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ [SocketWorker] Desconectado do servidor Socket.IO");
      this.reconnectAfterDelay();
    });
  }

  // Adiciona um ouvinte de eventos
  on(event, callback) {
    this.connect();

    if (!this.socket) {
      console.error("❌ [SocketWorker.on] Socket não existe! Não é possível registrar listener para:", event);
      return;
    }

    console.log("🎧 [SocketWorker.on] Registrando listener:", {
      event,
      socketExists: !!this.socket,
      socketConnected: this.socket?.connected
    });

    this.socket.on(event, callback);

    // Armazena o ouvinte no objeto de ouvintes
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);

    // ✅ DEBUG: Log quando registrar listener
    console.log("✅ [SocketWorker.on] Listener registrado com sucesso:", {
      event,
      totalListeners: this.eventListeners[event].length,
      allEvents: Object.keys(this.eventListeners)
    });
  }

  // Emite um evento
  emit(event, data, callback) {
    this.connect();

    if (!this.socket) {
      console.error("❌ [SocketWorker.emit] Socket não existe! Não é possível emitir:", event);
      return;
    }

    console.log("📤 [SocketWorker.emit] Emitindo evento:", {
      event,
      hasData: !!data,
      hasCallback: !!callback,
      socketConnected: this.socket?.connected
    });

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  // Desconecta um ou mais ouvintes de eventos
  off(event, callback) {
    this.connect();
    if (this.eventListeners[event]) {
      // console.log("Desconectando do servidor Socket.IO:", event, callback);
      if (callback) {
        // Desconecta um ouvinte específico
        this.socket.off(event, callback);
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      } else {
        // console.log("DELETOU EVENTOS DO SOCKET:", this.eventListeners[event]);

        // Desconecta todos os ouvintes do evento
        this.eventListeners[event].forEach(cb => this.socket.off(event, cb));
        delete this.eventListeners[event];
      }
      // console.log("EVENTOS DO SOCKET:", this.eventListeners);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null
      this.instance = null
      console.log("Socket desconectado manualmente");
    }
  }

  reconnectAfterDelay() {
    setTimeout(() => {
      if (!this.socket || !this.socket.connected) {
        console.log("Tentando reconectar após desconexão");
        this.connect();
      }
    }, 1000);
  }

  // Garante que o socket esteja conectado
  connect() {
    if (!this.socket) {
      this.configureSocket();
    }
  }

  forceReconnect() {

  }
}

// const instance = (companyId, userId) => new SocketWorker(companyId,userId);
const instance = (companyId, userId) => new SocketWorker(companyId, userId);

export default instance;