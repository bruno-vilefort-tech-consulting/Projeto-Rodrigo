/**
 * Feature Flags do ChatIA Flow
 *
 * IMPORTANTE: Adicionar novas flags apenas após aprovação do Product Owner.
 * Remover flags antigas após 2 semanas de 100% rollout.
 */

export const FEATURES = {
  /**
   * Kanban V2 com Drag-and-Drop
   * @since 2025-10-13
   * @default false
   * @see docs/kanban/ADR-kanban-v2.md
   */
  KANBAN_V2: process.env.REACT_APP_FEATURE_KANBAN_V2 === 'true',

  // Adicionar novas flags aqui
  // NOVA_FEATURE: process.env.REACT_APP_FEATURE_NOVA === 'true',
};

/**
 * Helper function para checar feature flag em runtime
 * @param {string} featureName - Nome da feature (chave em FEATURES)
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURES[featureName] === true;
};

/**
 * Hook para usar feature flag em componentes
 * @param {string} featureName - Nome da feature
 * @returns {boolean}
 *
 * @example
 * const kanbanV2Enabled = useFeatureFlag('KANBAN_V2');
 * if (kanbanV2Enabled) { ... }
 */
export const useFeatureFlag = (featureName) => {
  return FEATURES[featureName] === true;
};
