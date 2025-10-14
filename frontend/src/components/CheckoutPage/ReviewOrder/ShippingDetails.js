import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';
import { useTranslation } from 'react-i18next';

function PaymentDetails(props) {
  const { t } = useTranslation();
  const { formValues } = props;
  const classes = useStyles();
  const { plan } = formValues;

  const newPlan = JSON.parse(plan);

  const { users, connections, queues } = newPlan;
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        {t("financeiro.checkout.planDetails.title")}
      </Typography>
      <Typography gutterBottom>{t("financeiro.checkout.pricing.users")}: {users}</Typography>
      <Typography gutterBottom>{t("financeiro.checkout.pricing.connection")}: {connections}</Typography>
      <Typography gutterBottom>{t("financeiro.checkout.pricing.queues")}: {queues}</Typography>
      <Typography gutterBottom>{t("financeiro.checkout.planDetails.billing")}</Typography>
    </Grid>
  );
}

export default PaymentDetails;
