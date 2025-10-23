import React from 'react'
import PropTypes from 'prop-types'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { useCurrencyContext } from '../../context/Currency/CurrencyContext'

const getDefaultMaskOptions = (currency) => ({
    prefix: currency?.symbol || 'R$',
    suffix: '',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: currency?.code === 'USD' ? ',' : '.',
    allowDecimal: true,
    decimalSymbol: currency?.code === 'USD' ? '.' : ',',
    decimalLimit: 2, // how many digits allowed after the decimal
    integerLimit: 7, // limit length of integer numbers
    allowNegative: false,
    allowLeadingZeroes: false,
})

const CurrencyInput = ({ maskOptions, ...inputProps }) => {
    const { currency } = useCurrencyContext()

    const defaultMaskOptions = getDefaultMaskOptions(currency)
    const currencyMask = createNumberMask({
        ...defaultMaskOptions,
        ...maskOptions,
    })

    return <MaskedInput mask={currencyMask} {...inputProps} />
}

CurrencyInput.defaultProps = {
    inputMode: 'numeric',
    maskOptions: {},
}

CurrencyInput.propTypes = {
    inputmode: PropTypes.string,
    maskOptions: PropTypes.shape({
        prefix: PropTypes.string,
        suffix: PropTypes.string,
        includeThousandsSeparator: PropTypes.bool,
        thousandsSeparatorSymbol: PropTypes.string,
        allowDecimal: PropTypes.bool,
        decimalSymbol: PropTypes.string,
        decimalLimit: PropTypes.string,
        requireDecimal: PropTypes.bool,
        allowNegative: PropTypes.bool,
        allowLeadingZeroes: PropTypes.bool,
        integerLimit: PropTypes.number,
    }),
}

export default CurrencyInput
