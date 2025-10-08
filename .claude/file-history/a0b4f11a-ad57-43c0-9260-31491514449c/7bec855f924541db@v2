import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Paper, Box } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    maxWidth: 800,
    margin: theme.spacing(2),
  },
}));

const TagsKanban = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Tags Kanban
          </Typography>
          <Typography variant="body1" color="textSecondary">
            A funcionalidade Kanban está temporariamente desabilitada para manutenção.
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginTop: 16 }}>
            Em breve esta funcionalidade estará disponível novamente.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
};

export default TagsKanban;
