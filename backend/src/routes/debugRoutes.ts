import { Router } from "express";
import { getIO } from "../libs/socket";
import isAuth from "../middleware/isAuth";
import logger from "../utils/logger";

const debugRoutes = Router();

// 🔍 DEBUG: Verificar clientes conectados ao namespace
debugRoutes.get("/debug/socket-status", isAuth, async (req, res) => {
  try {
    const io = getIO();
    const companyId = req.user.companyId;
    const namespace = `/workspace-${companyId}`;
    const workspaceNamespace = io.of(namespace);

    // Buscar todos os sockets conectados
    const sockets = await workspaceNamespace.fetchSockets();

    // Listar todos os rooms
    const rooms = Array.from(workspaceNamespace.adapter.rooms.keys());

    const status = {
      namespace,
      connectedClients: sockets.length,
      socketIds: sockets.map(s => ({
        id: s.id,
        rooms: Array.from(s.rooms),
        data: s.data
      })),
      allRooms: rooms,
      timestamp: new Date().toISOString()
    };

    logger.info("🔍 [DEBUG] Socket status requested:", status);

    return res.json(status);
  } catch (error) {
    logger.error("❌ [DEBUG] Error getting socket status:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 🧪 DEBUG: Emitir mensagem de teste
debugRoutes.post("/debug/emit-test", isAuth, async (req, res) => {
  try {
    const io = getIO();
    const companyId = req.user.companyId;
    const { ticketId, ticketUuid, message = "🧪 MENSAGEM DE TESTE" } = req.body;

    const namespace = `/workspace-${companyId}`;
    const eventName = `company-${companyId}-appMessage`;
    const workspaceNamespace = io.of(namespace);

    const testPayload = {
      action: "create",
      message: {
        id: Date.now(),
        body: message,
        ticketId: ticketId || 1,
        fromMe: false,
        createdAt: new Date().toISOString(),
        ticket: {
          id: ticketId || 1,
          uuid: ticketUuid || "test-uuid-123"
        }
      },
      ticket: {
        id: ticketId || 1,
        uuid: ticketUuid || "test-uuid-123",
        status: "open",
        contact: {
          id: 1,
          name: "Teste Debug",
          number: "5511999999999"
        }
      },
      contact: {
        id: 1,
        name: "Teste Debug",
        number: "5511999999999"
      }
    };

    logger.info("🧪 [DEBUG] Emitting test message:", {
      namespace,
      eventName,
      ticketUuid: testPayload.ticket.uuid
    });

    // Emitir para todos no namespace
    workspaceNamespace.emit(eventName, testPayload);

    // Emitir também para o room específico do ticket
    if (ticketUuid) {
      workspaceNamespace.to(ticketUuid).emit(eventName, testPayload);
      logger.info(`🧪 [DEBUG] Also emitted to room: ${ticketUuid}`);
    }

    return res.json({
      success: true,
      namespace,
      eventName,
      payload: testPayload,
      connectedClients: (await workspaceNamespace.fetchSockets()).length
    });
  } catch (error) {
    logger.error("❌ [DEBUG] Error emitting test message:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 🔬 DEBUG: Verificar se um socket específico está conectado
debugRoutes.get("/debug/socket/:socketId", isAuth, async (req, res) => {
  try {
    const io = getIO();
    const companyId = req.user.companyId;
    const { socketId } = req.params;

    const namespace = `/workspace-${companyId}`;
    const workspaceNamespace = io.of(namespace);

    const sockets = await workspaceNamespace.fetchSockets();
    const targetSocket = sockets.find(s => s.id === socketId);

    if (targetSocket) {
      return res.json({
        found: true,
        socketId: targetSocket.id,
        rooms: Array.from(targetSocket.rooms),
        data: targetSocket.data
      });
    } else {
      return res.json({
        found: false,
        socketId,
        message: "Socket not found in namespace"
      });
    }
  } catch (error) {
    logger.error("❌ [DEBUG] Error finding socket:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 📊 DEBUG: Listar todos os namespaces ativos
debugRoutes.get("/debug/namespaces", isAuth, async (req, res) => {
  try {
    const io = getIO();

    // Pegar todos os namespaces
    const namespaces = Array.from(io._nsps.keys());

    const namespaceDetails = await Promise.all(
      namespaces.map(async (ns) => {
        const namespace = io.of(ns);
        const sockets = await namespace.fetchSockets();
        return {
          name: ns,
          connectedClients: sockets.length,
          socketIds: sockets.map(s => s.id)
        };
      })
    );

    return res.json({
      totalNamespaces: namespaces.length,
      namespaces: namespaceDetails
    });
  } catch (error) {
    logger.error("❌ [DEBUG] Error listing namespaces:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default debugRoutes;