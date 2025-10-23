import { useState, useEffect } from 'react';

/**
 * Hook customizado para gerenciar filtros de contatos
 * Persiste preferências do usuário no localStorage
 *
 * @returns {Object} Estados e setters para filtros de contatos
 * @property {boolean} showOnlyAgenda - Se true, mostra apenas contatos da agenda
 * @property {function} setShowOnlyAgenda - Setter para showOnlyAgenda
 * @property {string} sourceFilter - Filtro de origem ('all', 'manual', 'whatsapp_roster', etc)
 * @property {function} setSourceFilter - Setter para sourceFilter
 */
export const useContactFilters = () => {
  // Estado: showOnlyAgenda (default: true = "Somente meus contatos")
  const [showOnlyAgenda, setShowOnlyAgenda] = useState(() => {
    const saved = localStorage.getItem('contacts_show_only_agenda');
    // Se não houver preferência salva, usar true como default
    return saved === 'false' ? false : true;
  });

  // Estado: sourceFilter (default: 'all')
  const [sourceFilter, setSourceFilter] = useState(() => {
    const saved = localStorage.getItem('contacts_source_filter');
    return saved || 'all';
  });

  // Sincronizar showOnlyAgenda com localStorage
  useEffect(() => {
    localStorage.setItem('contacts_show_only_agenda', String(showOnlyAgenda));
  }, [showOnlyAgenda]);

  // Sincronizar sourceFilter com localStorage
  useEffect(() => {
    localStorage.setItem('contacts_source_filter', sourceFilter);
  }, [sourceFilter]);

  return {
    showOnlyAgenda,
    setShowOnlyAgenda,
    sourceFilter,
    setSourceFilter
  };
};

export default useContactFilters;
