import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

/**
 * Hook para mover ticket entre lanes (tags) com lógica de DELETE + PUT e rollback
 *
 * @returns {Object} - { moveTicket: function, loading: boolean }
 *
 * @example
 * const { moveTicket, loading } = useMoveTicket();
 * await moveTicket(ticketId, oldTagId, newTagId);
 */
const useMoveTicket = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Move ticket entre tags (lanes)
   *
   * @param {number} ticketId - ID do ticket sendo movido
   * @param {string|null} oldTagId - ID da tag antiga (ou "lane0" ou null)
   * @param {string|null} newTagId - ID da tag nova (ou "lane0" ou null)
   */
  const moveTicket = async (ticketId, oldTagId, newTagId) => {
    try {
      setLoading(true);

      // Passo 1: Remover tag antiga (se existir)
      if (oldTagId !== null && oldTagId !== "lane0") {
        await api.delete(`/ticket-tags/${ticketId}`);
        toast.success(i18n.t("kanban.ticketTagRemoved"));
      }

      // Passo 2: Adicionar nova tag (se não for "Sem Tag")
      if (newTagId !== null && newTagId !== "lane0") {
        await api.put(`/ticket-tags/${ticketId}/${newTagId}`);
        toast.success(i18n.t("kanban.ticketTagAdded"));
      }

      // Socket.IO emitirá evento automaticamente
      // Frontend receberá via useSocketKanban e atualizará

    } catch (err) {
      console.error("useMoveTicket error:", err);

      // Rollback: tentar restaurar tag antiga
      if (oldTagId !== null && oldTagId !== "lane0") {
        try {
          await api.put(`/ticket-tags/${ticketId}/${oldTagId}`);
          toast.error(i18n.t("kanban.ticketMoveError") + " - Rollback aplicado");
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
          toast.error(i18n.t("kanban.ticketMoveError") + " - Rollback falhou");
        }
      } else {
        toast.error(i18n.t("kanban.ticketMoveError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return { moveTicket, loading };
};

export default useMoveTicket;
