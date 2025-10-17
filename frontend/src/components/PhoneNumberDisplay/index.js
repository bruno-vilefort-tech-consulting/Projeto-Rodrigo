import React from "react";
import ReactCountryFlag from "react-country-flag";
import { parsePhoneNumber } from "libphonenumber-js";
import { Box, Tooltip } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";

/**
 * Valida se um número de telefone é potencialmente válido
 * @param {string} number - Número a ser validado
 * @returns {object} { isValid: boolean, reason: string }
 */
const validatePhoneNumber = (number) => {
    const cleanNumber = number.toString().replace(/[^\d]/g, '');

    // Número muito curto (mínimo 8 dígitos)
    if (cleanNumber.length < 8) {
        return { isValid: false, reason: "Número muito curto (mínimo 8 dígitos)" };
    }

    // Número muito longo (máximo 15 dígitos segundo E.164)
    if (cleanNumber.length > 15) {
        return { isValid: false, reason: `Número muito longo (${cleanNumber.length} dígitos, máximo 15)` };
    }

    // Verifica se tem código de país mas começa com 0 (inválido)
    if (number.startsWith('+') && cleanNumber.match(/^\d+0/)) {
        const countryCode = cleanNumber.match(/^(\d{1,3})/)?.[1];
        if (countryCode && cleanNumber.substring(countryCode.length).startsWith('0')) {
            return { isValid: false, reason: "Número local não pode começar com 0" };
        }
    }

    return { isValid: true, reason: null };
};

/**
 * Formata número inválido de forma legível
 * @param {string} number - Número a ser formatado
 * @returns {string} Número formatado
 */
const formatInvalidNumber = (number) => {
    const cleanNumber = number.toString().replace(/[^\d]/g, '');

    // Se tem + no início, preservar
    const hasPlus = number.toString().startsWith('+');

    // Tentar extrair código do país (1-3 dígitos)
    const countryCodeMatch = cleanNumber.match(/^(\d{1,3})/);
    if (countryCodeMatch && cleanNumber.length > 3) {
        const countryCode = countryCodeMatch[1];
        const restOfNumber = cleanNumber.substring(countryCode.length);

        // Formatar o resto em grupos de 4 dígitos
        const formatted = restOfNumber.match(/.{1,4}/g)?.join(' ') || restOfNumber;

        return `${hasPlus ? '+' : ''}${countryCode} ${formatted}`;
    }

    // Se não conseguir extrair código do país, formatar em grupos de 4
    return cleanNumber.match(/.{1,4}/g)?.join(' ') || cleanNumber;
};

/**
 * Componente para exibir número de telefone formatado com bandeira do país
 * @param {string} phoneNumber - Número de telefone no formato internacional (ex: 5511999999999)
 * @param {object} style - Estilos customizados opcionais
 */
const PhoneNumberDisplay = ({ phoneNumber, style = {} }) => {
    if (!phoneNumber) {
        return null;
    }

    // Validar número
    const validation = validatePhoneNumber(phoneNumber);

    try {
        // Adiciona + no início se não tiver
        let formattedNumber = phoneNumber.toString().trim();
        if (!formattedNumber.startsWith('+')) {
            formattedNumber = '+' + formattedNumber;
        }

        // Se número é inválido, mostrar com aviso
        if (!validation.isValid) {
            const formatted = formatInvalidNumber(phoneNumber);

            return (
                <Tooltip
                    title={`⚠️ Número Inválido: ${validation.reason}. Este é um "contato fantasma" que deve ser removido.`}
                    arrow
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        style={{
                            ...style,
                            opacity: 0.7,
                            cursor: 'help'
                        }}
                    >
                        <WarningIcon
                            style={{
                                color: '#ff9800',
                                fontSize: '1.2em'
                            }}
                        />
                        <span style={{ color: '#ff9800' }}>{formatted}</span>
                    </Box>
                </Tooltip>
            );
        }

        // Parse do número usando libphonenumber-js
        const parsedNumber = parsePhoneNumber(formattedNumber);

        if (parsedNumber && parsedNumber.isValid()) {
            const countryCode = parsedNumber.country;
            const formattedPhone = parsedNumber.formatInternational();

            return (
                <Box
                    display="flex"
                    alignItems="center"
                    style={{ ...style, gap: '8px' }}
                >
                    <ReactCountryFlag
                        countryCode={countryCode}
                        svg
                        style={{
                            width: '1.5em',
                            height: '1.5em',
                            borderRadius: '2px',
                        }}
                        title={countryCode}
                    />
                    <span>{formattedPhone}</span>
                </Box>
            );
        }
    } catch (error) {
        // Se houver erro ao parsear, exibir como inválido
        console.warn('❌ Erro ao formatar número:', phoneNumber, error);
    }

    // Fallback: número inválido sem conseguir parsear
    const formatted = formatInvalidNumber(phoneNumber);

    return (
        <Tooltip
            title="⚠️ Número Inválido: Não foi possível identificar o país. Este é um 'contato fantasma' que deve ser removido."
            arrow
        >
            <Box
                display="flex"
                alignItems="center"
                gap={1}
                style={{
                    ...style,
                    opacity: 0.7,
                    cursor: 'help'
                }}
            >
                <WarningIcon
                    style={{
                        color: '#ff9800',
                        fontSize: '1.2em'
                    }}
                />
                <span style={{ color: '#ff9800' }}>{formatted}</span>
            </Box>
        </Tooltip>
    );
};

export default PhoneNumberDisplay;
