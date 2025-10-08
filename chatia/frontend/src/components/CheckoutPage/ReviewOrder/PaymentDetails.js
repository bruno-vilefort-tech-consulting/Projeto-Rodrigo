import React, { useContext } from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';
import { AuthContext } from "../../../context/Auth/AuthContext";
import { useTranslation } from 'react-i18next';
import { useCurrencyContext } from "../../../context/Currency/CurrencyContext";

function PaymentDetails(props) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyContext();
  const { formValues } = props;
  const classes = useStyles();
  const { firstName, address2, city, zipcode, state, country, plan } = formValues;
  const { user } = useContext(AuthContext);


  const newPlan = JSON.parse(plan);
  const { price } = newPlan;

  return (
    <Grid item container direction="column" xs={6} sm={12}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        {t("financeiro.checkout.paymentInfo.title")}
      </Typography>
      <Grid container>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>{t("financeiro.checkout.paymentInfo.email")}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{user.email}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>{t("financeiro.checkout.paymentInfo.name")}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{firstName}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>{t("financeiro.checkout.paymentInfo.document")}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{zipcode}</Typography>
          </Grid>
        </React.Fragment>
        <React.Fragment>
          <Grid item xs={6}>
            <Typography gutterBottom>{t("financeiro.checkout.paymentInfo.total")}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>{formatCurrency(price)}</Typography>
          </Grid>
        </React.Fragment>
      </Grid>
    </Grid>
  );
}

export default PaymentDetails;
