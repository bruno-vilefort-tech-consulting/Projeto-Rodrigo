import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

/**
 * Hook para buscar tags configuradas como colunas Kanban (kanban=1)
 *
 * @returns {Object} - { tags: Tag[], loading: boolean, error: Error | null, refetch: function }
 *
 * @example
 * const { tags, loading, error, refetch } = useKanbanTags();
 */
const useKanbanTags = () => {
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/tag/kanban");
      setTags(response.data.lista || []);
    } catch (err) {
      console.error("useKanbanTags error:", err);
      setError(err);
      toastError(err);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  return { tags, loading, error, refetch: fetchTags };
};

export default useKanbanTags;
