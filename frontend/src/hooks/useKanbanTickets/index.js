import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

/**
 * Hook para buscar tickets para Kanban com filtros de data e fila
 *
 * @param {number[]} queueIds - Array de IDs das filas do usuário
 * @param {string} startDate - Data inicial no formato "yyyy-MM-dd"
 * @param {string} endDate - Data final no formato "yyyy-MM-dd"
 * @returns {Object} - { tickets: Ticket[], loading: boolean, error: Error | null, refetch: function }
 *
 * @example
 * const { tickets, loading, error, refetch } = useKanbanTickets(queueIds, startDate, endDate);
 */
const useKanbanTickets = (queueIds, startDate, endDate) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          startDate: startDate,
          endDate: endDate,
        }
      });

      setTickets(data.tickets || []);
    } catch (err) {
      console.error("useKanbanTickets error:", err);
      setError(err);
      toastError(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && queueIds && queueIds.length > 0) {
      fetchTickets();
    }
  }, [user, JSON.stringify(queueIds), startDate, endDate]);

  return { tickets, loading, error, refetch: fetchTickets };
};

export default useKanbanTickets;
