import React from 'react';
import { useFormikContext } from 'formik';
import { Typography, Grid } from '@material-ui/core';
import ShippingDetails from './ShippingDetails';
import PaymentDetails from './PaymentDetails';
import { useTranslation } from 'react-i18next';

export default function ReviewOrder() {
  const { t } = useTranslation();
  const { values: formValues } = useFormikContext();
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        {t("financeiro.checkout.review.title")}
      </Typography>
      <Grid container spacing={2}>
        <ShippingDetails formValues={formValues} />
        <PaymentDetails formValues={formValues} />
      </Grid>
    </React.Fragment>
  );
}
