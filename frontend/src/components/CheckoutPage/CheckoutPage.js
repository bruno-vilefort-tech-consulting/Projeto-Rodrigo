import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Form } from "formik";

import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";


import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";

import useStyles from "./styles";


export default function CheckoutPage(props) {
  const { t } = useTranslation();
  const steps = [t("financeiro.checkout.steps.data"), t("financeiro.checkout.steps.customize"), t("financeiro.checkout.steps.review")];
  const { formId, formField } = checkoutFormModel;



  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, ] = useState(props.Invoice.id);
  const [paymentText, setPaymentText] = useState("");
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user } = useContext(AuthContext);

  function _renderStepContent(step, setFieldValue, setActiveStep, values ) {

    switch (step) {
      case 0:
        return <AddressForm formField={formField} values={values} setFieldValue={setFieldValue}  />;
      case 1:
        return <PaymentForm 
        formField={formField} 
        setFieldValue={setFieldValue} 
        setActiveStep={setActiveStep} 
        activeStep={step} 
        invoiceId={invoiceId}
        values={values}
        />;
      case 2:
        return <ReviewOrder />;
      default:
        return <div>{t("financeiro.checkout.messages.notFound")}</div>;
    }
  }


  async function _submitForm(values, actions) {
    try {
      const plan = JSON.parse(values.plan);
      const newValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        address2: values.address2,
        city: values.city,
        state: values.state,
        zipcode: values.zipcode,
        country: values.country,
        useAddressForPaymentDetails: values.useAddressForPaymentDetails,
        nameOnCard: values.nameOnCard,
        cardNumber: values.cardNumber,
        cvv: values.cvv,
        plan: values.plan,
        price: plan.price,
        users: plan.users,
        connections: plan.connections,
        invoiceId: invoiceId
      }

      const { data } = await api.post("/subscription", newValues);
      setDatePayment(data);
      setPaymentText(t("financeiro.checkout.messages.paymentNotice"));
      window.open(data.urlMcPg, '_blank');
      actions.setSubmitting(true);
      //setActiveStep(activeStep + 1);
      toast.success(t("financeiro.checkout.messages.subscriptionSuccess"));
    } catch (err) {
      actions.setSubmitting(false);
      toastError(err);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        {t("financeiro.checkout.title")}
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              ...user, 
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                <div className={classes.buttons}>
                  {activeStep !== 1 && (
                    <Button onClick={_handleBack} className={classes.button}>
                      {t("financeiro.checkout.buttons.back")}
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        {isLastStep ? t("financeiro.checkout.buttons.pay") : t("financeiro.checkout.buttons.next")}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </div>
                {paymentText && (
  <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
    <Typography variant="h5" align="center" style={{ color: '#ff5722', fontWeight: 'bold', fontFamily: 'cursive' }}>
      {paymentText}
    </Typography>
  </div>
)}
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
