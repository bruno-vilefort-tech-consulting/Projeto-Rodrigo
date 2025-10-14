import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Mapeamento de códigos de países para emojis de bandeiras
 * Os emojis são baseados no padrão Unicode Regional Indicator Symbols
 */
const countryFlags = {
  // Américas
  US: '🇺🇸', // Estados Unidos
  BR: '🇧🇷', // Brasil
  CA: '🇨🇦', // Canadá
  MX: '🇲🇽', // México
  AR: '🇦🇷', // Argentina
  CL: '🇨🇱', // Chile
  CO: '🇨🇴', // Colômbia
  PE: '🇵🇪', // Peru
  VE: '🇻🇪', // Venezuela
  EC: '🇪🇨', // Equador
  UY: '🇺🇾', // Uruguai
  PY: '🇵🇾', // Paraguai
  BO: '🇧🇴', // Bolívia
  CR: '🇨🇷', // Costa Rica
  PA: '🇵🇦', // Panamá
  GT: '🇬🇹', // Guatemala
  CU: '🇨🇺', // Cuba
  DO: '🇩🇴', // República Dominicana
  HN: '🇭🇳', // Honduras
  NI: '🇳🇮', // Nicarágua
  SV: '🇸🇻', // El Salvador

  // Europa
  GB: '🇬🇧', // Reino Unido
  DE: '🇩🇪', // Alemanha
  FR: '🇫🇷', // França
  IT: '🇮🇹', // Itália
  ES: '🇪🇸', // Espanha
  PT: '🇵🇹', // Portugal
  NL: '🇳🇱', // Holanda
  BE: '🇧🇪', // Bélgica
  CH: '🇨🇭', // Suíça
  AT: '🇦🇹', // Áustria
  SE: '🇸🇪', // Suécia
  NO: '🇳🇴', // Noruega
  DK: '🇩🇰', // Dinamarca
  FI: '🇫🇮', // Finlândia
  IE: '🇮🇪', // Irlanda
  PL: '🇵🇱', // Polônia
  GR: '🇬🇷', // Grécia
  CZ: '🇨🇿', // República Tcheca
  RO: '🇷🇴', // Romênia
  HU: '🇭🇺', // Hungria

  // Ásia
  CN: '🇨🇳', // China
  JP: '🇯🇵', // Japão
  KR: '🇰🇷', // Coreia do Sul
  IN: '🇮🇳', // Índia
  ID: '🇮🇩', // Indonésia
  PH: '🇵🇭', // Filipinas
  VN: '🇻🇳', // Vietnã
  TH: '🇹🇭', // Tailândia
  MY: '🇲🇾', // Malásia
  SG: '🇸🇬', // Singapura
  TR: '🇹🇷', // Turquia
  SA: '🇸🇦', // Arábia Saudita
  AE: '🇦🇪', // Emirados Árabes Unidos
  IL: '🇮🇱', // Israel

  // África
  ZA: '🇿🇦', // África do Sul
  EG: '🇪🇬', // Egito
  NG: '🇳🇬', // Nigéria
  KE: '🇰🇪', // Quênia
  MA: '🇲🇦', // Marrocos
  AO: '🇦🇴', // Angola
  MZ: '🇲🇿', // Moçambique

  // Oceania
  AU: '🇦🇺', // Austrália
  NZ: '🇳🇿', // Nova Zelândia
};

/**
 * Obtém a bandeira emoji para um código de país
 * @param {string} countryCode - Código ISO de 2 letras do país (ex: 'US', 'BR')
 * @returns {string} Emoji da bandeira ou string vazia se não encontrado
 */
const getCountryFlag = (countryCode) => {
  return countryFlags[countryCode] || '';
};

/**
 * Formata um número de telefone com a bandeira do país
 * Suporta números internacionais de diversos países
 *
 * @param {string} phoneNumber - Número de telefone a ser formatado (pode incluir @c.us)
 * @param {boolean} hidePartial - Se true, oculta parte do número para LGPD
 * @param {boolean} isGroup - Se true, não formata (grupos não têm bandeira)
 * @returns {string} Número formatado com bandeira ou número original se inválido
 */
export const formatPhoneWithCountryFlag = (phoneNumber, hidePartial = false, isGroup = false) => {
  // Se for um grupo, retorna o número original
  if (isGroup || !phoneNumber) {
    return phoneNumber;
  }

  try {
    // Remove sufixo do WhatsApp se presente
    let cleanNumber = String(phoneNumber).replace('@c.us', '').replace('@s.whatsapp.net', '').trim();

    // Se não começar com +, tenta adicionar
    if (!cleanNumber.startsWith('+')) {
      cleanNumber = '+' + cleanNumber;
    }

    // Valida se é um número de telefone válido
    if (!isValidPhoneNumber(cleanNumber)) {
      // Se não for válido, retorna o número original
      return phoneNumber;
    }

    // Parse do número
    const parsed = parsePhoneNumber(cleanNumber);

    if (!parsed) {
      return phoneNumber;
    }

    // Obtém informações do número
    const countryCode = parsed.country;
    const flag = getCountryFlag(countryCode);

    // Formata o número no formato internacional
    let formattedNumber = parsed.formatInternational();

    // Remove o código de país do início para melhor visualização
    // Mantém apenas se não for Brasil (para consistência com o formato atual)
    if (countryCode === 'BR') {
      // Para Brasil, remove o +55 e formata no padrão nacional
      formattedNumber = parsed.formatNational();
    }

    // Se precisar ocultar parte do número (LGPD)
    if (hidePartial) {
      formattedNumber = hidePhoneDigits(formattedNumber);
    }

    // Retorna com a bandeira
    return flag ? `${flag} ${formattedNumber}` : formattedNumber;

  } catch (error) {
    console.error('Erro ao formatar número com bandeira:', error);
    // Em caso de erro, retorna o número original
    return phoneNumber;
  }
};

/**
 * Oculta parte dos dígitos do número para conformidade com LGPD
 * @param {string} formattedNumber - Número já formatado
 * @returns {string} Número com dígitos ocultados
 */
const hidePhoneDigits = (formattedNumber) => {
  // Remove todos os caracteres não numéricos para trabalhar apenas com dígitos
  const digitsOnly = formattedNumber.replace(/\D/g, '');

  if (digitsOnly.length < 4) {
    return formattedNumber; // Número muito curto, não oculta
  }

  // Mantém os 2 primeiros e 2 últimos dígitos, oculta o meio
  const firstTwo = digitsOnly.slice(0, 2);
  const lastTwo = digitsOnly.slice(-2);

  // Reconstrói mantendo a formatação original mas substituindo dígitos do meio
  let result = formattedNumber;
  let digitsToHide = digitsOnly.length - 4;

  // Estratégia simples: substitui uma sequência de dígitos por asteriscos
  // Mantém parênteses, espaços e hífens
  const pattern = /(\d{2})([\d\s\-\(\)]+)(\d{2})/;
  const match = formattedNumber.match(pattern);

  if (match) {
    const middle = match[2].replace(/\d/g, '*');
    result = formattedNumber.replace(pattern, `$1${middle}$3`);
  }

  return result;
};

/**
 * Função auxiliar para obter apenas o código do país de um número
 * @param {string} phoneNumber - Número de telefone
 * @returns {string|null} Código do país (ex: 'BR', 'US') ou null se inválido
 */
export const getPhoneCountryCode = (phoneNumber) => {
  try {
    let cleanNumber = String(phoneNumber).replace('@c.us', '').replace('@s.whatsapp.net', '').trim();

    if (!cleanNumber.startsWith('+')) {
      cleanNumber = '+' + cleanNumber;
    }

    if (isValidPhoneNumber(cleanNumber)) {
      const parsed = parsePhoneNumber(cleanNumber);
      return parsed ? parsed.country : null;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export default formatPhoneWithCountryFlag;
