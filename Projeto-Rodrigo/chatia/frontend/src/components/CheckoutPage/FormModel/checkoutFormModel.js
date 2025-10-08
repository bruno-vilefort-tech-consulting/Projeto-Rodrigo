import { i18n } from '../../../translate/i18n';

export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: 'subscription.checkout.form.fullName',
      requiredErrorMsg: 'subscription.checkout.form.fullNameRequired'
    },
    lastName: {
      name: 'lastName',
      label: 'subscription.checkout.form.lastName',
      requiredErrorMsg: 'subscription.checkout.form.lastNameRequired'
    },
    address1: {
      name: 'address2',
      label: 'subscription.checkout.form.address',
      requiredErrorMsg: 'subscription.checkout.form.addressRequired'
    },

    city: {
      name: 'city',
      label: 'subscription.checkout.form.city',
      requiredErrorMsg: 'subscription.checkout.form.cityRequired'
    },
    state: {
      name: 'state',
      label: 'subscription.checkout.form.state',
      requiredErrorMsg: 'subscription.checkout.form.stateRequired'
    },
    zipcode: {
      name: 'zipcode',
      label: 'subscription.checkout.form.document',
      requiredErrorMsg: 'subscription.checkout.form.documentRequired',
      invalidErrorMsg: 'subscription.checkout.form.documentInvalid'
    },
    country: {
      name: 'country',
      label: 'subscription.checkout.form.country',
      requiredErrorMsg: 'subscription.checkout.form.countryRequired'
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: 'subscription.checkout.form.useAddressForPayment'
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: 'subscription.checkout.form.nameOnCard',
      requiredErrorMsg: 'subscription.checkout.form.nameOnCardRequired'
    },
    cardNumber: {
      name: 'cardNumber',
      label: 'subscription.checkout.form.cardNumber',
      requiredErrorMsg: 'subscription.checkout.form.cardNumberRequired',
      invalidErrorMsg: 'subscription.checkout.form.cardNumberInvalid'
    },
    expiryDate: {
      name: 'expiryDate',
      label: 'subscription.checkout.form.expiryDate',
      requiredErrorMsg: 'subscription.checkout.form.expiryDateRequired',
      invalidErrorMsg: 'subscription.checkout.form.expiryDateInvalid'
    },
    cvv: {
      name: 'cvv',
      label: 'subscription.checkout.form.cvv',
      requiredErrorMsg: 'subscription.checkout.form.cvvRequired',
      invalidErrorMsg: 'subscription.checkout.form.cvvInvalid'
    }
  }
};
