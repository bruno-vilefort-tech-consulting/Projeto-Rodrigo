/**
 * Helpers para exibir informações de origem (source) dos contatos
 *
 * Origens possíveis:
 * - manual: Criado manualmente pelo usuário
 * - whatsapp_roster: Importado do roster (agenda) do WhatsApp
 * - excel_import: Importado de arquivo Excel/CSV
 * - auto_created: Auto-criado ao receber mensagem de número desconhecido
 * - chat_import: Importado de chats existentes
 */

/**
 * Retorna o emoji correspondente à source do contato
 * @param {string} source - A origem do contato
 * @returns {string} Emoji representando a origem
 */
export const getSourceEmoji = (source) => {
  const emojiMap = {
    manual: '🔧',
    whatsapp_roster: '📱',
    excel_import: '📊',
    auto_created: '🤖',
    chat_import: '💬'
  };
  return emojiMap[source] || '❓';
};

/**
 * Retorna o label legível da source
 * @param {string} source - A origem do contato
 * @param {object} i18n - Objeto de internacionalização
 * @returns {string} Label traduzido
 */
export const getSourceLabel = (source, i18n) => {
  const labelMap = {
    manual: i18n.t("contacts.source.manual"),
    whatsapp_roster: i18n.t("contacts.source.whatsappRoster"),
    excel_import: i18n.t("contacts.source.excelImport"),
    auto_created: i18n.t("contacts.source.autoCreated"),
    chat_import: i18n.t("contacts.source.chatImport")
  };
  return labelMap[source] || source;
};
