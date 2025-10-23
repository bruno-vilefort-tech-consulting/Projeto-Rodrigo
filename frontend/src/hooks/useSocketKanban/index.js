import { useEffect } from "react";

/**
 * Hook para conectar listeners Socket.IO para atualizações real-time de tickets
 *
 * @param {Socket} socket - Instância do Socket.IO (de AuthContext)
 * @param {number} companyId - ID da empresa (de AuthContext)
 * @param {function} onUpdate - Callback executado quando evento chega
 *
 * @example
 * useSocketKanban(socket, user.companyId, refetchTickets);
 */
const useSocketKanban = (socket, companyId, onUpdate) => {
  useEffect(() => {
    if (!socket || !companyId) return;

    const eventTicket = `company-${companyId}-ticket`;
    const eventAppMessage = `company-${companyId}-appMessage`;

    const handleUpdate = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        console.log(`[Socket] Kanban update received:`, data.action);
        onUpdate();
      }
    };

    socket.on(eventTicket, handleUpdate);
    socket.on(eventAppMessage, handleUpdate);

    return () => {
      socket.off(eventTicket, handleUpdate);
      socket.off(eventAppMessage, handleUpdate);
    };
  }, [socket, companyId, onUpdate]);
};

export default useSocketKanban;
