import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Box,
  CircularProgress,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    height: "calc(100vh - 100px)",
    overflow: "auto",
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  column: {
    padding: theme.spacing(1),
    minHeight: "500px",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
  },
  columnTitle: {
    padding: theme.spacing(2),
    fontWeight: 600,
    textAlign: "center",
    backgroundColor: theme.mode === "light" ? "#f5f5f5" : "#333",
    borderRadius: "8px 8px 0 0",
    marginBottom: theme.spacing(2),
  },
  card: {
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    padding: theme.spacing(2),
  },
  contactName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  ticketId: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  statusChip: {
    marginTop: theme.spacing(1),
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKanbanData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchKanbanData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKanbanData = async () => {
    try {
      const { data } = await api.get("/tickets/kanban");
      setTickets(data.tickets || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticketId) => {
    history.push(`/tickets/${ticketId}`);
  };

  const getTicketsByStatus = (status) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  const statusColumns = [
    { key: "pending", label: i18n.t("tickets.status.pending") || "Pendentes", color: "#f59e0b" },
    { key: "open", label: i18n.t("tickets.status.open") || "Abertos", color: "#10b981" },
    { key: "closed", label: i18n.t("tickets.status.closed") || "Fechados", color: "#6b7280" },
  ];

  if (loading) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h4" gutterBottom>
          {i18n.t("kanban.title") || "Kanban"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i18n.t("kanban.subtitle") || "Visualização de tickets em formato Kanban"}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {statusColumns.map((column) => {
          const columnTickets = getTicketsByStatus(column.key);
          return (
            <Grid item xs={12} md={4} key={column.key}>
              <Paper className={classes.column} elevation={2}>
                <Typography className={classes.columnTitle}>
                  {column.label}{" "}
                  <Chip
                    size="small"
                    label={columnTickets.length}
                    style={{
                      backgroundColor: column.color,
                      color: "#fff",
                      marginLeft: 8,
                    }}
                  />
                </Typography>

                {columnTickets.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body2" color="textSecondary">
                      {i18n.t("kanban.noTickets") || "Nenhum ticket"}
                    </Typography>
                  </Box>
                ) : (
                  columnTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className={classes.card}
                      onClick={() => handleTicketClick(ticket.id)}
                    >
                      <CardContent className={classes.cardContent}>
                        <Typography className={classes.ticketId}>
                          #{ticket.id}
                        </Typography>
                        <Typography className={classes.contactName}>
                          {ticket.contact?.name || "Sem contato"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {ticket.lastMessage || "Sem mensagens"}
                        </Typography>
                        {ticket.queue && (
                          <Chip
                            label={ticket.queue.name}
                            size="small"
                            className={classes.statusChip}
                            style={{
                              backgroundColor: ticket.queue.color || "#ccc",
                              color: "#fff",
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default Kanban;
