/**
 * Utilitário para validação de contatos
 * Previne que "contatos fantasmas" com números inválidos apareçam na interface
 *
 * @version 2.0.0 - Validação fortalecida contra números fantasmas
 */

/**
 * Valida se um número de telefone é válido
 * @param {string} number - Número a ser validado
 * @returns {boolean} true se válido, false se inválido
 */
export const isValidPhoneNumber = (number) => {
    if (!number) return false;

    // 🔍 DEBUG: Log para verificar se a validação V2 está ativa
    const isDebug = window.location.search.includes('debug=contacts');
    if (isDebug) {
        console.log('🔍 [VALIDATION V2] Validando número:', number);
    }

    // Remover caracteres não numéricos (exceto +)
    const cleanNumber = number.toString().replace(/[^\d]/g, '');

    // Número muito curto (mínimo 8 dígitos)
    if (cleanNumber.length < 8) {
        return false;
    }

    // Número muito longo (máximo 15 dígitos segundo E.164)
    if (cleanNumber.length > 15) {
        if (isDebug) {
            console.log('❌ [VALIDATION V2] Número muito longo:', cleanNumber.length, 'dígitos');
        }
        return false;
    }

    // Verifica se começa com múltiplos zeros (inválido)
    if (cleanNumber.startsWith('00')) {
        return false;
    }

    // 🛡️ NOVO: Bloqueia números com padrões suspeitos no início
    // Exemplos: 555057... (555 + 0), 120363... (sem padrão válido)
    if (/^(555[0-4]|120\d{3}|123456|999999)/.test(cleanNumber)) {
        return false;
    }

    // 🛡️ NOVO: Bloqueia números de teste/placeholder
    // Ex: +55505753084 (555 + muitos zeros no meio)
    if (/555.*0{3,}/.test(cleanNumber)) {
        return false;
    }

    // Verifica padrões suspeitos (números muito repetidos)
    // Ex: 111111111111, 999999999999
    const digitCounts = {};
    for (const digit of cleanNumber) {
        digitCounts[digit] = (digitCounts[digit] || 0) + 1;
    }

    // Se mais de 70% dos dígitos são iguais, é suspeito (reduzido de 80%)
    const maxRepeatedDigits = Math.max(...Object.values(digitCounts));
    if (maxRepeatedDigits > cleanNumber.length * 0.7) {
        return false;
    }

    // 🛡️ NOVO: Verifica se tem sequências longas de zeros
    if (/0{4,}/.test(cleanNumber)) {
        return false;
    }

    // 🛡️ NOVO: Verifica se tem sequências ascendentes/descendentes suspeitas
    if (/012345|123456|234567|345678|456789|987654|876543|765432|654321/.test(cleanNumber)) {
        return false;
    }

    return true;
};

/**
 * Valida se um contato é válido e deve ser exibido
 * @param {object} contact - Contato a ser validado
 * @returns {boolean} true se válido, false se deve ser filtrado
 */
export const isValidContact = (contact) => {
    if (!contact) return false;

    // 🔍 DEBUG: Log para verificar se a validação V2 está ativa
    const isDebug = window.location.search.includes('debug=contacts');
    if (isDebug) {
        console.log('🔍 [VALIDATION V2] Validando contato:', {
            id: contact.id,
            name: contact.name,
            number: contact.number,
            source: contact.source,
            isInAgenda: contact.isInAgenda
        });
    }

    // Contatos de grupo são sempre válidos (podem ter números diferentes)
    if (contact.isGroup) {
        return true;
    }

    // 🛡️ NOVO: Filtrar contatos auto_created que NÃO estão na agenda
    // Esses são contatos criados automaticamente pelo sistema que provavelmente são fantasmas
    if (contact.source === 'auto_created' && contact.isInAgenda === false) {
        console.warn('🚫 Contato fantasma auto_created filtrado:', {
            id: contact.id,
            name: contact.name,
            number: contact.number,
            source: contact.source,
            isInAgenda: contact.isInAgenda,
            reason: 'Criado automaticamente e não está na agenda'
        });
        return false;
    }

    // Se não tem número, verificar se foi criado manualmente
    // Contatos manuais sem número são válidos (exemplo: contatos de email)
    if (!contact.number || contact.number.trim() === '') {
        // Contatos criados manualmente (source='manual') são sempre válidos
        if (contact.source === 'manual') {
            return true;
        }

        // Contatos de outras fontes sem número são suspeitos (fantasmas)
        console.warn('🚫 Contato fantasma filtrado:', {
            id: contact.id,
            name: contact.name,
            number: contact.number,
            source: contact.source,
            reason: 'Sem número e não criado manualmente'
        });
        return false;
    }

    // Se tem número, validar formato
    if (!isValidPhoneNumber(contact.number)) {
        console.warn('🚫 Contato inválido filtrado:', {
            id: contact.id,
            name: contact.name,
            number: contact.number,
            source: contact.source,
            reason: 'Número de telefone com formato inválido'
        });
        return false;
    }

    return true;
};

/**
 * Filtra uma lista de contatos, removendo os inválidos
 * @param {Array} contacts - Lista de contatos
 * @returns {Array} Lista filtrada apenas com contatos válidos
 */
export const filterValidContacts = (contacts) => {
    if (!Array.isArray(contacts)) return [];

    const filteredContacts = contacts.filter(isValidContact);

    const removedCount = contacts.length - filteredContacts.length;
    if (removedCount > 0) {
        console.log(`✅ Filtrados ${removedCount} contatos fantasmas da lista`);
    }

    return filteredContacts;
};

/**
 * Valida se um contato corresponde aos filtros ativos
 * @param {object} contact - Contato a ser validado
 * @param {string} searchParam - Parâmetro de busca
 * @param {Array} selectedTags - Tags selecionadas
 * @returns {boolean} true se corresponde aos filtros
 */
export const matchesFilters = (contact, searchParam, selectedTags) => {
    // Primeiro, validar se é um contato válido
    if (!isValidContact(contact)) {
        return false;
    }

    // Validar filtro de busca (nome, número, email)
    if (searchParam && searchParam.trim() !== "") {
        const contactName = contact.name?.toLowerCase() || "";
        const contactNumber = contact.number?.toLowerCase() || "";
        const contactEmail = contact.email?.toLowerCase() || "";

        const matchesSearch =
            contactName.includes(searchParam) ||
            contactNumber.includes(searchParam) ||
            contactEmail.includes(searchParam);

        if (!matchesSearch) {
            return false;
        }
    }

    // Validar filtro de tags
    if (selectedTags && selectedTags.length > 0) {
        const contactTagIds = contact.tags?.map(t => t.id) || [];
        const hasSelectedTags = selectedTags.some(tagId =>
            contactTagIds.includes(tagId)
        );

        if (!hasSelectedTags) {
            return false;
        }
    }

    return true;
};

export default {
    isValidPhoneNumber,
    isValidContact,
    filterValidContacts,
    matchesFilters
};
